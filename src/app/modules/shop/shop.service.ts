import { Request } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import ApiError from '../../../errors/ApiError';
import { createAuditLogAsync } from '../../../helpers/auditlog';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import type { JWTPayload } from '../../../interface';
import type { IUploadFile } from '../../../interface/file';
import { prisma } from '../../../lib/prisma';
import { ShopPayload, WarehousePayload } from './shop.interface';

const buildShopCreateData = (
	payload: ShopPayload,
	ownerId: string,
	logo: string | null
): Prisma.ShopCreateInput => {
	return {
		owner: {
			connect: {
				userId: ownerId,
			},
		},
		name: payload.name,
		code: payload.code,
		phone: payload.phone,
		address: payload.address,
		city: payload.city,
		country: payload.country,
		...(payload.description !== undefined && { description: payload.description }),
		...(logo !== null && { logo }),
		...(payload.email !== undefined && { email: payload.email }),
		...(payload.website !== undefined && { website: payload.website }),
		...(payload.division !== undefined && { division: payload.division }),
		...(payload.zipCode !== undefined && { zipCode: payload.zipCode }),
		...(payload.latitude !== undefined && { latitude: payload.latitude }),
		...(payload.longitude !== undefined && { longitude: payload.longitude }),
		...(payload.openingTime !== undefined && { openingTime: payload.openingTime }),
		...(payload.closingTime !== undefined && { closingTime: payload.closingTime }),
		...(payload.businessHours !== undefined && {
			businessHours: payload.businessHours,
		}),
		...(payload.status !== undefined && { status: payload.status }),
	};
};

const createShopByAdmin = async (req: Request) => {
	const payload = req.body as ShopPayload;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	if (!payload.ownerId) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Owner id is required');
	}

	const owner = await prisma.owner.findFirst({
		where: {
			isDeleted: false,
			OR: [{ userId: payload.ownerId }, { id: payload.ownerId }],
		},
	});

	if (!owner) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Owner not found');
	}

	let logo = payload.logo ?? null;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		logo = uploadResult?.secure_url || null;
	}

	const result = await prisma.shop.create({
		data: buildShopCreateData(payload, owner.userId, logo),
	});

	createAuditLogAsync(
		{
			userId: user.userId,
			shopId: result.id,
			action: 'CREATE',
			entity: 'Shop',
			entityId: result.id,
			entityName: result.name,
			description: 'Shop created by admin or super admin',
			newValues: {
				ownerId: result.ownerId,
				name: result.name,
				code: result.code,
				phone: result.phone,
				city: result.city,
				country: result.country,
			},
		},
		req
	);

	return result;
};

const createShopByOwner = async (req: Request) => {
	const payload = req.body as ShopPayload;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	const owner = await prisma.owner.findUnique({
		where: {
			userId: user.userId,
			isDeleted: false,
		},
	});

	if (!owner) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Owner not found');
	}

	let logo = payload.logo ?? null;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		logo = uploadResult?.secure_url || null;
	}

	const result = await prisma.shop.create({
		data: buildShopCreateData(payload, owner.userId, logo),
	});

	createAuditLogAsync(
		{
			userId: user.userId,
			shopId: result.id,
			action: 'CREATE',
			entity: 'Shop',
			entityId: result.id,
			entityName: result.name,
			description: 'Shop created by owner',
			newValues: {
				ownerId: result.ownerId,
				name: result.name,
				code: result.code,
				phone: result.phone,
				city: result.city,
				country: result.country,
			},
		},
		req
	);

	return result;
};

const getAllShopsForAdmin = async () => {
	const result = await prisma.shop.findMany({
		where: {
			isDeleted: false,
		},
		include: {
			owner: {
				select: {
					userId: true,
					name: true,
					email: true,
					phone: true,
				},
			},
			Warehouse: {
				select: {
					id: true,
					name: true,
					code: true,
					address: true,
					city: true,
					capacity: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return result;
};

const getShopsByOwnerForAdmin = async (ownerId: string) => {
	const owner = await prisma.owner.findFirst({
		where: {
			isDeleted: false,
			OR: [{ userId: ownerId }, { id: ownerId }],
		},
	});

	if (!owner) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Owner not found');
	}

	const result = await prisma.shop.findMany({
		where: {
			ownerId: owner.userId,
			isDeleted: false,
		},
		include: {
			owner: {
				select: {
					id: true,
					userId: true,
					name: true,
					email: true,
					phone: true,
				},
			},
			Warehouse: {
				select: {
					id: true,
					name: true,
					code: true,
					address: true,
					city: true,
					capacity: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return result;
};

const getShopById = async (id: string, user: JWTPayload) => {
	const shop = await prisma.shop.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			owner: {
				select: {
					id: true,
					userId: true,
					name: true,
					email: true,
					phone: true,
				},
			},
			Warehouse: {
				select: {
					id: true,
					name: true,
					code: true,
					address: true,
					city: true,
					capacity: true
				},
			},
		},
	});

	if (!shop) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
	}

	if (user.role === 'OWNER' && shop.ownerId !== user.userId) {
		throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to view this shop');
	}

	return shop;
};

const getOwnerShops = async (user: JWTPayload) => {
	const owner = await prisma.owner.findUnique({
		where: {
			userId: user.userId,
			isDeleted: false,
		},
	});

	if (!owner) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Owner not found');
	}

	const result = await prisma.shop.findMany({
		where: {
			ownerId: owner.userId,
			isDeleted: false,
		},
		include: {
			Warehouse: {
				select: {
					id: true,
					name: true,
					code: true,
					address: true,
					city: true,
					capacity: true
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return result;
};

const createWarehouseUnderShop = async (req: Request) => {
	const payload = req.body as WarehousePayload;
	const user = req.user as JWTPayload;

	const shop = await prisma.shop.findUnique({
		where: {
			id: payload.shopId,
			isDeleted: false,
		},
	});

	if (!shop) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
	}

	if (user.role === 'OWNER' && shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to create warehouse in this shop'
		);
	}

	const result = await prisma.warehouse.create({
		data: {
			shopId: payload.shopId,
			name: payload.name,
			code: payload.code,
			...(payload.description !== undefined && {
				description: payload.description,
			}),
			address: payload.address,
			city: payload.city,
			...(payload.capacity !== undefined && { capacity: payload.capacity }),
			...(payload.managerId !== undefined && { managerId: payload.managerId }),
			...(payload.isActive !== undefined && { isActive: payload.isActive }),
		},
	});

	createAuditLogAsync(
		{
			userId: user.userId,
			shopId: payload.shopId,
			action: 'CREATE',
			entity: 'Warehouse',
			entityId: result.id,
			entityName: result.name,
			description: 'Warehouse created under shop',
			newValues: {
				shopId: result.shopId,
				name: result.name,
				code: result.code,
				address: result.address,
				city: result.city,
			},
		},
		req
	);

	return result;
};

export const shopService = {
	createShopByAdmin,
	createShopByOwner,
	createWarehouseUnderShop,
	getAllShopsForAdmin,
	getShopsByOwnerForAdmin,
	getShopById,
	getOwnerShops,
};