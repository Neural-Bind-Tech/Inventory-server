import { z } from 'zod';

const employeeUpdateSchema = z.object({
	body: z.object({
		shopId: z.string().optional(),
		name: z.string().min(1, 'Name is required').optional(),
		email: z.string().email('Please provide a valid email address').optional(),
		phone: z.string().min(11, 'Phone number must be at least 11 digits').optional(),
		employeeCode: z.string().min(1, 'Employee code is required').optional(),
		salary: z.union([z.number(), z.string()]).optional(),
		joiningDate: z.string().datetime().optional(),
		emergencyName: z.string().min(1, 'Emergency contact name is required').optional(),
		emergencyPhone: z.string().min(11, 'Emergency phone number must be at least 11 digits').optional(),
		emergencyRelation: z.string().min(1, 'Emergency relation is required').optional(),
	}),
});

export const employeeValidation = {
	employeeUpdateSchema,
};
