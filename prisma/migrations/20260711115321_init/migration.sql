-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('ACCESS', 'REFRESH');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'STOCK_ADJUSTMENT', 'STOCK_TRANSFER', 'PRODUCT_IMPORT', 'PRODUCT_EXPORT', 'SALE_CREATE', 'SALE_CANCEL', 'SALE_REFUND', 'PURCHASE_CREATE', 'PURCHASE_RECEIVE', 'PAYMENT_RECEIVE', 'PAYMENT_REFUND', 'EXPENSE_CREATE', 'BULK_UPDATE', 'BULK_DELETE', 'DATA_IMPORT', 'DATA_EXPORT', 'BACKUP_CREATE', 'SETTINGS_CHANGE', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_ACTIVATE', 'USER_DEACTIVATE', 'ROLE_CHANGE', 'PERMISSION_CHANGE', 'REPORT_GENERATE', 'REPORT_DOWNLOAD', 'REPORT_SHARE');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('REGULAR', 'WHOLESALE', 'VIP', 'CORPORATE');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'RECEIVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'PARTIAL_REFUND');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'PENDING', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "DiscountApplicableType" AS ENUM ('ALL', 'SPECIFIC_PRODUCTS', 'SPECIFIC_CATEGORIES', 'CUSTOMER_TYPE');

-- CreateEnum
CREATE TYPE "ReturnType" AS ENUM ('CUSTOMER_RETURN', 'SUPPLIER_RETURN');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'DAMAGED', 'EXPIRED', 'CHANGE_OF_MIND', 'SIZE_ISSUE', 'QUALITY_ISSUE', 'WRONG_SHIPMENT', 'OVERSTOCK', 'NEAR_EXPIRY', 'DAMAGED_IN_TRANSIT', 'SPECIFICATION_MISMATCH', 'OTHER');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'SHIPPED', 'RECEIVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('PRODUCT_PURCHASE', 'RENT', 'UTILITIES', 'SALARY', 'MAINTENANCE', 'TRANSPORT', 'MARKETING', 'OFFICE_SUPPLIES', 'TAXES', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "IncomeCategory" AS ENUM ('SALES', 'SERVICE', 'COMMISSION', 'RENTAL', 'INTEREST', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'MOBILE_BANKING', 'CARD', 'CHEQUE', 'OTHER');

-- CreateEnum
CREATE TYPE "DamageType" AS ENUM ('PHYSICAL', 'EXPIRY', 'THEFT', 'NATURAL_DISASTER', 'MISHANDLING', 'MANUFACTURING_DEFECT', 'OTHER');

-- CreateEnum
CREATE TYPE "DamageSeverity" AS ENUM ('TOTAL', 'PARTIAL', 'MINOR');

-- CreateEnum
CREATE TYPE "DamageStatus" AS ENUM ('REPORTED', 'INVESTIGATING', 'RESOLVED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OWNER', 'EMPLOYEE', 'SUPPLIER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('BLOCKED', 'ACTIVE', 'PENDING', 'DELETED');

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('STOCK_IN', 'STOCK_OUT', 'TRANSFER', 'ADJUSTMENT', 'DAMAGE', 'RETURN', 'SALE', 'PURCHASE');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'EXPIRY_SOON', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('INCREASE', 'DECREASE');

-- CreateEnum
CREATE TYPE "AdjustmentReason" AS ENUM ('STOCK_COUNT', 'DAMAGE', 'THEFT', 'EXPIRED', 'FOUND', 'TRANSFER', 'CORRECTION', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "lastFailedLogin" TIMESTAMP(3),
    "lastLoginIp" TEXT NOT NULL,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profilePicture" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "profilePicture" TEXT,
    "address" TEXT,
    "businessName" TEXT,
    "businessType" TEXT,
    "taxId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "profilePicture" TEXT,
    "employeeCode" TEXT NOT NULL,
    "salary" DECIMAL(10,2),
    "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emergencyName" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "emergencyRelation" TEXT NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "division" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "openingTime" TEXT,
    "closingTime" TEXT,
    "businessHours" JSONB,
    "status" "ShopStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "capacity" INTEGER,
    "managerId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_stock" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQty" INTEGER NOT NULL DEFAULT 0,
    "availableQty" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 1,
    "maxStock" INTEGER,
    "reorderPoint" INTEGER,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "barcode" TEXT,
    "qrCode" TEXT,
    "buyPrice" DECIMAL(10,2) NOT NULL,
    "sellPrice" DECIMAL(10,2),
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "thumbnail" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minStock" INTEGER NOT NULL DEFAULT 1,
    "maxStock" INTEGER,
    "reorderPoint" INTEGER,
    "avgCost" DECIMAL(10,2),
    "lastCost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "attributes" JSONB NOT NULL,
    "buyPrice" DECIMAL(10,2) NOT NULL,
    "sellPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 1,
    "maxStock" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "globalSku" TEXT,
    "barcode" TEXT,
    "qrCode" TEXT,
    "suggestedBuyPrice" DECIMAL(10,2),
    "suggestedSellPrice" DECIMAL(10,2),
    "mrp" DECIMAL(10,2),
    "manufacturer" TEXT,
    "weight" DECIMAL(10,3),
    "dimensions" JSONB,
    "thumbnail" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specifications" JSONB,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "supplierCode" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Bangladesh',
    "emergencyName" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "emergencyAddress" TEXT NOT NULL,
    "emergencyRelation" TEXT NOT NULL,
    "taxId" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "paymentTerms" TEXT,
    "creditLimit" DECIMAL(10,2),
    "status" "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalOrder" INTEGER DEFAULT 0,
    "rating" INTEGER DEFAULT 0,
    "productRating" INTEGER DEFAULT 0,
    "deliveryTimeRating" INTEGER DEFAULT 0,
    "afterServiceRating" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "area" TEXT,
    "customerType" "CustomerType" NOT NULL DEFAULT 'REGULAR',
    "membershipNo" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastVisit" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "invoiceNo" TEXT NOT NULL,
    "referenceNo" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dueAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "expectedDate" TIMESTAMP(3),

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "receivedQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "customerId" TEXT,
    "invoiceNo" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discountId" TEXT,
    "discountType" "DiscountType",
    "discountAmount" DECIMAL(10,2),
    "discountPercent" DECIMAL(5,2),
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "referenceNo" TEXT,
    "paidAmount" DECIMAL(10,2) NOT NULL,
    "dueAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "soldBy" TEXT NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'COMPLETED',
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "minPurchaseAmount" DECIMAL(10,2),
    "maxDiscountAmount" DECIMAL(10,2),
    "applicableType" "DiscountApplicableType" NOT NULL DEFAULT 'ALL',
    "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customerTypes" "CustomerType"[] DEFAULT ARRAY[]::"CustomerType"[],
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "referenceNo" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "damage_products" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "damageType" "DamageType" NOT NULL,
    "severity" "DamageSeverity" NOT NULL DEFAULT 'PARTIAL',
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "totalLoss" DECIMAL(10,2) NOT NULL,
    "isRecoverable" BOOLEAN NOT NULL DEFAULT false,
    "recoveredAmount" DECIMAL(10,2),
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "damageDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "DamageStatus" NOT NULL DEFAULT 'REPORTED',
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "damage_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_products" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "returnType" "ReturnType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" "ReturnReason" NOT NULL,
    "condition" "ProductCondition" NOT NULL DEFAULT 'GOOD',
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "referenceNo" TEXT,
    "invoiceNo" TEXT,
    "returnInvoiceNo" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerComments" TEXT,
    "refundAmount" DECIMAL(10,2),
    "refundMethod" "PaymentMethod",
    "restockingFee" DECIMAL(10,2),
    "saleDate" TIMESTAMP(3),
    "supplierId" TEXT,
    "supplierInvoiceNo" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "status" "ReturnStatus" NOT NULL DEFAULT 'PENDING',
    "returnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expectedRefundDate" TIMESTAMP(3),
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "settledAt" TIMESTAMP(3),
    "settlementMethod" "PaymentMethod",
    "settlementRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "return_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "movementType" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reference" TEXT,
    "previousStock" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "reason" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_alerts" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "threshold" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjustments" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "quantityBefore" INTEGER NOT NULL,
    "quantityAfter" INTEGER NOT NULL,
    "adjustmentQty" INTEGER NOT NULL,
    "reason" "AdjustmentReason" NOT NULL,
    "description" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "referenceNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveToken" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "deviceInfo" JSONB,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenType" "TokenType" NOT NULL,

    CONSTRAINT "ActiveToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenBlacklist" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "tokenType" "TokenType" NOT NULL,
    "userId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "blacklistedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "TokenBlacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "shopId" TEXT,
    "userId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityName" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "endpoint" TEXT,
    "method" TEXT,
    "reason" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "status" "AuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_phone_key" ON "admins"("phone");

-- CreateIndex
CREATE INDEX "admins_email_idx" ON "admins"("email");

-- CreateIndex
CREATE INDEX "admins_phone_idx" ON "admins"("phone");

-- CreateIndex
CREATE INDEX "admins_name_idx" ON "admins"("name");

-- CreateIndex
CREATE UNIQUE INDEX "owners_userId_key" ON "owners"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "owners_email_key" ON "owners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "owners_phone_key" ON "owners"("phone");

-- CreateIndex
CREATE INDEX "owners_email_idx" ON "owners"("email");

-- CreateIndex
CREATE INDEX "owners_phone_idx" ON "owners"("phone");

-- CreateIndex
CREATE INDEX "owners_name_idx" ON "owners"("name");

-- CreateIndex
CREATE INDEX "owners_taxId_idx" ON "owners"("taxId");

-- CreateIndex
CREATE INDEX "owners_address_idx" ON "owners"("address");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeCode_key" ON "employees"("employeeCode");

-- CreateIndex
CREATE INDEX "employees_email_idx" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_phone_idx" ON "employees"("phone");

-- CreateIndex
CREATE INDEX "employees_name_idx" ON "employees"("name");

-- CreateIndex
CREATE INDEX "employees_employeeCode_idx" ON "employees"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "shops_code_key" ON "shops"("code");

-- CreateIndex
CREATE INDEX "shops_code_idx" ON "shops"("code");

-- CreateIndex
CREATE INDEX "shops_city_idx" ON "shops"("city");

-- CreateIndex
CREATE INDEX "shops_name_idx" ON "shops"("name");

-- CreateIndex
CREATE INDEX "shops_address_idx" ON "shops"("address");

-- CreateIndex
CREATE INDEX "shop_stock_productId_idx" ON "shop_stock"("productId");

-- CreateIndex
CREATE INDEX "shop_stock_quantity_idx" ON "shop_stock"("quantity");

-- CreateIndex
CREATE UNIQUE INDEX "shop_stock_shopId_productId_key" ON "shop_stock"("shopId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_shopId_idx" ON "warehouses"("shopId");

-- CreateIndex
CREATE INDEX "warehouses_code_idx" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_city_idx" ON "warehouses"("city");

-- CreateIndex
CREATE INDEX "warehouses_name_idx" ON "warehouses"("name");

-- CreateIndex
CREATE INDEX "warehouses_address_idx" ON "warehouses"("address");

-- CreateIndex
CREATE INDEX "warehouse_stock_warehouseId_idx" ON "warehouse_stock"("warehouseId");

-- CreateIndex
CREATE INDEX "warehouse_stock_productId_idx" ON "warehouse_stock"("productId");

-- CreateIndex
CREATE INDEX "warehouse_stock_quantity_idx" ON "warehouse_stock"("quantity");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_stock_warehouseId_productId_key" ON "warehouse_stock"("warehouseId", "productId");

-- CreateIndex
CREATE INDEX "categories_shopId_idx" ON "categories"("shopId");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_shopId_name_key" ON "categories"("shopId", "name");

-- CreateIndex
CREATE INDEX "subcategories_categoryId_idx" ON "subcategories"("categoryId");

-- CreateIndex
CREATE INDEX "subcategories_shopId_idx" ON "subcategories"("shopId");

-- CreateIndex
CREATE INDEX "subcategories_name_idx" ON "subcategories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subcategories_categoryId_name_key" ON "subcategories"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "products_productId_key" ON "products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_qrCode_key" ON "products"("qrCode");

-- CreateIndex
CREATE INDEX "products_shopId_idx" ON "products"("shopId");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_subcategoryId_idx" ON "products"("subcategoryId");

-- CreateIndex
CREATE INDEX "products_brand_idx" ON "products"("brand");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_buyPrice_idx" ON "products"("buyPrice");

-- CreateIndex
CREATE INDEX "products_sellPrice_idx" ON "products"("sellPrice");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_barcode_key" ON "product_variants"("barcode");

-- CreateIndex
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_barcode_idx" ON "product_variants"("barcode");

-- CreateIndex
CREATE INDEX "product_variants_name_idx" ON "product_variants"("name");

-- CreateIndex
CREATE INDEX "product_variants_buyPrice_idx" ON "product_variants"("buyPrice");

-- CreateIndex
CREATE INDEX "product_variants_sellPrice_idx" ON "product_variants"("sellPrice");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_globalSku_key" ON "inventory"("globalSku");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_barcode_key" ON "inventory"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_qrCode_key" ON "inventory"("qrCode");

-- CreateIndex
CREATE INDEX "inventory_brand_idx" ON "inventory"("brand");

-- CreateIndex
CREATE INDEX "inventory_name_idx" ON "inventory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON "suppliers"("supplierCode");

-- CreateIndex
CREATE INDEX "suppliers_shopId_idx" ON "suppliers"("shopId");

-- CreateIndex
CREATE INDEX "suppliers_status_idx" ON "suppliers"("status");

-- CreateIndex
CREATE INDEX "suppliers_companyName_idx" ON "suppliers"("companyName");

-- CreateIndex
CREATE INDEX "suppliers_email_idx" ON "suppliers"("email");

-- CreateIndex
CREATE INDEX "suppliers_phone_idx" ON "suppliers"("phone");

-- CreateIndex
CREATE INDEX "suppliers_bankAccount_idx" ON "suppliers"("bankAccount");

-- CreateIndex
CREATE INDEX "suppliers_address_idx" ON "suppliers"("address");

-- CreateIndex
CREATE INDEX "suppliers_city_idx" ON "suppliers"("city");

-- CreateIndex
CREATE INDEX "suppliers_taxId_idx" ON "suppliers"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_shopId_supplierCode_key" ON "suppliers"("shopId", "supplierCode");

-- CreateIndex
CREATE UNIQUE INDEX "customers_membershipNo_key" ON "customers"("membershipNo");

-- CreateIndex
CREATE INDEX "customers_shopId_idx" ON "customers"("shopId");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_customerType_idx" ON "customers"("customerType");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "customers"("status");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "customers"("email");

-- CreateIndex
CREATE INDEX "customers_address_idx" ON "customers"("address");

-- CreateIndex
CREATE INDEX "customers_city_idx" ON "customers"("city");

-- CreateIndex
CREATE UNIQUE INDEX "customers_shopId_phone_key" ON "customers"("shopId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_invoiceNo_key" ON "purchases"("invoiceNo");

-- CreateIndex
CREATE INDEX "purchases_shopId_idx" ON "purchases"("shopId");

-- CreateIndex
CREATE INDEX "purchases_supplierId_idx" ON "purchases"("supplierId");

-- CreateIndex
CREATE INDEX "purchases_status_idx" ON "purchases"("status");

-- CreateIndex
CREATE INDEX "purchases_purchaseDate_idx" ON "purchases"("purchaseDate");

-- CreateIndex
CREATE INDEX "purchases_paidAmount_idx" ON "purchases"("paidAmount");

-- CreateIndex
CREATE INDEX "purchases_dueAmount_idx" ON "purchases"("dueAmount");

-- CreateIndex
CREATE INDEX "purchases_totalAmount_idx" ON "purchases"("totalAmount");

-- CreateIndex
CREATE INDEX "purchases_invoiceNo_idx" ON "purchases"("invoiceNo");

-- CreateIndex
CREATE INDEX "purchases_shopId_purchaseDate_status_idx" ON "purchases"("shopId", "purchaseDate", "status");

-- CreateIndex
CREATE INDEX "purchases_supplierId_status_purchaseDate_idx" ON "purchases"("supplierId", "status", "purchaseDate");

-- CreateIndex
CREATE INDEX "purchases_paymentStatus_purchaseDate_idx" ON "purchases"("paymentStatus", "purchaseDate");

-- CreateIndex
CREATE INDEX "purchases_shopId_paymentStatus_dueAmount_idx" ON "purchases"("shopId", "paymentStatus", "dueAmount");

-- CreateIndex
CREATE INDEX "purchase_items_purchaseId_idx" ON "purchase_items"("purchaseId");

-- CreateIndex
CREATE INDEX "purchase_items_productId_idx" ON "purchase_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_invoiceNo_key" ON "sales"("invoiceNo");

-- CreateIndex
CREATE INDEX "sales_shopId_idx" ON "sales"("shopId");

-- CreateIndex
CREATE INDEX "sales_customerId_idx" ON "sales"("customerId");

-- CreateIndex
CREATE INDEX "sales_soldBy_idx" ON "sales"("soldBy");

-- CreateIndex
CREATE INDEX "sales_saleDate_idx" ON "sales"("saleDate");

-- CreateIndex
CREATE INDEX "sales_status_idx" ON "sales"("status");

-- CreateIndex
CREATE INDEX "sales_paymentStatus_idx" ON "sales"("paymentStatus");

-- CreateIndex
CREATE INDEX "sales_paidAmount_idx" ON "sales"("paidAmount");

-- CreateIndex
CREATE INDEX "sales_dueAmount_idx" ON "sales"("dueAmount");

-- CreateIndex
CREATE INDEX "sales_totalAmount_idx" ON "sales"("totalAmount");

-- CreateIndex
CREATE INDEX "sales_discountAmount_idx" ON "sales"("discountAmount");

-- CreateIndex
CREATE INDEX "sales_shopId_saleDate_idx" ON "sales"("shopId", "saleDate");

-- CreateIndex
CREATE INDEX "sales_shopId_status_saleDate_idx" ON "sales"("shopId", "status", "saleDate");

-- CreateIndex
CREATE INDEX "sales_customerId_saleDate_idx" ON "sales"("customerId", "saleDate");

-- CreateIndex
CREATE INDEX "sales_soldBy_saleDate_idx" ON "sales"("soldBy", "saleDate");

-- CreateIndex
CREATE INDEX "sales_shopId_paymentStatus_saleDate_idx" ON "sales"("shopId", "paymentStatus", "saleDate");

-- CreateIndex
CREATE INDEX "sales_paymentMethod_saleDate_idx" ON "sales"("paymentMethod", "saleDate");

-- CreateIndex
CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

-- CreateIndex
CREATE INDEX "sale_items_productId_idx" ON "sale_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "discounts_code_key" ON "discounts"("code");

-- CreateIndex
CREATE INDEX "discounts_shopId_idx" ON "discounts"("shopId");

-- CreateIndex
CREATE INDEX "discounts_isActive_idx" ON "discounts"("isActive");

-- CreateIndex
CREATE INDEX "discounts_name_idx" ON "discounts"("name");

-- CreateIndex
CREATE INDEX "discounts_code_idx" ON "discounts"("code");

-- CreateIndex
CREATE INDEX "discounts_discountType_idx" ON "discounts"("discountType");

-- CreateIndex
CREATE INDEX "discounts_validFrom_validTo_idx" ON "discounts"("validFrom", "validTo");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_referenceNo_key" ON "expenses"("referenceNo");

-- CreateIndex
CREATE INDEX "expenses_shopId_idx" ON "expenses"("shopId");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_expenseDate_idx" ON "expenses"("expenseDate");

-- CreateIndex
CREATE INDEX "expenses_amount_idx" ON "expenses"("amount");

-- CreateIndex
CREATE INDEX "expenses_title_idx" ON "expenses"("title");

-- CreateIndex
CREATE INDEX "expenses_referenceNo_idx" ON "expenses"("referenceNo");

-- CreateIndex
CREATE INDEX "expenses_shopId_expenseDate_category_idx" ON "expenses"("shopId", "expenseDate", "category");

-- CreateIndex
CREATE INDEX "damage_products_shopId_idx" ON "damage_products"("shopId");

-- CreateIndex
CREATE INDEX "damage_products_productId_idx" ON "damage_products"("productId");

-- CreateIndex
CREATE INDEX "damage_products_status_idx" ON "damage_products"("status");

-- CreateIndex
CREATE INDEX "damage_products_damageDate_idx" ON "damage_products"("damageDate");

-- CreateIndex
CREATE UNIQUE INDEX "return_products_returnInvoiceNo_key" ON "return_products"("returnInvoiceNo");

-- CreateIndex
CREATE INDEX "return_products_shopId_idx" ON "return_products"("shopId");

-- CreateIndex
CREATE INDEX "return_products_productId_idx" ON "return_products"("productId");

-- CreateIndex
CREATE INDEX "return_products_supplierId_idx" ON "return_products"("supplierId");

-- CreateIndex
CREATE INDEX "return_products_status_idx" ON "return_products"("status");

-- CreateIndex
CREATE INDEX "return_products_returnType_idx" ON "return_products"("returnType");

-- CreateIndex
CREATE INDEX "return_products_returnDate_idx" ON "return_products"("returnDate");

-- CreateIndex
CREATE INDEX "return_products_customerPhone_idx" ON "return_products"("customerPhone");

-- CreateIndex
CREATE INDEX "stock_movements_shopId_idx" ON "stock_movements"("shopId");

-- CreateIndex
CREATE INDEX "stock_movements_productId_idx" ON "stock_movements"("productId");

-- CreateIndex
CREATE INDEX "stock_movements_movementType_idx" ON "stock_movements"("movementType");

-- CreateIndex
CREATE INDEX "stock_movements_createdAt_idx" ON "stock_movements"("createdAt");

-- CreateIndex
CREATE INDEX "stock_movements_shopId_createdAt_movementType_idx" ON "stock_movements"("shopId", "createdAt", "movementType");

-- CreateIndex
CREATE INDEX "stock_movements_productId_createdAt_movementType_idx" ON "stock_movements"("productId", "createdAt", "movementType");

-- CreateIndex
CREATE INDEX "stock_alerts_shopId_idx" ON "stock_alerts"("shopId");

-- CreateIndex
CREATE INDEX "stock_alerts_productId_idx" ON "stock_alerts"("productId");

-- CreateIndex
CREATE INDEX "stock_alerts_alertType_idx" ON "stock_alerts"("alertType");

-- CreateIndex
CREATE INDEX "stock_alerts_isActive_idx" ON "stock_alerts"("isActive");

-- CreateIndex
CREATE INDEX "adjustments_shopId_idx" ON "adjustments"("shopId");

-- CreateIndex
CREATE INDEX "adjustments_productId_idx" ON "adjustments"("productId");

-- CreateIndex
CREATE INDEX "adjustments_type_idx" ON "adjustments"("type");

-- CreateIndex
CREATE INDEX "adjustments_createdAt_idx" ON "adjustments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ActiveToken_tokenId_key" ON "ActiveToken"("tokenId");

-- CreateIndex
CREATE INDEX "ActiveToken_userId_idx" ON "ActiveToken"("userId");

-- CreateIndex
CREATE INDEX "ActiveToken_tokenId_idx" ON "ActiveToken"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "TokenBlacklist_tokenId_key" ON "TokenBlacklist"("tokenId");

-- CreateIndex
CREATE INDEX "TokenBlacklist_tokenId_idx" ON "TokenBlacklist"("tokenId");

-- CreateIndex
CREATE INDEX "TokenBlacklist_expiresAt_idx" ON "TokenBlacklist"("expiresAt");

-- CreateIndex
CREATE INDEX "TokenBlacklist_userId_idx" ON "TokenBlacklist"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_shopId_idx" ON "audit_logs"("shopId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_entityId_idx" ON "audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_status_idx" ON "audit_logs"("status");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_createdAt_idx" ON "audit_logs"("entity", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_action_createdAt_idx" ON "audit_logs"("userId", "action", "createdAt");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owners" ADD CONSTRAINT "owners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_stock" ADD CONSTRAINT "shop_stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_stock" ADD CONSTRAINT "shop_stock_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_stock" ADD CONSTRAINT "warehouse_stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damage_products" ADD CONSTRAINT "damage_products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "damage_products" ADD CONSTRAINT "damage_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_products" ADD CONSTRAINT "return_products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_products" ADD CONSTRAINT "return_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_products" ADD CONSTRAINT "return_products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveToken" ADD CONSTRAINT "ActiveToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenBlacklist" ADD CONSTRAINT "TokenBlacklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
