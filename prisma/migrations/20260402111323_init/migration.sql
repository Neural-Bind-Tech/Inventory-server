/*
  Warnings:

  - You are about to drop the column `categoryId` on the `shop_stock` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `shop_stock` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `warehouse_stock` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `warehouse_stock` table. All the data in the column will be lost.
  - Added the required column `shopId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "shop_stock" DROP CONSTRAINT "shop_stock_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "shop_stock" DROP CONSTRAINT "shop_stock_subcategoryId_fkey";

-- DropForeignKey
ALTER TABLE "warehouse_stock" DROP CONSTRAINT "warehouse_stock_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "warehouse_stock" DROP CONSTRAINT "warehouse_stock_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "shopId" TEXT NOT NULL,
ADD COLUMN     "subcategoryId" TEXT;

-- AlterTable
ALTER TABLE "shop_stock" DROP COLUMN "categoryId",
DROP COLUMN "subcategoryId";

-- AlterTable
ALTER TABLE "warehouse_stock" DROP COLUMN "categoryId",
DROP COLUMN "subcategoryId";

-- CreateIndex
CREATE INDEX "products_shopId_idx" ON "products"("shopId");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_subcategoryId_idx" ON "products"("subcategoryId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
