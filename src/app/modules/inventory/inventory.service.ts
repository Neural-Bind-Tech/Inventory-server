import { Request } from 'express';
import httpStatus from 'http-status';
import { Prisma } from '../../../generated/prisma/client';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import type { IPaginationOptions } from '../../../interface';
import type { IUploadFile } from '../../../interface/file';
import { prisma } from '../../../lib/prisma';
import { inventorySearchField } from './inventory.const';
import type { IInventoryFilter, InventoryPayload } from './inventory.interface';

const createInventory = async (req: Request) => {
  const payload = req.body as InventoryPayload;
  const file = req.file as IUploadFile;

  const duplicate = await prisma.inventory.findFirst({
    where: {
      OR: [
        ...(payload.globalSku ? [{ globalSku: payload.globalSku }] : []),
        ...(payload.barcode ? [{ barcode: payload.barcode }] : []),
        ...(payload.qrCode ? [{ qrCode: payload.qrCode }] : []),
      ],
    },
  });

  if (duplicate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Global SKU, barcode, or qr code already exists'
    );
  }

  let thumbnail = payload.thumbnail ?? null;
  if (file) {
    const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
    thumbnail = uploadResult?.secure_url || null;
  }

  const result = await prisma.inventory.create({
    data: {
      name: payload.name,
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.brand !== undefined && { brand: payload.brand }),
      ...(payload.globalSku !== undefined && { globalSku: payload.globalSku }),
      ...(payload.barcode !== undefined && { barcode: payload.barcode }),
      ...(payload.qrCode !== undefined && { qrCode: payload.qrCode }),
      ...(payload.suggestedBuyPrice !== undefined && {
        suggestedBuyPrice: payload.suggestedBuyPrice,
      }),
      ...(payload.suggestedSellPrice !== undefined && {
        suggestedSellPrice: payload.suggestedSellPrice,
      }),
      ...(payload.mrp !== undefined && { mrp: payload.mrp }),
      ...(payload.manufacturer !== undefined && {
        manufacturer: payload.manufacturer,
      }),
      ...(payload.weight !== undefined && { weight: payload.weight }),
      ...(payload.dimensions !== undefined && {
        dimensions:
          payload.dimensions === null
            ? Prisma.JsonNull
            : (payload.dimensions as Prisma.InputJsonValue),
      }),
      ...(thumbnail !== null && { thumbnail }),
      ...(payload.images !== undefined && { images: payload.images }),
      ...(payload.tags !== undefined && { tags: payload.tags }),
      ...(payload.specifications !== undefined && {
        specifications:
          payload.specifications === null
            ? Prisma.JsonNull
            : (payload.specifications as Prisma.InputJsonValue),
      }),
    },
  });

  return result;
};

const getAllInventories = async (
  filters: IInventoryFilter,
  paginationOptions: IPaginationOptions
) => {
  const { searchTerm, ...rest } = filters;

  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination({
      ...paginationOptions,
      sortBy: paginationOptions.sortBy ?? 'name',
    });

  const andConditions: Prisma.InventoryWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: inventorySearchField.map((field) => ({
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

  const whereConditions: Prisma.InventoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [items, total] = await Promise.all([
    prisma.inventory.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    prisma.inventory.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: items,
  };
};

const getInventoryById = async (id: string) => {
  const inventory = await prisma.inventory.findUnique({
    where: { id },
  });

  if (!inventory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory not found');
  }

  return inventory;
};

const updateInventory = async (req: Request) => {
  const id = String(req.params['id']);
  const payload = req.body as Partial<InventoryPayload>;
  const file = req.file as IUploadFile;

  const inventoryData = await prisma.inventory.findUnique({
    where: { id },
  });

  if (!inventoryData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Inventory not found');
  }

  if (payload.globalSku && payload.globalSku !== inventoryData.globalSku) {
    const duplicateSku = await prisma.inventory.findFirst({
      where: {
        globalSku: payload.globalSku,
        id: { not: id },
      },
    });

    if (duplicateSku) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Global SKU already exists');
    }
  }

  if (payload.barcode && payload.barcode !== inventoryData.barcode) {
    const duplicateBarcode = await prisma.inventory.findFirst({
      where: {
        barcode: payload.barcode,
        id: { not: id },
      },
    });

    if (duplicateBarcode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Barcode already exists');
    }
  }

  if (payload.qrCode && payload.qrCode !== inventoryData.qrCode) {
    const duplicateQrCode = await prisma.inventory.findFirst({
      where: {
        qrCode: payload.qrCode,
        id: { not: id },
      },
    });

    if (duplicateQrCode) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Qr code already exists');
    }
  }

  let thumbnail = inventoryData.thumbnail;
  if (file) {
    const uploadResult = await FileUploadHelper.uploadToCloudinary(file);
    thumbnail = uploadResult?.secure_url || null;
  }

  const data: Prisma.InventoryUpdateInput = {
    ...(payload.name !== undefined && { name: payload.name }),
    ...(payload.description !== undefined && {
      description: payload.description,
    }),
    ...(payload.brand !== undefined && { brand: payload.brand }),
    ...(payload.globalSku !== undefined && { globalSku: payload.globalSku }),
    ...(payload.barcode !== undefined && { barcode: payload.barcode }),
    ...(payload.qrCode !== undefined && { qrCode: payload.qrCode }),
    ...(payload.suggestedBuyPrice !== undefined && {
      suggestedBuyPrice: payload.suggestedBuyPrice,
    }),
    ...(payload.suggestedSellPrice !== undefined && {
      suggestedSellPrice: payload.suggestedSellPrice,
    }),
    ...(payload.mrp !== undefined && { mrp: payload.mrp }),
    ...(payload.manufacturer !== undefined && {
      manufacturer: payload.manufacturer,
    }),
    ...(payload.weight !== undefined && { weight: payload.weight }),
    ...(payload.dimensions !== undefined && {
      dimensions:
        payload.dimensions === null
          ? Prisma.JsonNull
          : (payload.dimensions as Prisma.InputJsonValue),
    }),
    ...(payload.thumbnail !== undefined && { thumbnail: payload.thumbnail }),
    ...(file && { thumbnail }),
    ...(payload.images !== undefined && { images: payload.images }),
    ...(payload.tags !== undefined && { tags: payload.tags }),
    ...(payload.specifications !== undefined && {
      specifications:
        payload.specifications === null
          ? Prisma.JsonNull
          : (payload.specifications as Prisma.InputJsonValue),
    }),
  };

  const result = await prisma.inventory.update({
    where: { id },
    data,
  });

  return result;
};

const deleteInventory = async (req: Request) => {
  const id = String(req.params['id']);

  try {
    const result = await prisma.inventory.delete({
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
        'Inventory cannot be deleted because related records exist'
      );
    }

    throw error;
  }
};

export const inventoryService = {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};
