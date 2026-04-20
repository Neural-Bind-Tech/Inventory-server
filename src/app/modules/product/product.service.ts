import { Request } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import type { IPaginationOptions, JWTPayload } from '../../../interface';
import type { IUploadFile } from '../../../interface/file';
import { prisma } from '../../../lib/prisma';
import { productSearchField } from './product.const';
import type { IProductFilter, ProductPayload } from './product.interface';
import {
	ensureCategoryAccess,
	ensureShopAccess,
	ensureSubcategoryAccess,
} from './product.utils';

const createProduct = async (req: Request) => {
	const payload = req.body as ProductPayload;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	await ensureShopAccess(payload.shopId, user);

	if (payload.categoryId) {
		await ensureCategoryAccess(payload.categoryId, payload.shopId, user);
	}

	if (payload.subcategoryId) {
		await ensureSubcategoryAccess(
			payload.subcategoryId,
			payload.shopId,
			payload.categoryId ?? undefined,
			user
		);
	}

	const existingProduct = await prisma.product.findFirst({
		where: {
			OR: [
				{ productId: payload.productId },
				...(payload.barcode ? [{ barcode: payload.barcode }] : []),
				...(payload.qrCode ? [{ qrCode: payload.qrCode }] : []),
			],
		},
	});

	if (existingProduct) {
		throw new ApiError(
			httpStatus.BAD_REQUEST,
			'Product, barcode, or qr code already exists'
		);
	}

	let thumbnail = payload.thumbnail ?? null;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		thumbnail = uploadResult?.secure_url || null;
	}

	const result = await prisma.product.create({
		data: {
			shop: {
				connect: {
					id: payload.shopId,
				},
			},
			...(payload.categoryId ? { category: { connect: { id: payload.categoryId } } } : {}),
			...(payload.subcategoryId
				? { subcategory: { connect: { id: payload.subcategoryId } } }
				: {}),
			productId: payload.productId,
			name: payload.name,
			buyPrice: payload.buyPrice,
			expiryDate: new Date(payload.expiryDate),
			...(payload.description !== undefined && { description: payload.description }),
			...(payload.brand !== undefined && { brand: payload.brand }),
			...(payload.barcode !== undefined && { barcode: payload.barcode }),
			...(payload.qrCode !== undefined && { qrCode: payload.qrCode }),
			...(payload.sellPrice !== undefined && { sellPrice: payload.sellPrice }),
			...(payload.quantity !== undefined && { quantity: payload.quantity }),
			...(thumbnail !== null && { thumbnail }),
			...(payload.images !== undefined && { images: payload.images }),
			...(payload.minStock !== undefined && { minStock: payload.minStock }),
			...(payload.maxStock !== undefined && { maxStock: payload.maxStock }),
			...(payload.reorderPoint !== undefined && {
				reorderPoint: payload.reorderPoint,
			}),
			...(payload.avgCost !== undefined && { avgCost: payload.avgCost }),
			...(payload.lastCost !== undefined && { lastCost: payload.lastCost }),
		}
	});

	return result;
};

const getAllProducts = async (
	filters: IProductFilter,
	paginationOptions: IPaginationOptions,
	user: JWTPayload
) => {
	const { searchTerm, shopId, ...rest } = filters;

	if (!shopId) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Shop id is required');
	}

	await ensureShopAccess(shopId, user);

	const { limit, page, skip, sortBy, sortOrder } =
		paginationHelpers.calculatePagination(paginationOptions);

	const andConditions: Prisma.ProductWhereInput[] = [{ shopId }];

	if (searchTerm) {
		andConditions.push({
			OR: productSearchField.map((field) => ({
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

	const whereConditions: Prisma.ProductWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const [products, total] = await Promise.all([
		prisma.product.findMany({
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
				category: {
					select: {
						id: true,
						name: true,
					},
				},
				subcategory: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		}),
		prisma.product.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: products,
	};
};

const getProductById = async (id: string) => {
	const product = await prisma.product.findUnique({
		where: { id },
		include: {
			category: {
				select: {
					id: true,
					name: true,
				},
			},
			subcategory: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	});

	if (!product) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
	}

	return product;
};

const updateProduct = async (req: Request) => {
	const id = String(req.params['id']);
	const payload = req.body as Partial<ProductPayload>;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	const productData = await prisma.product.findUnique({
		where: { id },
		include: {
			shop: {
				select: {
					ownerId: true,
				},
			},
		},
	});

	if (!productData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
	}

	if (user.role === 'OWNER' && productData.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to update this product'
		);
	}

	const targetShopId = payload.shopId ?? productData.shopId;
	await ensureShopAccess(targetShopId, user);

	const targetCategoryId = payload.categoryId ?? productData.categoryId;
	const targetSubcategoryId = payload.subcategoryId ?? productData.subcategoryId;

	if (targetCategoryId) {
		await ensureCategoryAccess(targetCategoryId, targetShopId, user);
	}

	if (targetSubcategoryId) {
		await ensureSubcategoryAccess(
			targetSubcategoryId,
			targetShopId,
			targetCategoryId ?? undefined,
			user
		);
	}

	if (payload.productId && payload.productId !== productData.productId) {
		const duplicateProductId = await prisma.product.findFirst({
			where: {
				productId: payload.productId,
				id: { not: id },
			},
		});

		if (duplicateProductId) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Product id already exists');
		}
	}

	if (payload.barcode && payload.barcode !== productData.barcode) {
		const duplicateBarcode = await prisma.product.findFirst({
			where: {
				barcode: payload.barcode,
				id: { not: id },
			},
		});

		if (duplicateBarcode) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Barcode already exists');
		}
	}

	if (payload.qrCode && payload.qrCode !== productData.qrCode) {
		const duplicateQrCode = await prisma.product.findFirst({
			where: {
				qrCode: payload.qrCode,
				id: { not: id },
			},
		});

		if (duplicateQrCode) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Qr code already exists');
		}
	}

	let thumbnail = productData.thumbnail;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		thumbnail = uploadResult?.secure_url || null;
	}

	const data: Prisma.ProductUpdateInput = {
		...(payload.shopId !== undefined && { shop: { connect: { id: payload.shopId } } }),
		...(payload.categoryId !== undefined && {
			category:
				payload.categoryId === null
					? { disconnect: true }
					: { connect: { id: payload.categoryId } },
		}),
		...(payload.subcategoryId !== undefined && {
			subcategory:
				payload.subcategoryId === null
					? { disconnect: true }
					: { connect: { id: payload.subcategoryId } },
		}),
		...(payload.productId !== undefined && { productId: payload.productId }),
		...(payload.name !== undefined && { name: payload.name }),
		...(payload.description !== undefined && { description: payload.description }),
		...(payload.brand !== undefined && { brand: payload.brand }),
		...(payload.barcode !== undefined && { barcode: payload.barcode }),
		...(payload.qrCode !== undefined && { qrCode: payload.qrCode }),
		...(payload.buyPrice !== undefined && { buyPrice: payload.buyPrice }),
		...(payload.sellPrice !== undefined && { sellPrice: payload.sellPrice }),
		...(payload.expiryDate !== undefined && {
			expiryDate: new Date(payload.expiryDate),
		}),
		...(payload.quantity !== undefined && { quantity: payload.quantity }),
		...(payload.thumbnail !== undefined && { thumbnail: payload.thumbnail }),
		...(file && { thumbnail }),
		...(payload.images !== undefined && { images: payload.images }),
		...(payload.minStock !== undefined && { minStock: payload.minStock }),
		...(payload.maxStock !== undefined && { maxStock: payload.maxStock }),
		...(payload.reorderPoint !== undefined && {
			reorderPoint: payload.reorderPoint,
		}),
		...(payload.avgCost !== undefined && { avgCost: payload.avgCost }),
		...(payload.lastCost !== undefined && { lastCost: payload.lastCost }),
	};

	const result = await prisma.product.update({
		where: { id },
		data,
		include: {
			shop: {
				select: {
					id: true,
					name: true,
					code: true,
				},
			},
			category: {
				select: {
					id: true,
					name: true,
				},
			},
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

const deleteProduct = async (req: Request) => {
	const id = String(req.params['id']);
	const user = req.user as JWTPayload;

	const productData = await prisma.product.findUnique({
		where: { id },
		include: {
			shop: {
				select: {
					ownerId: true,
				},
			},
		},
	});

	if (!productData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
	}

	if (user.role === 'OWNER' && productData.shop.ownerId !== user.userId) {
		throw new ApiError(
			httpStatus.FORBIDDEN,
			'You are not allowed to delete this product'
		);
	}

	try {
		const result = await prisma.product.delete({
			where: { id },
		});

		return result;
	} catch (error) {
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === 'P2003'
		) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Product cannot be deleted because related records exist'
			);
		}

		throw error;
	}
};

export const productService = {
	createProduct,
	getAllProducts,
	getProductById,
	updateProduct,
	deleteProduct,
};
