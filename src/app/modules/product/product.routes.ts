import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { productController } from './product.controller';
import { productValidation } from './product.validation';

const router = express.Router();

router.post(
	'/',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	FileUploadHelper.upload.single('file'),
	(req, _res, next) => {
		if (req?.body?.data) {
			req.body = JSON.parse(req.body.data);
		}
		next();
	},
	validateRequest(productValidation.createProductSchema),
	productController.createProduct
);

router.get(
	'/',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	productController.getAllProducts
);

router.get(
	'/:id',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	productController.getProductById
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
	validateRequest(productValidation.updateProductSchema),
	productController.updateProduct
);

router.delete(
	'/:id',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	productController.deleteProduct
);

export const productRoutes = router;
