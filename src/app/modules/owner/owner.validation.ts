import { z } from 'zod';

const ownerUpdateSchema = z.object({
	body: z.object({
		name: z.string().min(1, 'Name is required').optional(),
		email: z.string().email('Please provide a valid email address').optional(),
		phone: z.string().min(11, 'Phone number must be at least 11 digits').optional(),
		address: z.string().optional(),
		businessName: z.string().optional(),
		businessType: z.string().optional(),
		taxId: z.string().optional(),
	}),
});

export const ownerValidation = {
	ownerUpdateSchema,
};
