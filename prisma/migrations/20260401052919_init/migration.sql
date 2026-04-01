-- DropIndex
DROP INDEX "employees_isDeleted_idx";

-- DropIndex
DROP INDEX "employees_joiningDate_idx";

-- DropIndex
DROP INDEX "employees_shopId_employeeCode_key";

-- DropIndex
DROP INDEX "employees_shopId_idx";

-- DropIndex
DROP INDEX "employees_shopId_status_joiningDate_idx";

-- DropIndex
DROP INDEX "employees_status_idx";

-- DropIndex
DROP INDEX "employees_status_lastActiveAt_idx";

-- DropIndex
DROP INDEX "employees_userId_idx";

-- DropIndex
DROP INDEX "owners_businessName_idx";

-- DropIndex
DROP INDEX "owners_businessType_idx";

-- DropIndex
DROP INDEX "users_email_status_role_idx";

-- DropIndex
DROP INDEX "users_lastFailedLogin_loginAttempts_idx";

-- DropIndex
DROP INDEX "users_phone_status_role_idx";

-- DropIndex
DROP INDEX "users_status_idx";

-- CreateTable
CREATE TABLE "shop_stock" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQty" INTEGER NOT NULL DEFAULT 0,
    "availableQty" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 1,
    "maxStock" INTEGER,
    "reorderPoint" INTEGER,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shop_stock_productId_idx" ON "shop_stock"("productId");

-- CreateIndex
CREATE INDEX "shop_stock_quantity_idx" ON "shop_stock"("quantity");

-- AddForeignKey
ALTER TABLE "shop_stock" ADD CONSTRAINT "shop_stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_stock" ADD CONSTRAINT "shop_stock_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
