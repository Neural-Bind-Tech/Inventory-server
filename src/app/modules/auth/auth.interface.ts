import { UserRole } from "../../../generated/prisma/enums";

export type ILoginUser = {
    phone: string;
    password: string;
};

export type ILoginUserResponse = {
    accessToken: string;
    refreshToken?: string;
    needPasswordChange: boolean;
};

export type IRefreshTokenResponse = {
    accessToken: string;
};

export type IVerifiedLoginUser = {
    userId: string;
    role: UserRole;
};

export type IChangePassword = {
    oldPassword: string;
    newPassword: string;
};