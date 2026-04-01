import { z } from 'zod';
import { ShopStatus } from '../../../generated/prisma/enums';

const shopBaseSchema = z.object({
	name: z.string().min(1, 'Shop name is required'),
	code: z.string().min(1, 'Shop code is required'),
	phone: z.string().min(11, 'Phone number must be at least 11 digits'),
	email: z.string().email('Please provide a valid email address').optional(),
	website: z.string().optional(),
	description: z.string().optional(),
	address: z.string().min(1, 'Address is required'),
	city: z.string().min(1, 'City is required'),
	division: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.string().min(1, 'Country is required'),
	latitude: z.union([z.number(), z.string()]).optional(),
	longitude: z.union([z.number(), z.string()]).optional(),
	openingTime: z.string().optional(),
	closingTime: z.string().optional(),
	businessHours: z.record(z.any()).optional(),
	status: z.nativeEnum(ShopStatus).optional(),
});

const createShopByAdminSchema = z.object({
	body: shopBaseSchema.extend({
		ownerId: z.string().min(1, 'Owner id is required'),
	}),
});

const createShopByOwnerSchema = z.object({
	body: shopBaseSchema,
});

const createWarehouseSchema = z.object({
	body: z.object({
		shopId: z.string().min(1, 'Shop id is required'),
		name: z.string().min(1, 'Warehouse name is required'),
		code: z.string().min(1, 'Warehouse code is required'),
		description: z.string().optional(),
		address: z.string().min(1, 'Address is required'),
		city: z.string().min(1, 'City is required'),
		capacity: z.number().int().positive().optional(),
		managerId: z.string().optional(),
		isActive: z.boolean().optional(),
	}),
});

export const shopValidation = {
	createShopByAdminSchema,
	createShopByOwnerSchema,
	createWarehouseSchema,
};
