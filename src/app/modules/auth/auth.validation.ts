import { z } from 'zod';

const loginZodSchema = z.object({
    body: z.object({
        phone: z.string({
            error: 'phone is required',
        }),
        password: z.string({
            error: 'Password is required',
        }),
    }),
});
const verifyZodSchema = z.object({
    body: z.object({
        otp: z.string({
            error: 'OTP is required',
        }),
    }),
});

const refreshTokenZodSchema = z.object({
    cookies: z.object({
        refreshToken: z.string({
            error: 'Refresh Token is required',
        }),
    }),
});

const changePasswordZodSchema = z.object({
    body: z.object({
        oldPassword: z.string({
            error: 'Old password  is required',
        }),
        newPassword: z.string({
            error: 'New password  is required',
        }),
    }),
});

export const AuthValidation = {
    loginZodSchema,
    verifyZodSchema,
    refreshTokenZodSchema,
    changePasswordZodSchema,
};