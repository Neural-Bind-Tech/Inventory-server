import { z } from 'zod';

const createWarehouseZodSchema = z.object({
    body: z.object({
        shopId: z.string({
            error: 'Shop id is required',
        }),
        name: z.string({
            error: 'Warehouse name is required',
        }),
        code: z.string({
            error: 'Warehouse code is required',
        }),
        description: z.string().optional(),
        address: z.string({
            error: 'Warehouse address is required',
        }),
        city: z.string({
            error: 'Warehouse city is required',
        }),
        capacity: z.number().int().nonnegative().optional(),
        managerId: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

const updateWarehouseZodSchema = z.object({
    body: z.object({
        shopId: z.string().optional(),
        name: z.string().optional(),
        code: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        capacity: z.number().int().nonnegative().optional(),
        managerId: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

const warehouseIdParamZodSchema = z.object({
    params: z.object({
        id: z.string({
            error: 'Warehouse id is required',
        }),
    }),
});

const shopIdParamZodSchema = z.object({
    params: z.object({
        shopId: z.string({
            error: 'Shop id is required',
        }),
    }),
});

export const warehouseValidation = {
    createWarehouseZodSchema,
    updateWarehouseZodSchema,
    warehouseIdParamZodSchema,
    shopIdParamZodSchema,
};
