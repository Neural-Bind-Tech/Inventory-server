import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserRole } from '../../../generated/prisma/enums';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { ownerController } from './owner.controller';
import { ownerValidation } from './owner.validation';

const router = express.Router();

router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), ownerController.getAllOwner);
router.get('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), ownerController.getOwnerById);

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
	validateRequest(ownerValidation.ownerUpdateSchema),
	ownerController.updateOwner
);

router.patch('/:id/undo-delete', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), ownerController.undoDeleteOwner);
router.delete('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), ownerController.deleteOwner);

export const ownerRoutes = router;
