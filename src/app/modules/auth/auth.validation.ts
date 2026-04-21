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

const forgotPasswordZodSchema = z.object({
    body: z.object({
        email: z.email({
            error: 'Valid email is required',
        }),
    }),
});

const resetPasswordZodSchema = z.object({
    body: z.object({
        token: z.string({
            error: 'Reset token is required',
        }),
        newPassword: z.string({
            error: 'New password is required',
        }).min(6, 'Password must be at least 6 characters'),
    }),
});

export const AuthValidation = {
    loginZodSchema,
    verifyZodSchema,
    refreshTokenZodSchema,
    changePasswordZodSchema,
    forgotPasswordZodSchema,
    resetPasswordZodSchema,
};