import { z } from 'zod';

const inventoryBaseSchema = z.object({
  name: z.string().min(1, 'Inventory name is required'),
  description: z.string().optional(),
  brand: z.string().optional(),
  globalSku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  suggestedBuyPrice: z.union([z.number(), z.string()]).optional().nullable(),
  suggestedSellPrice: z.union([z.number(), z.string()]).optional().nullable(),
  mrp: z.union([z.number(), z.string()]).optional().nullable(),
  manufacturer: z.string().optional(),
  weight: z.union([z.number(), z.string()]).optional().nullable(),
  dimensions: z.unknown().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  specifications: z.unknown().optional().nullable(),
});

const createInventorySchema = z.object({
  body: inventoryBaseSchema,
});

const updateInventorySchema = z.object({
  body: inventoryBaseSchema.partial(),
});

export const inventoryValidation = {
  createInventorySchema,
  updateInventorySchema,
};
