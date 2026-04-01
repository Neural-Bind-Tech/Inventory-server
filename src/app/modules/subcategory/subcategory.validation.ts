import { z } from 'zod';

const subcategoryBaseSchema = z.object({
	shopId: z.string().min(1, 'Shop id is required'),
	categoryId: z.string().min(1, 'Category id is required'),
	name: z.string().min(1, 'Subcategory name is required'),
	description: z.string().optional(),
	icon: z.string().optional(),
});

const createSubcategorySchema = z.object({
	body: subcategoryBaseSchema,
});

const updateSubcategorySchema = z.object({
	body: subcategoryBaseSchema.partial(),
});

export const subcategoryValidation = {
	createSubcategorySchema,
	updateSubcategorySchema,
};
