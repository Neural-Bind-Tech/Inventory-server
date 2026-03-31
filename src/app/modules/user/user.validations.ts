import { z } from 'zod';

export const createdAdminSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    admin: z.object({
      email: z.string().email('Please provide a valid email address'),
      name: z.string().min(1, 'name is required'),
      phone: z.string().min(11, 'Phone number must be at least 11 digits')
    })
  })
});

export const createdOwnerSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    owner: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Please provide a valid email address').optional(),
      phone: z.string().min(11, 'Phone number must be at least 11 digits'),
      address: z.string().optional(),
      businessName: z.string().optional(),
      businessType: z.string().optional(),
      taxId: z.string().optional()
    })
  })
});

export const createdEmployeeSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    employee: z.object({
      shopId: z.string().min(1, 'Shop id is required'),
      name: z.string().min(1, 'Name is required'),
      employeeCode: z.string().min(1, 'Employee code is required'),
      phone: z.string().min(11, 'Phone number must be at least 11 digits'),
      email: z.string().email('Please provide a valid email address').optional(),
      salary: z.union([z.number(), z.string()]).optional(),
      joiningDate: z.string().datetime().optional(),
      emergencyName: z.string().min(1, 'Emergency contact name is required'),
      emergencyPhone: z.string().min(11, 'Emergency phone number must be at least 11 digits'),
      emergencyRelation: z.string().min(1, 'Emergency relation is required')
    })
  })
});

export const UserValidation = {
  createdAdminSchema,
  createdOwnerSchema,
  createdEmployeeSchema
};
