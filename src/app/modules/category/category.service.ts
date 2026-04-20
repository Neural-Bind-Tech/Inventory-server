import { Request } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import type { JWTPayload } from '../../../interface';
import type { IUploadFile } from '../../../interface/file';
import { prisma } from '../../../lib/prisma';
import type {
	CategoryPayload,
	CategoryRelationKey,
} from './category.interface';
import { ensureShopAccess } from './category.utils';

const createCategory = async (req: Request) => {
	const payload = req.body as CategoryPayload;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	await ensureShopAccess(payload.shopId, user);

	const existingCategory = await prisma.category.findFirst({
		where: {
			shopId: payload.shopId,
			name: payload.name,
		},
	});

	if (existingCategory) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Category already exists in this shop');
	}

	let icon = payload.icon ?? null;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		icon = uploadResult?.secure_url || null;
	}

	const result = await prisma.category.create({
		data: {
			shopId: payload.shopId,
			name: payload.name,
			...(payload.description !== undefined && { description: payload.description }),
			...(icon !== null && { icon }),
		},
	});

	return result;
};

const getAllCategories = async (
	shopId: string | undefined,
	user: JWTPayload,
	validRelations?: string[]
) => {
	const includes = new Set((validRelations ?? []) as CategoryRelationKey[]);

	if (!shopId) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Shop id is required');
	}

	await ensureShopAccess(shopId, user);

	const categoryInclude: Prisma.CategoryInclude = {
		_count: {
			select: {
				subcategories: true,
				products: true,
			},
		},
	};

	if (includes.has('products')) {
		categoryInclude.products = {
			select: {
				id: true,
				productId: true,
				name: true,
				sellPrice: true,
				quantity: true,
				thumbnail: true,
				createdAt: true,
			},
		};
	}

	if (includes.has('subcategories')) {
		categoryInclude.subcategories = {
			select: {
				id: true,
				name: true,
			},
		};
	}

	const categories = await prisma.category.findMany({
		where: { shopId },
		orderBy: {
			createdAt: 'desc',
		},
		include: categoryInclude,
	});

	return categories;
};

const getCategoryById = async (id: string) => {
	const category = await prisma.category.findUnique({
		where: { id },
		include: {
			subcategories: {
				select: {
					id: true,
					name: true,
					description: true,
					createdAt: true,
				},
			},
			products: {
				select: {
					id: true,
					productId: true,
					name: true,
					sellPrice: true,
					quantity: true,
					thumbnail: true,
					createdAt: true,
				},
			},
			_count: {
				select: {
					subcategories: true,
					products: true,
				},
			},
		},
	});

	if (!category) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
	}

	return category;
};

const updateCategory = async (req: Request) => {
	
    const id = String(req.params['id']);
	const payload = req.body as Partial<CategoryPayload>;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	const categoryData = await prisma.category.findUnique({
		where: { id },
		include: {
			shop: {
				select: {
					id: true,
					ownerId: true,
				},
			},
		},
	});

	if (!categoryData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
	}

	if (user.role === 'OWNER' && categoryData.shop.ownerId !== user.userId) {
		throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to update this category');
	}

	if (payload.shopId && payload.shopId !== categoryData.shopId) {
		await ensureShopAccess(payload.shopId, user);
	}

	const targetShopId = payload.shopId ?? categoryData.shopId;
	const targetName = payload.name ?? categoryData.name;

	if (targetShopId !== categoryData.shopId || targetName !== categoryData.name) {
		const duplicateCategory = await prisma.category.findFirst({
			where: {
				shopId: targetShopId,
				name: targetName,
				id: { not: id },
			},
		});

		if (duplicateCategory) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Category already exists in this shop');
		}
	}

	let icon = categoryData.icon;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		icon = uploadResult?.secure_url || null;
	}

	const data: Prisma.CategoryUpdateInput = {
		...(payload.shopId !== undefined && { shop: { connect: { id: payload.shopId } } }),
		...(payload.name !== undefined && { name: payload.name }),
		...(payload.description !== undefined && { description: payload.description }),
		...(payload.icon !== undefined && { icon: payload.icon }),
		...(file && { icon }),
	};

	const result = await prisma.category.update({
		where: { id },
		data,
	});

	return result;
};

const deleteCategory = async (req: Request) => {
	const id = String(req.params['id']);
	const user = req.user as JWTPayload;

	const categoryData = await prisma.category.findUnique({
		where: { id },
		include: {
			shop: {
				select: {
					ownerId: true,
				},
			},
			_count: {
				select: {
					subcategories: true,
					products: true,
				},
			},
		},
	});

	if (!categoryData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
	}

	if (user.role === 'OWNER' && categoryData.shop.ownerId !== user.userId) {
		throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to delete this category');
	}

	if (
		categoryData._count.subcategories > 0 ||
		categoryData._count.products > 0
	) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Category cannot be deleted because related subcategories or products exist'
		);
	}

	const result = await prisma.category.delete({
		where: { id },
	});

	return result;
};

export const categoryService = {
	createCategory,
	getAllCategories,
	getCategoryById,
	updateCategory,
	deleteCategory,
};
