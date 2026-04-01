import { Request } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import ApiError from '../../../errors/ApiError';
import { createAuditLogAsync } from '../../../helpers/auditlog';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import type { JWTPayload } from '../../../interface';
import type { IUploadFile } from '../../../interface/file';
import { prisma } from '../../../lib/prisma';
import { ShopPayload, ShopRelationKey} from './shop.interface';


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
		select:{
			id:true,
			ownerId:true,
			name:true,
			code:true,
			description:true,
			address:true,
			phone:true,
			email:true,
			owner:{
				select:{
					name:true,
					email:true,
					phone:true
				}
			}

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
		select:{
			id:true,
			ownerId:true,
			name:true,
			code:true,
			description:true,
			address:true,
			phone:true,
			email:true,
			owner:{
				select:{
					name:true,
					email:true,
					phone:true
				}
			}
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
		}
	});

	if (!shop) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
	}

	if (user.role === 'OWNER' && shop.ownerId !== user.userId) {
		throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to view this shop');
	}

	return shop;
};

const getShopRelationsById = async (
	id: string,
	user: JWTPayload,
	validRelations?: string[]
) => {
	const includes = new Set((validRelations ?? []) as ShopRelationKey[]);
	
	const shopSelect: Prisma.ShopSelect = {
		id: true,
		ownerId: true,
		name: true,
		code: true,
		status: true,
	};

	if (includes.has('employees')) {
		shopSelect.employees = {
			where: {
				isDeleted: false,
			},
			select: {
				id: true,
				userId: true,
				name: true,
				email: true,
				phone: true,
				employeeCode: true,
				status: true,
				joiningDate: true,
			},
		};
	}

	if (includes.has('supplier')) {
		shopSelect.Supplier = {
			select: {
				id: true,
				name: true,
				companyName: true,
				supplierCode: true,
				email: true,
				phone: true,
				status: true,
				totalOrder: true,
				rating: true,
				createdAt: true,
			},
		};
	}

	if (includes.has('expense')) {
		shopSelect.Expense = {
			orderBy: {
				expenseDate: 'desc',
			},
			select: {
				id: true,
				title: true,
				category: true,
				amount: true,
				paymentMethod: true,
				expenseDate: true,
				createdAt: true,
			},
		};
	}

	if (includes.has('damageproduct')) {
		shopSelect.DamageProduct = {
			select: {
				id: true,
				productId: true,
				quantity: true,
				damageType: true,
				severity: true,
				status: true,
				totalLoss: true,
				damageDate: true,
				createdAt: true,
			},
		};
	}

	if (includes.has('returnproduct')) {
		shopSelect.ReturnProduct = {
			select: {
				id: true,
				productId: true,
				supplierId: true,
				returnType: true,
				quantity: true,
				reason: true,
				status: true,
				returnDate: true,
				createdAt: true,
			},
		};
	}

	if (includes.has('warehouse')) {
		shopSelect.Warehouse = {
			select: {
				id: true,
				name: true,
				code: true,
				city: true,
				capacity: true,
				isActive: true,
				createdAt: true,
			},
		};
	}

	if (includes.has('shopstock')) {
		shopSelect.ShopStock = {
			select: {
				id: true,
				productId: true,
				quantity: true,
				reservedQty: true,
				availableQty: true,
				minStock: true,
				reorderPoint: true,
				updatedAt: true,
			},
		};
	}

	const shop = await prisma.shop.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		select: shopSelect,
	});
	
	if (!shop) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
	}

	if (user.role === 'OWNER' && shop.ownerId !== user.userId) {
		throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to view this shop');
	}

	return {
		...shop
	};
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
		select:{
			id:true,
			ownerId:true,
			name:true,
			code:true,
			description:true,
			address:true,
			phone:true,
			email:true
		},
		orderBy: {
			createdAt: 'desc',
		},
	});

	return result;
};




export const shopService = {
	createShopByAdmin,
	createShopByOwner,
	getAllShopsForAdmin,
	getShopsByOwnerForAdmin,
	getShopById,
	getShopRelationsById,
	getOwnerShops,
};