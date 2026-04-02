import { z } from 'zod';

const productBaseSchema = z.object({
	shopId: z.string().min(1, 'Shop id is required'),
	categoryId: z.string().optional().nullable(),
	subcategoryId: z.string().optional().nullable(),
	productId: z.string().min(1, 'Product id is required'),
	name: z.string().min(1, 'Product name is required'),
	description: z.string().optional(),
	brand: z.string().optional(),
	barcode: z.string().optional(),
	qrCode: z.string().optional(),
	buyPrice: z.union([z.number(), z.string()]),
	sellPrice: z.union([z.number(), z.string()]).optional(),
	expiryDate: z.coerce.date(),
	quantity: z.number().int().nonnegative().optional(),
	thumbnail: z.string().optional(),
	images: z.array(z.string()).optional(),
	minStock: z.number().int().positive().optional(),
	maxStock: z.number().int().positive().optional(),
	reorderPoint: z.number().int().positive().optional(),
	avgCost: z.union([z.number(), z.string()]).optional(),
	lastCost: z.union([z.number(), z.string()]).optional(),
});

const createProductSchema = z.object({
	body: productBaseSchema,
});

const updateProductSchema = z.object({
	body: productBaseSchema.partial(),
});

export const productValidation = {
	createProductSchema,
	updateProductSchema,
};
