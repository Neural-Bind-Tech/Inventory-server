import httpStatus from 'http-status';
import catchAsync from '../../../lib/catchAsync';
import pick from '../../../lib/pick';
import sendResponse from '../../../lib/sendResponse';
import { categoryRelations } from './category.const';
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
	
	const relationFilters = pick(req.query as Record<string, unknown>, [
		'shopId',
		'include',
	]);

	const shopIdRaw = relationFilters['shopId'];
	const shopId = typeof shopIdRaw === 'string' ? shopIdRaw : undefined;

	const includeRaw = relationFilters['include'];
	const includeValue = typeof includeRaw === 'string' ? includeRaw : undefined;
	const includeArr = includeValue? includeValue.split(',').map((item) => item.trim()) : [];
	const validRelations = includeArr.filter((item) =>categoryRelations.includes(item));

	const result = await categoryService.getAllCategories(shopId, req.user!, validRelations);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Categories are retrieved successfully',
		data: result,
	});
});

const getCategoryById = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	const result = await categoryService.getCategoryById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Category is retrieved successfully',
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
	updateCategory,
	deleteCategory,
};
