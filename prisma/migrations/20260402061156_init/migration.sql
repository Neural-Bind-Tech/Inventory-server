/*
  Warnings:

  - You are about to drop the column `categoryId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `products` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `shop_stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `warehouse_stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_subcategoryId_fkey";

-- DropIndex
DROP INDEX "products_categoryId_idx";

-- DropIndex
DROP INDEX "products_categoryId_quantity_idx";

-- DropIndex
DROP INDEX "products_createdAt_idx";

-- DropIndex
DROP INDEX "products_expiryDate_quantity_idx";

-- DropIndex
DROP INDEX "products_quantity_minStock_idx";

-- DropIndex
DROP INDEX "products_subcategoryId_idx";

-- DropIndex
DROP INDEX "products_subcategoryId_quantity_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "categoryId",
DROP COLUMN "subcategoryId";

-- AlterTable
ALTER TABLE "shop_stock" ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "subcategoryId" TEXT;

-- AlterTable
ALTER TABLE "warehouse_stock" ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "subcategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "shop_stock" ADD CONSTRAINT "shop_stock_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_stock" ADD CONSTRAINT "shop_stock_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
