import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import {
    IChangePassword,
    IForgotPassword,
    ILoginUser,
    IResetPassword,
} from './auth.interface';
import { prisma } from '../../../lib/prisma';
import { UserStatus } from '../../../generated/prisma/enums';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { Request } from 'express';
import { getDeviceInfo } from '../../../helpers/getDeviceInfo';
import { createPrismaToken } from '../../../helpers/createPrismaToken';
import { bcryptUtils } from '../../../helpers/bcrypt';
import { JWTPayload } from '../../../interface';
import config from '../../../config';
import { sendEmail } from '../../../helpers/sendEmail';
import { getResetPasswordEmailHtml } from '../../../const/Reset';

const loginUser = async (req: Request) => {
    const payload: ILoginUser = req.body;

    const { device, ip } = getDeviceInfo(req);

    const { phone, password } = payload;

    const user = await prisma.user.findUnique({
        where: {
            phone,
            status: UserStatus.ACTIVE,
        },
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
    }

    const isPasswordMatch =
        user.password &&
        (await bcryptUtils.comparePasswords(password, user.password));

    if (!isPasswordMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
    }

    const JwtPayload = {
        userId: user.id,
        role: user.role,
        phone: user.phone,
        ...(user.email ? { email: user.email } : {}),
    };

    const token = await jwtHelpers.generateTokenPair(JwtPayload);

    await prisma.activeToken.deleteMany({
        where: {
            userId: user.id,
        },
    });

    await prisma.user.update({
        where: {
            id: user.id,
            status: UserStatus.ACTIVE,
        },
        data: {
            loginAttempts: 0,
            lastFailedLogin: null,
            lastLoginIp: ip,
        },
    });

    await createPrismaToken({ id: user.id, tokenId: token.tokenId, ip, device });

    return {
        access: token.accessToken,
        refresh: token.refreshToken,
        user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
        },
    };
};

const changePassword = async (req: Request) => {
    const user = req.user as JWTPayload;
    const payload: IChangePassword = req.body;

    const isUserExists = await prisma.user.findUniqueOrThrow({
        where: {
            id: user.userId,
            status: 'ACTIVE',
        },
    });

    const isPasswordMatch =
        isUserExists.password &&
        (await bcryptUtils.comparePasswords(
            payload.oldPassword,
            isUserExists.password
        ));

    if (!isPasswordMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
    }

    const hashPassword = await bcryptUtils.hashedPassword(payload.newPassword);

    const result = await prisma.user.update({
        where: {
            id: user.userId,
        },
        data: {
            password: hashPassword,
        },
    });

    return result;
};

const getMe = async (user: JWTPayload) => {
    const { userId } = user;

    const result = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
            status: 'ACTIVE',
        },
        select: {
            id: true,
            phone: true,
            email: true,
            role: true,
            admin: {
                select: {
                    name: true,
                },
            },
        },
    });

    return {
        id: result.id,
        name: result.admin?.name || null,
        phone: result.phone,
        email: result.email,
        role: result.role,
    };
};

const logout = async (req: Request) => {
    const user = req.user as JWTPayload;

    await prisma.activeToken.deleteMany({
        where: {
            userId: user.userId,
        },
    });
};

const forgotPassword = async (req: Request) => {
    const payload: IForgotPassword = req.body;

    const genericMessage =
        'If an account exists with this email, a reset link has been sent.';

    const user = await prisma.user.findUnique({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE,
        },
        select: {
            id: true,
            email: true,
        },
    });

    if (!user?.email) {
        return {
            message: genericMessage,
        };
    }

    const { token: resetJwtToken } = await jwtHelpers.generateResetPasswordToken(
        user.id
    );

    const resetBaseUrl = config.frontend_url || config.reset_link || '';
    const resetLink = `${resetBaseUrl}/reset?token=${resetJwtToken}`;

    await sendEmail(user.email, getResetPasswordEmailHtml(resetLink));

    return {
        message: genericMessage,
    };
};

const resetPassword = async (req: Request) => {
    const payload: IResetPassword = req.body;

    let decodedResetToken;
    try {
        decodedResetToken = await jwtHelpers.verifyResetPasswordToken(payload.token);
    } catch {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
    }

    if (
        decodedResetToken.type !== 'RESET_PASSWORD' ||
        !decodedResetToken.userId ||
        !decodedResetToken.randomToken
    ) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired reset token');
    }

    const user = await prisma.user.findUnique({
        where: {
            id: decodedResetToken.userId,
            status: UserStatus.ACTIVE,
        },
        select: {
            id: true,
        },
    });

    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
    }

    const hashPassword = await bcryptUtils.hashedPassword(payload.newPassword);

    await prisma.$transaction([
        prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: hashPassword,
            },
        }),
        prisma.activeToken.deleteMany({
            where: {
                userId: user.id,
            },
        }),
    ]);

    return {
        message: 'Password reset successfully.',
    };
};


export const AuthService = {
    loginUser,
    changePassword,
    getMe,
    logout,
    forgotPassword,
    resetPassword,
};