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
import { employeeSearchField } from './employee.const';
import { EmployeePayload, IEmployeeFilter } from './employee.interface';

const getAllEmployee = async (
	filters: IEmployeeFilter,
	paginationOptions: IPaginationOptions
) => {
	const { searchTerm, isDeleted, ...rest } = filters;
	const { limit, page, skip, sortBy, sortOrder } =
		paginationHelpers.calculatePagination(paginationOptions);

	const andConditions: Prisma.EmployeeWhereInput[] = [];

	andConditions.push({
		isDeleted: isDeleted === 'true' ? true : false,
	});

	if (searchTerm) {
		andConditions.push({
			OR: employeeSearchField.map((field) => ({
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

	const whereConditions: Prisma.EmployeeWhereInput = { AND: andConditions };

	const [employee, total] = await Promise.all([
		prisma.employee.findMany({
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
			},
		}),
		prisma.employee.count({ where: whereConditions }),
	]);

	return {
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
		data: employee,
	};
};

const getEmployeeById = async (id: string) => {
	const result = await prisma.employee.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			shop: {
				select: {
					id: true,
					name: true,
					code: true,
				},
			},
		},
	});

	if (!result) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
	}

	return result;
};

const updateEmployee = async (req: Request) => {
	const id = String(req.params['id']);
	const payload = req.body as EmployeePayload;
	const file = req.file as IUploadFile;
	const user = req.user as JWTPayload;

	const employeeData = await prisma.employee.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!employeeData) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Employee not found');
	}

	if (!['SUPER_ADMIN', 'ADMIN', 'OWNER'].includes(user.role)) {
		if (employeeData.userId !== user.userId) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				"You can't update another employee's info"
			);
		}
	}

	if (payload.email && payload.email !== employeeData.email) {
		const existingEmailUser = await prisma.user.findUnique({
			where: { email: String(payload.email), status: 'ACTIVE' },
		});
		if (existingEmailUser) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Email already registered');
		}

		const existingEmailEmployee = await prisma.employee.findFirst({
			where: {
				email: String(payload.email),
				isDeleted: false,
				id: { not: id },
			},
		});
		if (existingEmailEmployee) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Email already registered');
		}
	}

	if (payload.phone && payload.phone !== employeeData.phone) {
		const existingPhoneUser = await prisma.user.findUnique({
			where: { phone: String(payload.phone) },
		});
		if (existingPhoneUser) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Phone number already registered'
			);
		}

		const existingPhoneEmployee = await prisma.employee.findFirst({
			where: {
				phone: String(payload.phone),
				isDeleted: false,
				id: { not: id },
			},
		});
		if (existingPhoneEmployee) {
			throw new ApiError(
				httpStatus.BAD_REQUEST,
				'Phone number already registered'
			);
		}
	}

	let profilePicture = employeeData.profilePicture;
	if (file) {
		const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
		profilePicture = uploadResult?.secure_url || null;
	}

	const updateData: Record<string, unknown> = {
		...payload,
		...(profilePicture ? { profilePicture } : {}),
		...(payload.salary !== undefined ? { salary: payload.salary ?? null } : {}),
		...(payload.joiningDate
			? { joiningDate: new Date(String(payload.joiningDate)) }
			: {}),
	};

	const userUpdateData: { email?: string; phone?: string } = {};
	if (payload.email && payload.email !== employeeData.email) {
		userUpdateData.email = String(payload.email);
	}
	if (payload.phone && payload.phone !== employeeData.phone) {
		userUpdateData.phone = String(payload.phone);
	}

	const result = await prisma.$transaction(async (tx) => {
		const updatedEmployee = await tx.employee.update({
			where: {
				id,
				isDeleted: false,
			},
			data: updateData,
		});

		if (Object.keys(userUpdateData).length > 0) {
			await tx.user.update({
				where: { id: employeeData.userId },
				data: userUpdateData,
			});
		}

		return updatedEmployee;
	});

	return result;
};

const deleteEmployee = async (req: Request) => {
	const id = String(req.params['id']);
	const user = req.user as JWTPayload;

	const employeeData = await prisma.employee.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	});

	if (!employeeData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Employee not found');
	}

	const result = await prisma.$transaction(async (tx) => {
		const employee = await tx.employee.update({
			where: { id },
			data: {
				isDeleted: true,
			},
		});

		await tx.user.update({
			where: { id: employeeData.userId },
			data: { status: UserStatus.DELETED },
		});

		return employee;
	});

	createAuditLogAsync(
		{
			userId: user.userId,
			action: 'DELETE',
			entity: 'Employee',
			entityId: id,
			entityName: employeeData.name,
			description: 'Employee soft deleted',
			oldValues: {
				name: employeeData.name,
				email: employeeData.email,
				phone: employeeData.phone,
				isDeleted: false,
			},
			newValues: {
				name: employeeData.name,
				email: employeeData.email,
				phone: employeeData.phone,
				isDeleted: true,
			},
		},
		req
	);

	return result;
};

const undoDeleteEmployee = async (req: Request) => {
	const id = String(req.params['id']);
	const user = req.user as JWTPayload;

	const employeeData = await prisma.employee.findUnique({
		where: {
			id,
			isDeleted: true,
		},
	});

	if (!employeeData) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Deleted employee not found');
	}

	const result = await prisma.$transaction(async (tx) => {
		const employee = await tx.employee.update({
			where: { id },
			data: {
				isDeleted: false,
				deletedAt: null,
			},
		});

		await tx.user.update({
			where: { id: employeeData.userId },
			data: { status: UserStatus.ACTIVE },
		});

		return employee;
	});

	createAuditLogAsync(
		{
			userId: user.userId,
			action: 'UPDATE',
			entity: 'Employee',
			entityId: id,
			entityName: employeeData.name,
			description: 'Employee restored from soft delete',
			oldValues: {
				name: employeeData.name,
				email: employeeData.email,
				phone: employeeData.phone,
				isDeleted: true,
			},
			newValues: {
				name: employeeData.name,
				email: employeeData.email,
				phone: employeeData.phone,
				isDeleted: false,
			},
		},
		req
	);

	return result;
};

export const employeeService = {
	getAllEmployee,
	getEmployeeById,
	updateEmployee,
	deleteEmployee,
	undoDeleteEmployee,
};
