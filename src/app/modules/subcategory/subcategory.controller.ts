import httpStatus from 'http-status';
import { paginationFields } from '../../../const/pagination';
import catchAsync from '../../../lib/catchAsync';
import pick from '../../../lib/pick';
import sendResponse from '../../../lib/sendResponse';
import { subcategoryFilterField } from './subcategory.const';
import { subcategoryService } from './subcategory.service';

const createSubcategory = catchAsync(async (req, res) => {
	const result = await subcategoryService.createSubcategory(req);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: 'Subcategory is created successfully',
		data: result,
	});
});

const getAllSubcategories = catchAsync(async (req, res) => {
	const filters = pick(req.query, subcategoryFilterField);
	const options = pick(req.query, paginationFields);
	const result = await subcategoryService.getAllSubcategories(filters, options, req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Subcategories are retrieved successfully',
		data: result.data,
		meta: result.meta,
	});
});

const getSubcategoryById = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	const result = await subcategoryService.getSubcategoryById(id, req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Subcategory is retrieved successfully',
		data: result,
	});
});

const updateSubcategory = catchAsync(async (req, res) => {
	const result = await subcategoryService.updateSubcategory(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Subcategory is updated successfully',
		data: result,
	});
});

const deleteSubcategory = catchAsync(async (req, res) => {
	const result = await subcategoryService.deleteSubcategory(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Subcategory is deleted successfully',
		data: result,
	});
});

export const subcategoryController = {
	createSubcategory,
	getAllSubcategories,
	getSubcategoryById,
	updateSubcategory,
	deleteSubcategory,
};
