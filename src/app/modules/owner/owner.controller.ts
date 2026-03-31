import httpStatus from 'http-status';
import { paginationFields } from '../../../const/pagination';
import catchAsync from '../../../lib/catchAsync';
import pick from '../../../lib/pick';
import sendResponse from '../../../lib/sendResponse';
import { ownerFilterField } from './owner.const';
import { ownerService } from './owner.service';

const getAllOwner = catchAsync(async (req, res) => {
	const filters = pick(req.query, ownerFilterField);
	const options = pick(req.query, paginationFields);
	const result = await ownerService.getAllOwner(filters, options);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Owner's data is retrieved successfully",
		data: result.data,
		meta: result.meta,
	});
});

const getOwnerById = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	const result = await ownerService.getOwnerById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Owner's data is retrieved successfully",
		data: result,
	});
});

const updateOwner = catchAsync(async (req, res) => {
	const result = await ownerService.updateOwner(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Owner's information is updated successfully",
		data: result,
	});
});

const deleteOwner = catchAsync(async (req, res) => {
	const result = await ownerService.deleteOwner(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Owner is deleted successfully',
		data: result,
	});
});

const undoDeleteOwner = catchAsync(async (req, res) => {
	const result = await ownerService.undoDeleteOwner(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Owner is restored successfully',
		data: result,
	});
});

export const ownerController = {
	getAllOwner,
	getOwnerById,
	updateOwner,
	deleteOwner,
	undoDeleteOwner,
};
