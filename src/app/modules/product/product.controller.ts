import httpStatus from 'http-status';
import { paginationFields } from '../../../const/pagination';
import catchAsync from '../../../lib/catchAsync';
import pick from '../../../lib/pick';
import sendResponse from '../../../lib/sendResponse';
import { productFilterField } from './product.const';
import { productService } from './product.service';

const createProduct = catchAsync(async (req, res) => {
	const result = await productService.createProduct(req);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: 'Product is created successfully',
		data: result,
	});
});

const getAllProducts = catchAsync(async (req, res) => {
	const filters = pick(req.query, productFilterField);
	const options = pick(req.query, paginationFields);
	const result = await productService.getAllProducts(filters, options, req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Products are retrieved successfully',
		data: result.data,
		meta: result.meta,
	});
});

const getProductById = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	const result = await productService.getProductById(id);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Product is retrieved successfully',
		data: result,
	});
});

const updateProduct = catchAsync(async (req, res) => {
	const result = await productService.updateProduct(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Product is updated successfully',
		data: result,
	});
});

const deleteProduct = catchAsync(async (req, res) => {
	const result = await productService.deleteProduct(req);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Product is deleted successfully',
		data: result,
	});
});

export const productController = {
	createProduct,
	getAllProducts,
	getProductById,
	updateProduct,
	deleteProduct,
};
