import { z } from "zod";

const adminUpdateSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required').optional(),
        email: z.string().email('Please provide a valid email address').optional(),
        phone: z.string().min(11, 'Phone number must be at least 11 digits').optional(),
    })
});

export const adminValidation = {
    adminUpdateSchema
}