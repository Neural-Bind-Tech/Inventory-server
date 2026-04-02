import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { shopController } from './shop.controller';
import { shopValidation } from './shop.validation';

const router = express.Router();

router.post(
	'/create-by-admin',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	FileUploadHelper.upload.single('file'),
	(req, _res, next) => {
		if (req?.body?.data) {
			req.body = JSON.parse(req.body.data);
		}
		next();
	},
	validateRequest(shopValidation.createShopByAdminSchema),
	shopController.createShopByAdmin
);

router.post(
	'/create-by-owner',
	auth(UserRole.OWNER),
	FileUploadHelper.upload.single('file'),
	(req, _res, next) => {
		if (req?.body?.data) {
			req.body = JSON.parse(req.body.data);
		}
		next();
	},
	validateRequest(shopValidation.createShopByOwnerSchema),
	shopController.createShopByOwner
);

router.put(
	'/:id',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	FileUploadHelper.upload.single('file'),
	(req, _res, next) => {
		if (req?.body?.data) {
			req.body = JSON.parse(req.body.data);
		}
		next();
	},
	validateRequest(shopValidation.updateShopSchema),
	shopController.updateShop
);

router.delete(
	'/:id',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	shopController.deleteShop
);

router.get(
	'/',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	shopController.getAllShopsForAdmin
);

router.get(
	'/owner/:ownerId',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	shopController.getShopsByOwnerForAdmin
);

router.get(
	'/my-shops',
	auth(UserRole.OWNER),
	shopController.getOwnerShops
);

router.post(
	'/shop-stock',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	validateRequest(shopValidation.createShopStockSchema),
	shopController.createShopStock
);

router.get(
	'/:id/shop-stock',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	shopController.getShopStocksByShopId
);

router.get(
	'/:id/relations',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	shopController.getShopRelationsById
);

router.get(
	'/:id',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	shopController.getShopById
);

export const shopRoutes = router;
