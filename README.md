# Inventory Management Server

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Database (configured in environment variables)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Neural-Bind-Tech/Inventory-server.git
cd Inventory-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the required environment variables (see `.env.example` if available).

### 4. Database Setup

```bash
# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate
```

### 5. Generate Security Keys

```bash
npm run genKey
```

### 6. Seed Database (Required)

```bash
npm run seed
```

### 7. Activate Super Admin (Required)

```bash
# Start Prisma Studio
npm run studio
```

- Navigate to the `user` table
- Change the super admin status from `PENDING` to `ACTIVE`

### 8. Start Development Server

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run prod` - Start production server
- `npm run lint:check` - Check code linting
- `npm run lint:fix` - Fix linting issues
- `npm run migrate` - Run database migrations
- `npm run generate` - Generate Prisma client
- `npm run studio` - Open Prisma Studio
- `npm run seed` - Seed database with initial data
- `npm run genKey` - Generate security key pairs

## Project Structure

This is a TypeScript-based Express.js server with Prisma ORM for database management.

## API DOCUMENTATION (POSTMAN)

https://documenter.getpostman.com/view/31237346/2sB3HhshDA
