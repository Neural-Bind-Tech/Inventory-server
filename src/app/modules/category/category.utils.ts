import ApiError from "../../../errors/ApiError";
import { JWTPayload } from "../../../interface";
import { prisma } from "../../../lib/prisma";
import httpStatus from 'http-status';

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
			'You are not allowed to access this shop category'
		);
	}

	return shop;
};