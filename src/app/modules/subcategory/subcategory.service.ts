import { Request } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import type { IPaginationOptions, JWTPayload } from '../../../interface';
import type { IUploadFile } from '../../../interface/file';
import { prisma } from '../../../lib/prisma';
import { subcategorySearchField } from './subcategory.const';
import type {
	ISubcategoryFilter,
	SubcategoryPayload,
} from './subcategory.interface';

const ensureCategoryAndShopAccess = async (
	shopId: string,
	categoryId: string,
	user: JWTPayload
) => {
	const category = await prisma.category.findUnique({
		where: { id: categoryId },
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

	if (!category) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
	}

	if (category.shopId !== shopId) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Category does not belong to the provided shop'
		);
	}

	if (category.shop.isDeleted) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Shop is deleted');
	}

	if (user.role === 'OWNER' && category.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to access this shop subcategory'
		);
	}

	return category;
};

const createSubcategory = async (req: Request) => {
	const payload = req.body as SubcategoryPayload;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	await ensureCategoryAndShopAccess(payload.shopId, payload.categoryId, user);

	const existingSubcategory = await prisma.subcategory.findFirst({
		where: {
			categoryId: payload.categoryId,
			name: payload.name,
		},
	});

	if (existingSubcategory) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Subcategory already exists in this category'
		);
	}

	let icon = payload.icon ?? null;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		icon = uploadResult?.secure_url || null;
	}

	const result = await prisma.subcategory.create({
		data: {
			shopId: payload.shopId,
			categoryId: payload.categoryId,
			name: payload.name,
			...(payload.description !== undefined && { description: payload.description }),
			...(icon !== null && { icon }),
		},
	});

	return result;
};

const getAllSubcategories = async (
	filters: ISubcategoryFilter,
	paginationOptions: IPaginationOptions,
	user: JWTPayload
) => {
	const { searchTerm, categoryId, ...rest } = filters;

	if (!categoryId) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Category id is required');
	}

	const category = await prisma.category.findUnique({
		where: { id: categoryId },
		include: {
			shop: {
				select: {
					ownerId: true,
					isDeleted: true,
				},
			},
		},
	});

	if (!category) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
	}

	if (category.shop.isDeleted) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Shop is deleted');
	}

	if (user.role === 'OWNER' && category.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to view this category subcategories'
		);
	}

	const { limit, page, skip, sortBy, sortOrder } = paginationHelpers.calculatePagination(paginationOptions);

	const andConditions: Prisma.SubcategoryWhereInput[] = [];

	if (searchTerm) {
		andConditions.push({
			OR: subcategorySearchField.map((field) => ({
				[field]: {
					contains: searchTerm,
					mode: 'insensitive',
				},
			})),
		});
	}

	andConditions.push({
		categoryId: {
			equals: categoryId,
		},
	});

	if (Object.keys(rest).length > 0) {
		andConditions.push({
			AND: Object.keys(rest).map((key) => ({
				[key]: {
					equals: (rest as Record<string, unknown>)[key],
				},
			})),
		});
	}

	const whereConditions: Prisma.SubcategoryWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const [subcategories, total] = await Promise.all([
		prisma.subcategory.findMany({
			where: whereConditions,
			skip,
			take: limit,
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				_count: {
					select: {
						products: true,
					},
				},
			},
		}),
		prisma.subcategory.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: subcategories,
	};
};

const getSubcategoryById = async (id: string, user: JWTPayload) => {
	const subcategory = await prisma.subcategory.findUnique({
		where: { id },
		include: {
			shop: {
				select: {
					id: true,
					ownerId: true,
					name: true,
					code: true,
				},
			}
		},
	});

	if (!subcategory) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
	}

	if (user.role === 'OWNER' && subcategory.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to view this subcategory'
		);
	}

	return subcategory;
};

const updateSubcategory = async (req: Request) => {
	const id = String(req.params['id']);
	const payload = req.body as Partial<SubcategoryPayload>;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	const subcategoryData = await prisma.subcategory.findUnique({
		where: { id },
		include: {
			shop: {
				select: {
					ownerId: true,
				},
			},
		},
	});

	if (!subcategoryData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
	}

	if (user.role === 'OWNER' && subcategoryData.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to update this subcategory'
		);
	}

	const targetShopId = payload.shopId ?? subcategoryData.shopId;
	const targetCategoryId = payload.categoryId ?? subcategoryData.categoryId;

	if (
		targetShopId !== subcategoryData.shopId ||
		targetCategoryId !== subcategoryData.categoryId
	) {
		await ensureCategoryAndShopAccess(targetShopId, targetCategoryId, user);
	}

	const targetName = payload.name ?? subcategoryData.name;
	if (
		targetCategoryId !== subcategoryData.categoryId ||
		targetName !== subcategoryData.name
	) {
		const duplicateSubcategory = await prisma.subcategory.findFirst({
			where: {
				categoryId: targetCategoryId,
				name: targetName,
				id: { not: id },
			},
		});

		if (duplicateSubcategory) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Subcategory already exists in this category'
			);
		}
	}

	let icon = subcategoryData.icon;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		icon = uploadResult?.secure_url || null;
	}

	const data: Prisma.SubcategoryUpdateInput = {
		...(payload.shopId !== undefined && { shop: { connect: { id: payload.shopId } } }),
		...(payload.categoryId !== undefined && {
			category: { connect: { id: payload.categoryId } },
		}),
		...(payload.name !== undefined && { name: payload.name }),
		...(payload.description !== undefined && { description: payload.description }),
		...(payload.icon !== undefined && { icon: payload.icon }),
		...(file && { icon }),
	};

	const result = await prisma.subcategory.update({
		where: { id },
		data,
	});

	return result;
};

const deleteSubcategory = async (req: Request) => {
	const id = String(req.params['id']);
	const user = req.user as JWTPayload;

	const subcategoryData = await prisma.subcategory.findUnique({
		where: { id },
		include: {
			shop: {
				select: {
					ownerId: true,
				},
			},
			_count: {
				select: {
					products: true,
				},
			},
		},
	});

	if (!subcategoryData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
	}

	if (user.role === 'OWNER' && subcategoryData.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to delete this subcategory'
		);
	}

	if (
		subcategoryData._count.products > 0
	) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Subcategory cannot be deleted because related products exist'
		);
	}

	const result = await prisma.subcategory.delete({
		where: { id },
	});

	return result;
};

export const subcategoryService = {
	createSubcategory,
	getAllSubcategories,
	getSubcategoryById,
	updateSubcategory,
	deleteSubcategory,
};
