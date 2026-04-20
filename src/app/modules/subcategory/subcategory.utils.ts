import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import type {  JWTPayload } from '../../../interface';
import { prisma } from '../../../lib/prisma';

export const ensureCategoryAndShopAccess = async (
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