import express, { NextFunction, Request, Response } from 'express';
import { UserController } from './user.controller';
import { UserValidation } from './user.validations';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma/enums';

const router = express.Router();

router.post(
  '/create-admin',
  auth(UserRole.SUPER_ADMIN),
  FileUploadHelper.upload.single('file'),
  (req: Request, _res: Response, next: NextFunction) => {
    if (req?.body?.data) {
      req.body = JSON.parse(req.body.data)
    }
    next()
  },
  validateRequest(UserValidation.createdAdminSchema),
  UserController.createAdmin
);

router.post(
  '/create-owner',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  FileUploadHelper.upload.single('file'),
  (req: Request, _res: Response, next: NextFunction) => {
    if (req?.body?.data) {
      req.body = JSON.parse(req.body.data)
    }
    next()
  },
  validateRequest(UserValidation.createdOwnerSchema),
  UserController.createOwner
);

router.post(
  '/create-employee',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER),
  FileUploadHelper.upload.single('file'),
  (req: Request, _res: Response, next: NextFunction) => {
    if (req?.body?.data) {
      req.body = JSON.parse(req.body.data)
    }
    next()
  },
  validateRequest(UserValidation.createdEmployeeSchema),
  UserController.createEmployee
);

export const userRoutes = router;
