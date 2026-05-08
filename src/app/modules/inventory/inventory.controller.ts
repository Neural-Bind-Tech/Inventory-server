import httpStatus from 'http-status';
import { paginationFields } from '../../../const/pagination';
import catchAsync from '../../../lib/catchAsync';
import pick from '../../../lib/pick';
import sendResponse from '../../../lib/sendResponse';
import { inventoryFilterField } from './inventory.const';
import { inventoryService } from './inventory.service';

const createInventory = catchAsync(async (req, res) => {
  const result = await inventoryService.createInventory(req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Inventory is created successfully',
    data: result,
  });
});

const getAllInventories = catchAsync(async (req, res) => {
  const filters = pick(req.query, inventoryFilterField);
  const options = pick(req.query, paginationFields);
  const result = await inventoryService.getAllInventories(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventories are retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getInventoryById = catchAsync(async (req, res) => {
  const id = String(req.params['id']);
  const result = await inventoryService.getInventoryById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory is retrieved successfully',
    data: result,
  });
});

const updateInventory = catchAsync(async (req, res) => {
  const result = await inventoryService.updateInventory(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory is updated successfully',
    data: result,
  });
});

const deleteInventory = catchAsync(async (req, res) => {
  const result = await inventoryService.deleteInventory(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory is deleted successfully',
    data: result,
  });
});

export const inventoryController = {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
};
