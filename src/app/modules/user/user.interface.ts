import { UserRole } from "../../../generated/prisma/enums";


export type IAdmin = {
    password: string;
    admin: {
        email: string;
        name: string;
        phone: string;
    }
}

export type IOwner = {
    password: string;
    owner: {
        name: string;
        email?: string;
        phone: string;
        address?: string;
        businessName?: string;
        businessType?: string;
        taxId?: string;
    }
}

export type IEmployee = {
    password: string;
    employee: {
        shopId: string;
        name: string;
        employeeCode: string;
        phone: string;
        email?: string;
        salary?: number | string;
        joiningDate?: string;
        emergencyName: string;
        emergencyPhone: string;
        emergencyRelation: string;
    }
}

export interface IAdminSearch {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    isDeleted: boolean;
    profilePicture: string | null;
    createdAt: Date,
    updatedAt: Date,
}
