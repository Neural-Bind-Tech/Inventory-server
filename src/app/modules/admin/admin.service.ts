import { Prisma } from '../../../generated/prisma/client'
import { UserStatus } from '../../../generated/prisma/enums'
import type { IPaginationOptions } from '../../../interface/common'
import { IAdminFilter } from './admin.interface'
import { adminSearchField } from "./admin.const";
import { prisma } from '../../../lib/prisma'
import { paginationHelpers } from "../../../helpers/paginationHelper";
import ApiError from "../../../errors/ApiError";
import httpStatus from 'http-status'
import { JWTPayload } from '../../../interface'
import { IUploadFile } from '../../../interface/file'
import { FileUploadHelper } from "../../../helpers/fileUploadHelper";
import { createAuditLogAsync } from "../../../helpers/auditlog";
import { Request } from "express";

const getAllAdmin = async (filters: IAdminFilter, paginationOptions: IPaginationOptions) => {

    const { searchTerm, isDeleted, ...rest } = filters
    const { limit, page, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(paginationOptions)

    const andConditions: Prisma.AdminWhereInput[] = []

    andConditions.push({
        isDeleted: isDeleted === 'true' ? true : false
    })

    if (searchTerm) {
        andConditions.push({
            OR: adminSearchField.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            }))
        });
    }

    if (Object.keys(rest).length > 0) {
        andConditions.push({
            AND: Object.keys(rest).map(key => ({
                [key]: {
                    equals: (rest as any)[key]
                }
            }))
        })
    }

    const whereConditions: Prisma.AdminWhereInput = { AND: andConditions }

    const [admin, total] = await Promise.all([
        prisma.admin.findMany({
            where: whereConditions,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            }
        }),
        prisma.admin.count({ where: whereConditions })
    ]);

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
        data: admin
    };

}

const getAdminById = async (id: string) => {

    const result = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false
        }
    })

    if (!result) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found')
    }

    return result
}


const updateAdmin = async (req: Request) => {

    const id = String(req.params['id'])
    const payload = req.body
    const file = req.file as IUploadFile;
    const user = req.user as JWTPayload

    const userData = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false
        }
    })

    if (!userData) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Admin not found')
    }

    if (user.role !== 'SUPER_ADMIN') {
        if (userData?.userId !== user.userId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "You can't update another's info")
        }
    }

    // Check for duplicate email/phone if they are being updated
    if (payload.email && payload.email !== userData.email) {

        const existingEmailUser = await prisma.user.findUnique({
            where: { email: payload.email, status: 'ACTIVE' }
        });
        if (existingEmailUser) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Email already registered')
        }

        const existingEmailAdmin = await prisma.admin.findFirst({
            where: {
                email: payload.email,
                isDeleted: false,
                id: { not: id }
            }
        });
        if (existingEmailAdmin) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Email already registered')
        }
    }

    if (payload.phone && payload.phone !== userData.phone) {
        const existingPhoneUser = await prisma.user.findUnique({
            where: { phone: payload.phone }
        });
        if (existingPhoneUser) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already registered')
        }

        const existingPhoneAdmin = await prisma.admin.findFirst({
            where: {
                phone: payload.phone,
                isDeleted: false,
                id: { not: id }
            }
        });
        if (existingPhoneAdmin) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already registered')
        }
    }

    let profilePicture = userData.profilePicture;
    if (file) {
        const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
        profilePicture = uploadResult?.secure_url || null;
    }

    const updateData = {
        ...payload,
        ...(profilePicture && { profilePicture })
    };


    const userUpdateData: { email?: string; phone?: string } = {};
    if (payload.email && payload.email !== userData.email) {
        userUpdateData.email = payload.email;
    }
    if (payload.phone && payload.phone !== userData.phone) {
        userUpdateData.phone = payload.phone;
    }


    const result = await prisma.$transaction(async (tx) => {
        // Update admin table
        const updatedAdmin = await tx.admin.update({
            where: {
                id,
                isDeleted: false
            },
            data: updateData
        });


        if (Object.keys(userUpdateData).length > 0) {
            await tx.user.update({
                where: {
                    id: userData.userId
                },
                data: userUpdateData
            });
        }

        return updatedAdmin;
    });

    // Log admin update
    createAuditLogAsync({
        userId: user.userId,
        action: 'UPDATE',
        entity: 'Admin',
        entityId: id,
        entityName: userData.name,
        description: 'Admin information updated',
        oldValues: {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            profilePicture: userData.profilePicture
        },
        newValues: {
            name: payload.name || userData.name,
            email: payload.email || userData.email,
            phone: payload.phone || userData.phone,
            profilePicture: result.profilePicture
        }
    }, req);


    return result
}

const deleteAdmin = async (req: Request) => {

    const id = String(req.params['id'])
    const user = req.user as JWTPayload

    const adminData = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false
        }
    })

    if (!adminData) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found')
    }

    const result = await prisma.$transaction(async (tx) => {

        const admin = await tx.admin.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        })

        await tx.user.update({
            where: {
                id: adminData.userId
            },
            data: {
                status: UserStatus.DELETED
            }
        })

        return admin

    })

    // Log admin deletion
    createAuditLogAsync({
        userId: user.userId,
        action: 'DELETE',
        entity: 'Admin',
        entityId: id,
        entityName: adminData.name,
        description: 'Admin soft deleted',
        oldValues: {
            name: adminData.name,
            email: adminData.email,
            phone: adminData.phone,
            isDeleted: false
        },
        newValues: {
            name: adminData.name,
            email: adminData.email,
            phone: adminData.phone,
            isDeleted: true
        }
    }, req);


    return result
}

const undoDeleteAdmin = async (req: Request) => {

    const id = String(req.params['id'])
    const user = req.user as JWTPayload

    const adminData = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: true
        }
    })

    if (!adminData) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Deleted admin not found')
    }

    const result = await prisma.$transaction(async (tx) => {
        const admin = await tx.admin.update({
            where: {
                id
            },
            data: {
                isDeleted: false,
                deletedAt: null
            }
        })

        await tx.user.update({
            where: {
                id: adminData.userId
            },
            data: {
                status: UserStatus.ACTIVE
            }
        })

        return admin
    })

    // Log admin restoration
    createAuditLogAsync({
        userId: user.userId,
        action: 'UPDATE',
        entity: 'Admin',
        entityId: id,
        entityName: adminData.name,
        description: 'Admin restored from soft delete',
        oldValues: {
            name: adminData.name,
            email: adminData.email,
            phone: adminData.phone,
            isDeleted: true
        },
        newValues: {
            name: adminData.name,
            email: adminData.email,
            phone: adminData.phone,
            isDeleted: false
        }
    }, req);


    return result
}

export const adminService = {
    getAllAdmin,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    undoDeleteAdmin
}