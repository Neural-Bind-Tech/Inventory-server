import httpStatus from 'http-status';
import { paginationFields } from '../../../const/pagination';
import catchAsync from '../../../lib/catchAsync';
import pick from '../../../lib/pick';
import sendResponse from '../../../lib/sendResponse';
import { categoryFilterField } from './category.const';
import { categoryService } from './category.service';

const createCategory = catchAsync(async (req, res) => {
	const result = await categoryService.createCategory(req);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: 'Category is created successfully',
		data: result,
	});
});

const getAllCategories = catchAsync(async (req, res) => {
	const filters = pick(req.query, categoryFilterField);
	const options = pick(req.query, paginationFields);
	const result = await categoryService.getAllCategories(filters, options, req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Categories are retrieved successfully',
		data: result.data,
		meta: result.meta,
	});
});

const getCategoryById = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	const result = await categoryService.getCategoryById(id, req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Category is retrieved successfully',
		data: result,
	});
});

const getCategorySubcategories = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	const result = await categoryService.getCategorySubcategories(id, req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Category subcategories are retrieved successfully',
		data: result,
	});
});

const getCategoryProducts = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	const result = await categoryService.getCategoryProducts(id, req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Category products are retrieved successfully',
		data: result,
	});
});

const updateCategory = catchAsync(async (req, res) => {
	const result = await categoryService.updateCategory(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Category is updated successfully',
		data: result,
	});
});

const deleteCategory = catchAsync(async (req, res) => {
	const result = await categoryService.deleteCategory(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Category is deleted successfully',
		data: result,
	});
});

export const categoryController = {
	createCategory,
	getAllCategories,
	getCategoryById,
	getCategorySubcategories,
	getCategoryProducts,
	updateCategory,
	deleteCategory,
};
