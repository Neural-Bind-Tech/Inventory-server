import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { inventoryController } from './inventory.controller';
import { inventoryValidation } from './inventory.validation';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  FileUploadHelper.upload.single('file'),
  (req, _res, next) => {
    if (req?.body?.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(inventoryValidation.createInventorySchema),
  inventoryController.createInventory
);

router.get(
  '/',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  inventoryController.getAllInventories
);

router.get(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  inventoryController.getInventoryById
);

router.put(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  FileUploadHelper.upload.single('file'),
  (req, _res, next) => {
    if (req?.body?.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(inventoryValidation.updateInventorySchema),
  inventoryController.updateInventory
);

router.delete(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  inventoryController.deleteInventory
);

export const inventoryRoutes = router;
