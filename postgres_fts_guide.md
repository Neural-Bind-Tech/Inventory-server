# PostgreSQL Full-Text Search with Prisma & Express

A reusable guide for adding full-text search (FTS) to any Prisma + PostgreSQL project using `tsvector`, GIN indexes, and fuzzy matching via `pg_trgm`.

> **Example used throughout:** `users` table with `name` and `phone` fields.

---

## Overview

This approach combines three search strategies ranked by precision:

| Priority | Strategy | Example match |
|---|---|---|
| 1 | Exact / prefix LIKE | `"john"` → `"john"`, `"john doe"` |
| 2 | Fuzzy similarity (`pg_trgm`) | `"jon"` → `"john"` |
| 3 | Full-text (`tsvector`) | `"doe"` → `"John Doe"` |

---

## Step 1 — Update Prisma Schema

Add the `tsvector` column using `Unsupported("tsvector")` since Prisma does not have a native type for it. Mark it optional (`?`) so Prisma does not require it on create/update.

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  phone        String   @unique
  password     String
  createdAt    DateTime @default(now())
  searchVector Unsupported("tsvector")?   // ← add this

  @@index([name])
  @@index([phone])
  @@index([name, phone])

  @@map("users")
}
```

> **General rule:** For any model, add `searchVector Unsupported("tsvector")?` and `@@map` to the lowercase table name. The column name must be camelCase to match Prisma's convention.

Then generate and apply the migration:

```bash
npx prisma migrate dev --name add_search_vector_column
```

---

## Step 2 — Create the FTS Migration

Create a new **empty** migration file (do not edit any existing migration):

```bash
npx prisma migrate dev --name search_vector_setup --create-only
```

Open the newly generated `.sql` file and paste the following. **Replace `users`, `name`, and `phone` with your own table/column names.**

```sql
-- 1. Enable fuzzy search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Populate searchVector for all existing rows
UPDATE users
SET "searchVector" =
  setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(phone, '')), 'B');

-- 3. Create GIN index for fast FTS queries
CREATE INDEX users_search_vector_idx ON users USING GIN("searchVector");

-- 4. Function to auto-update searchVector on insert/update
CREATE OR REPLACE FUNCTION update_user_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.phone, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach trigger to the table
CREATE TRIGGER users_search_vector_trigger
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_user_search_vector();
```

### What each block does

**1. `pg_trgm` extension**
Enables trigram-based fuzzy matching (e.g. `"jon"` matches `"john"`). Required for `similarity()` in the search query.

**2. `UPDATE` (populate existing rows)**
When the column is first added it is `NULL` for all existing rows. This fills them in immediately. Without this, only newly inserted rows would be searchable.

**3. GIN index**
GIN (Generalized Inverted Index) is the correct index type for `tsvector`. It makes FTS queries fast — without it every search does a full table scan.

**4. Trigger function**
`NEW` refers to the row being inserted or updated. Every time `name` or `phone` changes, this recalculates `searchVector` automatically so it never goes stale.

**5. Trigger**
Wires the function to the table. `BEFORE INSERT OR UPDATE` means `searchVector` is already correct by the time the row is saved.

> **Why `'simple'` and not `'english'`?**
> `'simple'` tokenizes without language stemming — `"running"` stays `"running"`. This is better for names and phone numbers which are not natural language words. Use `'english'` only if you are searching prose/paragraph content.

Then apply the migration:

```bash
npx prisma migrate dev
```

---

## Step 3 — Write the Search Function

```typescript
import prisma from "../../../shared/prisma";

export const fullTextSearchUsers = async (
  searchTerm: string,
  pagination: { limit: number; page: number; skip: number }
) => {
  const { limit, page, skip } = pagination;

  const searchTermLower = searchTerm.toLowerCase();
  const startsWithPattern = `${searchTermLower}%`;
  const likePattern = `%${searchTermLower}%`;

  const users = await prisma.$queryRaw<any[]>`
    SELECT DISTINCT
      id,
      name,
      age,
      phone,
      avatar,
      "createdAt",

      CASE
        -- Exact match (highest priority)
        WHEN LOWER(name)  = ${searchTermLower} THEN 100
        WHEN LOWER(phone) = ${searchTermLower} THEN 90

        -- Prefix match
        WHEN LOWER(name)  LIKE ${startsWithPattern} THEN 85
        WHEN LOWER(phone) LIKE ${startsWithPattern} THEN 80

        -- Substring match
        WHEN LOWER(name)  LIKE ${likePattern} THEN 70
        WHEN LOWER(phone) LIKE ${likePattern} THEN 65

        -- Fuzzy match via pg_trgm
        WHEN similarity(LOWER(name),  ${searchTermLower}) > 0.3
          THEN similarity(LOWER(name), ${searchTermLower}) * 60

        WHEN similarity(LOWER(phone), ${searchTermLower}) > 0.3
          THEN similarity(LOWER(phone), ${searchTermLower}) * 55

        -- Full-text vector match (lowest priority)
        WHEN "searchVector" IS NOT NULL
          AND "searchVector" @@ plainto_tsquery('simple', ${searchTermLower})
          THEN ts_rank("searchVector", plainto_tsquery('simple', ${searchTermLower})) * 50

        ELSE 0
      END AS rank

    FROM users

    WHERE
      LOWER(name)  LIKE ${likePattern}  OR
      LOWER(phone) LIKE ${likePattern}  OR
      similarity(LOWER(name),  ${searchTermLower}) > 0.3 OR
      similarity(LOWER(phone), ${searchTermLower}) > 0.3 OR
      (
        "searchVector" IS NOT NULL AND
        "searchVector" @@ plainto_tsquery('simple', ${searchTermLower})
      )

    ORDER BY rank DESC, name ASC
    LIMIT ${limit} OFFSET ${skip};
  `;

  const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count
    FROM users
    WHERE
      LOWER(name)  LIKE ${likePattern}  OR
      LOWER(phone) LIKE ${likePattern}  OR
      similarity(LOWER(name),  ${searchTermLower}) > 0.3 OR
      similarity(LOWER(phone), ${searchTermLower}) > 0.3 OR
      (
        "searchVector" IS NOT NULL AND
        "searchVector" @@ plainto_tsquery('simple', ${searchTermLower})
      )
  `;

  const total = Number(countResult[0].count);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users.map(({ rank, ...user }) => user), // strip rank from response
  };
};
```

---

## Step 4 — Wire into Your Service

In your existing `getAllUsers` (or equivalent), branch on `searchTerm`:

```typescript
const getAllUsers = async (filters: IUserFilter, paginationOptions: IPaginationOptions) => {
  const { searchTerm, name, phone } = filters;
  const { limit, page, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(paginationOptions);

  // ✅ Use FTS when searchTerm is present
  if (searchTerm) {
    return await fullTextSearchUsers(searchTerm, { limit, page, skip });
  }

  // existing filter logic unchanged below...
};
```

---

## Fixes Applied to Your Original Code

| Location | Issue | Fix |
|---|---|---|
| Step 2 SQL | Used `'english'` dictionary for names/phones | Changed to `'simple'` — names are not language words |
| Step 2 SQL | Had duplicate `UPDATE` block at the bottom | Removed — only one `UPDATE` needed |
| Step 3 query | Used `'english'` in `plainto_tsquery` | Changed to `'simple'` to match how vectors were built |
| Step 2 SQL | Missing `CREATE EXTENSION pg_trgm` before `similarity()` use | Moved extension creation to top of migration |

---

## Common Mistakes

**Do not edit existing migration files.** Always create a new one with `--create-only`. Prisma tracks migration history by file — editing an already-applied file causes drift.

**Column name must be quoted in raw SQL.** Prisma stores camelCase columns as-is in PostgreSQL. Always write `"searchVector"` (with double quotes) in raw SQL — without quotes PostgreSQL lowercases it to `searchvector` and the column won't be found.

**Delete Prisma's auto-generated drop migrations.** If Prisma generates a migration that drops `search_vector` (snake_case), delete that file — it was cleaning up a column from an earlier failed attempt that no longer exists.
