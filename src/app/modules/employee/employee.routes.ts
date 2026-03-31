import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserRole } from '../../../generated/prisma/enums';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { employeeController } from './employee.controller';
import { employeeValidation } from './employee.validation';

const router = express.Router();

router.get(
	'/',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	employeeController.getAllEmployee
);
router.get(
	'/:id',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER, UserRole.EMPLOYEE),
	employeeController.getEmployeeById
);

router.put(
	'/:id',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER, UserRole.EMPLOYEE),
	FileUploadHelper.upload.single('file'),
	(req, _res, next) => {
		if (req?.body?.data) {
			req.body = JSON.parse(req.body.data);
		}
		next();
	},
	validateRequest(employeeValidation.employeeUpdateSchema),
	employeeController.updateEmployee
);

router.patch(
	'/:id/undo-delete',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	employeeController.undoDeleteEmployee
);
router.delete(
	'/:id',
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
	employeeController.deleteEmployee
);

export const employeeRoutes = router;
