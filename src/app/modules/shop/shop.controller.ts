import httpStatus from 'http-status';
import catchAsync from '../../../lib/catchAsync';
import pick from '../../../lib/pick';
import sendResponse from '../../../lib/sendResponse';
import { shopService } from './shop.service';

const createShopByAdmin = catchAsync(async (req, res) => {
	const result = await shopService.createShopByAdmin(req);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: 'Shop is created successfully',
		data: result,
	});
});

const createShopByOwner = catchAsync(async (req, res) => {
	const result = await shopService.createShopByOwner(req);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: 'Shop is created successfully',
		data: result,
	});
});

const getAllShopsForAdmin = catchAsync(async (_req, res) => {
	const result = await shopService.getAllShopsForAdmin();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Shops are retrieved successfully',
		data: result,
	});
});

const getShopsByOwnerForAdmin = catchAsync(async (req, res) => {
	const ownerId = String(req.params['ownerId']);
	const result = await shopService.getShopsByOwnerForAdmin(ownerId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Owner shops are retrieved successfully',
		data: result,
	});
});

const getShopById = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	const result = await shopService.getShopById(id, req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Shop is retrieved successfully',
		data: result,
	});
});

const getShopRelationsById = catchAsync(async (req, res) => {
	const id = String(req.params['id']);
	
	const relationFilters = pick(req.query as Record<string, unknown>, ['include']);
	const includeRaw = relationFilters["include"];
	const includeValue = typeof includeRaw === 'string' ? includeRaw : undefined;

	const includeArr= includeValue ? includeValue.split(',').map(item => item.trim()) : [];
	const validRelationsArr = ['employees','supplier','expense','damageproduct','returnproduct','warehouse','shopstock']
	const validRelations = includeArr.filter(item => validRelationsArr.includes(item));

	const result = await shopService.getShopRelationsById(
		id,
		req.user!,
		validRelations
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Shop relations are retrieved successfully',
		data: result,
	});
});

const getOwnerShops = catchAsync(async (req, res) => {
	const result = await shopService.getOwnerShops(req.user!);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: 'Owner shops are retrieved successfully',
		data: result,
	});
});

export const shopController = {
	createShopByAdmin,
	createShopByOwner,
	getAllShopsForAdmin,
	getShopsByOwnerForAdmin,
	getShopById,
	getShopRelationsById,
	getOwnerShops,
};
