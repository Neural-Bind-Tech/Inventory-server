// TODO: Implement warehouse.service.ts
// ...existing code...
import { Request } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import ApiError from '../../../errors/ApiError';
import { createAuditLogAsync } from '../../../helpers/auditlog';
import type { JWTPayload } from '../../../interface';
import { prisma } from '../../../lib/prisma';

type WarehousePayload = {
    shopId: string;
    name: string;
    code: string;
    description?: string;
    address: string;
    city: string;
    capacity?: number;
    managerId?: string;
    isActive?: boolean;
};

const assertCreatePayload = (payload: WarehousePayload) => {
    if (!payload.shopId) throw new ApiError(httpStatus.BAD_REQUEST, 'Shop id is required');
    if (!payload.name) throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse name is required');
    if (!payload.code) throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse code is required');
    if (!payload.address) throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse address is required');
    if (!payload.city) throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse city is required');

    if (payload.capacity !== undefined && payload.capacity < 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Capacity cannot be negative');
    }
};

const buildWarehouseCreateData = (payload: WarehousePayload): Prisma.WarehouseCreateInput => ({
    shop: {
        connect: {
            id: payload.shopId,
        },
    },
    name: payload.name,
    code: payload.code,
    address: payload.address,
    city: payload.city,
    ...(payload.description !== undefined && { description: payload.description }),
    ...(payload.capacity !== undefined && { capacity: payload.capacity }),
    ...(payload.managerId !== undefined && { managerId: payload.managerId || null }),
    ...(payload.isActive !== undefined && { isActive: payload.isActive }),
});

const createWarehouseInternal = async (req: Request, ownerOnly: boolean) => {
    const payload = req.body as WarehousePayload;
    const user = req.user as JWTPayload;

    assertCreatePayload(payload);

    const shop = await prisma.shop.findUnique({
        where: {
            id: payload.shopId,
            isDeleted: false,
        },
        select: {
            id: true,
            ownerId: true,
            name: true,
        },
    });

    if (!shop) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
    }

    if ((ownerOnly || user.role === 'OWNER') && shop.ownerId !== user.userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to create warehouse for this shop');
    }

    const codeExists = await prisma.warehouse.findFirst({
        where: {
            code: payload.code,
        },
        select: {
            id: true,
        },
    });

    if (codeExists) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse code already exists');
    }

    const result = await prisma.warehouse.create({
        data: buildWarehouseCreateData(payload),
        select: {
            id: true,
            shopId: true,
            name: true,
            code: true,
            description: true,
            address: true,
            city: true,
            capacity: true,
            managerId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    createAuditLogAsync(
        {
            userId: user.userId,
            shopId: result.shopId,
            action: 'CREATE',
            entity: 'Warehouse',
            entityId: result.id,
            entityName: result.name,
            description: 'Warehouse created',
            newValues: {
                shopId: result.shopId,
                name: result.name,
                code: result.code,
                address: result.address,
                city: result.city,
                capacity: result.capacity,
                isActive: result.isActive,
            },
        },
        req
    );

    return result;
};

const createWarehouseByAdmin = async (req: Request) => createWarehouseInternal(req, false);

const createWarehouseByOwner = async (req: Request) => createWarehouseInternal(req, true);

const updateWarehouse = async (req: Request) => {
    const id = String(req.params['id']);
    const payload = req.body as Partial<WarehousePayload>;
    const user = req.user as JWTPayload;

    if (payload.capacity !== undefined && payload.capacity < 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Capacity cannot be negative');
    }

    const warehouseData = await prisma.warehouse.findUnique({
        where: {
            id,
        },
        include: {
            shop: {
                select: {
                    id: true,
                    ownerId: true,
                    isDeleted: true,
                },
            },
        },
    });

    if (!warehouseData || warehouseData.shop.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse not found');
    }

    if (user.role === 'OWNER' && warehouseData.shop.ownerId !== user.userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to update this warehouse');
    }

    if (payload.code && payload.code !== warehouseData.code) {
        const existingWarehouse = await prisma.warehouse.findFirst({
            where: {
                code: payload.code,
                id: {
                    not: id,
                },
            },
            select: {
                id: true,
            },
        });

        if (existingWarehouse) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Warehouse code already exists');
        }
    }

    const updateData: Prisma.WarehouseUpdateInput = {
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.code !== undefined && { code: payload.code }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.address !== undefined && { address: payload.address }),
        ...(payload.city !== undefined && { city: payload.city }),
        ...(payload.capacity !== undefined && { capacity: payload.capacity }),
        ...(payload.managerId !== undefined && { managerId: payload.managerId || null }),
        ...(payload.isActive !== undefined && { isActive: payload.isActive }),
    };

    const result = await prisma.warehouse.update({
        where: {
            id,
        },
        data: updateData,
        select: {
            id: true,
            shopId: true,
            name: true,
            code: true,
            description: true,
            address: true,
            city: true,
            capacity: true,
            managerId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    createAuditLogAsync(
        {
            userId: user.userId,
            shopId: result.shopId,
            action: 'UPDATE',
            entity: 'Warehouse',
            entityId: result.id,
            entityName: result.name,
            description: 'Warehouse information updated',
            oldValues: {
                name: warehouseData.name,
                code: warehouseData.code,
                address: warehouseData.address,
                city: warehouseData.city,
                capacity: warehouseData.capacity,
                isActive: warehouseData.isActive,
            },
            newValues: {
                name: result.name,
                code: result.code,
                address: result.address,
                city: result.city,
                capacity: result.capacity,
                isActive: result.isActive,
            },
        },
        req
    );

    return result;
};

const deleteWarehouse = async (req: Request) => {
    const id = String(req.params['id']);
    const user = req.user as JWTPayload;

    const warehouseData = await prisma.warehouse.findUnique({
        where: {
            id,
        },
        include: {
            shop: {
                select: {
                    id: true,
                    ownerId: true,
                    isDeleted: true,
                },
            },
        },
    });

    if (!warehouseData || warehouseData.shop.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse not found');
    }

    if (user.role === 'OWNER' && warehouseData.shop.ownerId !== user.userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to delete this warehouse');
    }

    const result = await prisma.warehouse.delete({
        where: {
            id,
        },
        select: {
            id: true,
            shopId: true,
            name: true,
            code: true,
            address: true,
            city: true,
            capacity: true,
            isActive: true,
        },
    });

    createAuditLogAsync(
        {
            userId: user.userId,
            shopId: result.shopId,
            action: 'DELETE',
            entity: 'Warehouse',
            entityId: result.id,
            entityName: result.name,
            description: 'Warehouse deleted',
            oldValues: {
                name: warehouseData.name,
                code: warehouseData.code,
                address: warehouseData.address,
                city: warehouseData.city,
                capacity: warehouseData.capacity,
                isActive: warehouseData.isActive,
            },
        },
        req
    );

    return result;
};

const getAllWarehousesForAdmin = async () => {
    const result = await prisma.warehouse.findMany({
        where: {
            shop: {
                isDeleted: false,
            },
        },
        select: {
            id: true,
            shopId: true,
            name: true,
            code: true,
            description: true,
            address: true,
            city: true,
            capacity: true,
            managerId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            shop: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    ownerId: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return result;
};

const getWarehouseById = async (id: string, user: JWTPayload) => {
    const warehouse = await prisma.warehouse.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            shopId: true,
            name: true,
            code: true,
            description: true,
            address: true,
            city: true,
            capacity: true,
            managerId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            shop: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    ownerId: true,
                    isDeleted: true,
                },
            },
        },
    });

    if (!warehouse || warehouse.shop.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Warehouse not found');
    }

    if (user.role === 'OWNER' && warehouse.shop.ownerId !== user.userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to view this warehouse');
    }

    return warehouse;
};

const getWarehousesByShopId = async (shopId: string, user: JWTPayload) => {
    const shop = await prisma.shop.findUnique({
        where: {
            id: shopId,
            isDeleted: false,
        },
        select: {
            id: true,
            ownerId: true,
        },
    });

    if (!shop) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
    }

    if (user.role === 'OWNER' && shop.ownerId !== user.userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to view warehouses for this shop');
    }

    const result = await prisma.warehouse.findMany({
        where: {
            shopId,
        },
        select: {
            id: true,
            shopId: true,
            name: true,
            code: true,
            description: true,
            address: true,
            city: true,
            capacity: true,
            managerId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return result;
};

const getOwnerWarehouses = async (user: JWTPayload) => {
    const owner = await prisma.owner.findUnique({
        where: {
            userId: user.userId,
            isDeleted: false,
        },
        select: {
            id: true,
            userId: true,
        },
    });

    if (!owner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Owner not found');
    }

    const result = await prisma.warehouse.findMany({
        where: {
            shop: {
                ownerId: owner.userId,
                isDeleted: false,
            },
        },
        select: {
            id: true,
            shopId: true,
            name: true,
            code: true,
            description: true,
            address: true,
            city: true,
            capacity: true,
            managerId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            shop: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return result;
};

export const warehouseService = {
    createWarehouseByAdmin,
    createWarehouseByOwner,
    updateWarehouse,
    deleteWarehouse,
    getAllWarehousesForAdmin,
    getWarehouseById,
    getWarehousesByShopId,
    getOwnerWarehouses,
};
