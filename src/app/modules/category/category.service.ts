import { Request } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import type { IPaginationOptions, JWTPayload } from '../../../interface';
import type { IUploadFile } from '../../../interface/file';
import { prisma } from '../../../lib/prisma';
import { categorySearchField } from './category.const';
import type { CategoryPayload, ICategoryFilter } from './category.interface';

const ensureShopAccess = async (shopId: string, user: JWTPayload) => {
	
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
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to access this shop category'
		);
	}

	return shop;
};

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
	filters: ICategoryFilter,
	paginationOptions: IPaginationOptions,
	user: JWTPayload
) => {
	const { searchTerm, ...rest } = filters;
	const { limit, page, skip, sortBy, sortOrder } =
		paginationHelpers.calculatePagination(paginationOptions);

	const andConditions: Prisma.CategoryWhereInput[] = [];

	if (searchTerm) {
		andConditions.push({
			OR: categorySearchField.map((field) => ({
				[field]: {
					contains: searchTerm,
					mode: 'insensitive',
				},
			})),
		});
	}

	if (Object.keys(rest).length > 0) {
		andConditions.push({
			AND: Object.keys(rest).map((key) => ({
				[key]: {
					equals: (rest as Record<string, unknown>)[key],
				},
			})),
		});
	}

	if (user.role === 'OWNER') {
		const owner = await prisma.owner.findUnique({
			where: {
				userId: user.userId,
				isDeleted: false,
			},
			select: {
				userId: true,
			},
		});

		if (!owner) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Owner not found');
		}

		andConditions.push({
			shop: {
				ownerId: owner.userId,
				isDeleted: false,
			},
		});
	}

	const whereConditions: Prisma.CategoryWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const [categories, total] = await Promise.all([
		prisma.category.findMany({
			where: whereConditions,
			skip,
			take: limit,
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				shop: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
				_count: {
					select: {
						subcategories: true,
						products: true,
					},
				},
			},
		}),
		prisma.category.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: categories,
	};
};

const getCategoryById = async (id: string, user: JWTPayload) => {
	const category = await prisma.category.findUnique({
		where: { id },
		include: {
			shop: {
				select: {
					id: true,
					ownerId: true,
					name: true,
					code: true,
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

	if (user.role === 'OWNER' && category.shop.ownerId !== user.userId) {
		throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to view this category');
	}

	return category;
};

const getCategorySubcategories = async (id: string, user: JWTPayload) => {
	const category = await prisma.category.findUnique({
		where: { id },
		select: {
			id: true,
			shopId: true,
			shop: {
				select: {
					ownerId: true,
				},
			},
		},
	});

	if (!category) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
	}

	if (user.role === 'OWNER' && category.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to view this category subcategories'
		);
	}

	const result = await prisma.subcategory.findMany({
		where: {
			categoryId: id,
			shopId: category.shopId,
		},
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			_count: {
				select: {
					products: true,
				},
			},
		},
	});

	return result;
};

const getCategoryProducts = async (id: string, user: JWTPayload) => {
	const category = await prisma.category.findUnique({
		where: { id },
		include: {
			shop: {
				select: {
					ownerId: true,
				},
			},
		},
	});

	if (!category) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
	}

	if (user.role === 'OWNER' && category.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to view this category products'
		);
	}

	const result = await prisma.product.findMany({
		where: {
			categoryId: id,
		},
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			subcategory: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	return result;
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

	if (categoryData._count.subcategories > 0 || categoryData._count.products > 0) {
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
	getCategorySubcategories,
	getCategoryProducts,
	updateCategory,
	deleteCategory,
};
