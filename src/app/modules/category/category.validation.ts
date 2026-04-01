import { z } from 'zod';

const categoryBaseSchema = z.object({
	shopId: z.string().min(1, 'Shop id is required'),
	name: z.string().min(1, 'Category name is required'),
	description: z.string().optional(),
	icon: z.string().optional(),
});

const createCategorySchema = z.object({
	body: categoryBaseSchema,
});

const updateCategorySchema = z.object({
	body: categoryBaseSchema.partial(),
});

export const categoryValidation = {
	createCategorySchema,
	updateCategorySchema,
};
