import { Request } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import { UserStatus } from '../../../generated/prisma/enums';
import ApiError from '../../../errors/ApiError';
import { createAuditLogAsync } from '../../../helpers/auditlog';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import type { IPaginationOptions, JWTPayload } from '../../../interface';
import type { IUploadFile } from '../../../interface/file';
import { prisma } from '../../../lib/prisma';
import { ownerSearchField } from './owner.const';
import { IOwnerFilter, OwnerPayload } from './owner.interface';

const getAllOwner = async (
	filters: IOwnerFilter,
	paginationOptions: IPaginationOptions
) => {
	const { searchTerm, isDeleted, ...rest } = filters;
	const { limit, page, skip, sortBy, sortOrder } =
		paginationHelpers.calculatePagination(paginationOptions);

	const andConditions: Prisma.OwnerWhereInput[] = [];

	andConditions.push({
		isDeleted: isDeleted === 'true' ? true : false,
	});

	if (searchTerm) {
		andConditions.push({
			OR: ownerSearchField.map((field) => ({
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

	const whereConditions: Prisma.OwnerWhereInput = { AND: andConditions };

	const [owner, total] = await Promise.all([
		prisma.owner.findMany({
			where: whereConditions,
			skip,
			take: limit,
			orderBy: {
				[sortBy]: sortOrder,
			},
			include: {
				user: {
					select: {
						id: true,
						phone: true,
						email: true,
						role: true,
						status: true,
						createdAt: true,
						updatedAt: true,
					},
				},
			},
		}),
		prisma.owner.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: owner,
	};
};

const getOwnerById = async (id: string) => {
	const result = await prisma.owner.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			shops: {
				where: {
					isDeleted: false,
				},
				select: {
					id: true,
					name: true,
					phone: true,
					email: true,
					address: true,
					createdAt: true,
					updatedAt: true,
				}
			},
		},
	});

	if (!result) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Owner not found');
	}

	return result;
};

const updateOwner = async (req: Request) => {
	const id = String(req.params['id']);
	const payload = req.body as OwnerPayload;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	const ownerData = await prisma.owner.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!ownerData) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Owner not found');
	}

	if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
		if (ownerData.userId !== user.userId) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				"You can't update another owner's info"
			);
		}
	}

	if (payload.email && payload.email !== ownerData.email) {
		const existingEmailUser = await prisma.user.findUnique({
			where: { email: String(payload.email), status: 'ACTIVE' },
		});
		if (existingEmailUser) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Email already registered');
		}

		const existingEmailOwner = await prisma.owner.findFirst({
			where: {
				email: String(payload.email),
				isDeleted: false,
				id: { not: id },
			},
		});
		if (existingEmailOwner) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Email already registered');
		}
	}

	if (payload.phone && payload.phone !== ownerData.phone) {
		const existingPhoneUser = await prisma.user.findUnique({
			where: { phone: String(payload.phone) },
		});
		if (existingPhoneUser) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Phone number already registered'
			);
		}

		const existingPhoneOwner = await prisma.owner.findFirst({
			where: {
				phone: String(payload.phone),
				isDeleted: false,
				id: { not: id },
			},
		});
		if (existingPhoneOwner) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Phone number already registered'
			);
		}
	}

	let profilePicture = ownerData.profilePicture;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		profilePicture = uploadResult?.secure_url || null;
	}

	const updateData = {
		...payload,
		...(profilePicture ? { profilePicture } : {}),
	};

	const userUpdateData: { email?: string; phone?: string } = {};
	if (payload.email && payload.email !== ownerData.email) {
		userUpdateData.email = String(payload.email);
	}
	if (payload.phone && payload.phone !== ownerData.phone) {
		userUpdateData.phone = String(payload.phone);
	}

	const result = await prisma.$transaction(async (tx) => {
		const updatedOwner = await tx.owner.update({
			where: {
				id,
				isDeleted: false,
			},
			data: updateData,
		});

		if (Object.keys(userUpdateData).length > 0) {
			await tx.user.update({
				where: { id: ownerData.userId },
				data: userUpdateData,
			});
		}

		return updatedOwner;
	});

	return result;
};

const deleteOwner = async (req: Request) => {
	const id = String(req.params['id']);
	const user = req.user as JWTPayload;

	const ownerData = await prisma.owner.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!ownerData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Owner not found');
	}

	const result = await prisma.$transaction(async (tx) => {
		const owner = await tx.owner.update({
			where: { id },
			data: {
				isDeleted: true,
			},
		});

		await tx.user.update({
			where: { id: ownerData.userId },
			data: { status: UserStatus.DELETED },
		});

		return owner;
	});

	createAuditLogAsync(
		{
			userId: user.userId,
			action: 'DELETE',
			entity: 'Owner',
			entityId: id,
			entityName: ownerData.name,
			description: 'Owner soft deleted',
			oldValues: {
				name: ownerData.name,
				email: ownerData.email,
				phone: ownerData.phone,
				isDeleted: false,
			},
			newValues: {
				name: ownerData.name,
				email: ownerData.email,
				phone: ownerData.phone,
				isDeleted: true,
			},
		},
		req
	);

	return result;
};

const undoDeleteOwner = async (req: Request) => {
	const id = String(req.params['id']);
	const user = req.user as JWTPayload;

	const ownerData = await prisma.owner.findUnique({
		where: {
			id,
			isDeleted: true,
		},
	});

	if (!ownerData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Deleted owner not found');
	}

	const result = await prisma.$transaction(async (tx) => {
		const owner = await tx.owner.update({
			where: { id },
			data: {
				isDeleted: false,
				deletedAt: null,
			},
		});

		await tx.user.update({
			where: { id: ownerData.userId },
			data: { status: UserStatus.ACTIVE },
		});

		return owner;
	});

	createAuditLogAsync(
		{
			userId: user.userId,
			action: 'UPDATE',
			entity: 'Owner',
			entityId: id,
			entityName: ownerData.name,
			description: 'Owner restored from soft delete',
			oldValues: {
				name: ownerData.name,
				email: ownerData.email,
				phone: ownerData.phone,
				isDeleted: true,
			},
			newValues: {
				name: ownerData.name,
				email: ownerData.email,
				phone: ownerData.phone,
				isDeleted: false,
			},
		},
		req
	);

	return result;
};

export const ownerService = {
	getAllOwner,
	getOwnerById,
	updateOwner,
	deleteOwner,
	undoDeleteOwner,
};
