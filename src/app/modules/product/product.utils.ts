import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import type { JWTPayload } from '../../../interface';
import { prisma } from '../../../lib/prisma';

export const ensureShopAccess = async (shopId: string, user: JWTPayload) => {
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
			'You are not allowed to access this shop product'
		);
	}

	return shop;
};

export const ensureCategoryAccess = async (
	categoryId: string,
	shopId: string,
	user: JWTPayload
) => {
	const category = await prisma.category.findUnique({
		where: { id: categoryId },
		select: {
			id: true,
			shopId: true,
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
			'You are not allowed to access this category'
		);
	}

	return category;
};

export const ensureSubcategoryAccess = async (
	subcategoryId: string,
	shopId: string,
	categoryId: string | undefined,
	user: JWTPayload
) => {
	const subcategory = await prisma.subcategory.findUnique({
		where: { id: subcategoryId },
		select: {
			id: true,
			shopId: true,
			categoryId: true,
			shop: {
				select: {
					ownerId: true,
					isDeleted: true,
				},
			},
		},
	});

	if (!subcategory) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Subcategory not found');
	}

	if (subcategory.shopId !== shopId) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Subcategory does not belong to the provided shop'
		);
	}

	if (categoryId && subcategory.categoryId !== categoryId) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Subcategory does not belong to the provided category'
		);
	}

	if (subcategory.shop.isDeleted) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Shop is deleted');
	}

	if (user.role === 'OWNER' && subcategory.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to access this subcategory'
		);
	}

	return subcategory;
};