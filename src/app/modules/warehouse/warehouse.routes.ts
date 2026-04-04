import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { warehouseController } from './warehouse.controller';
import { warehouseValidation } from './warehouse.validation';

const router = express.Router();

// Create
router.post(
    '/create-by-admin',
    auth('SUPER_ADMIN', 'ADMIN'),
    validateRequest(warehouseValidation.createWarehouseZodSchema),
    warehouseController.createWarehouseByAdmin
);

router.post(
    '/create-by-owner',
    auth('OWNER'),
    validateRequest(warehouseValidation.createWarehouseZodSchema),
    warehouseController.createWarehouseByOwner
);

// Read
router.get('/admin', auth('SUPER_ADMIN', 'ADMIN'), warehouseController.getAllWarehousesForAdmin);

router.get('/owner', auth('OWNER'), warehouseController.getOwnerWarehouses);

router.get(
    '/shop/:shopId',
    auth('SUPER_ADMIN', 'ADMIN', 'OWNER'),
    validateRequest(warehouseValidation.shopIdParamZodSchema),
    warehouseController.getWarehousesByShopId
);

router.get(
    '/:id',
    auth('SUPER_ADMIN', 'ADMIN', 'OWNER'),
    validateRequest(warehouseValidation.warehouseIdParamZodSchema),
    warehouseController.getWarehouseById
);

// Update
router.patch(
    '/:id',
    auth('SUPER_ADMIN', 'ADMIN', 'OWNER'),
    validateRequest(warehouseValidation.warehouseIdParamZodSchema),
    validateRequest(warehouseValidation.updateWarehouseZodSchema),
    warehouseController.updateWarehouse
);

// Delete
router.delete(
    '/:id',
    auth('SUPER_ADMIN', 'ADMIN', 'OWNER'),
    validateRequest(warehouseValidation.warehouseIdParamZodSchema),
    warehouseController.deleteWarehouse
);

export const warehouseRoutes = router;
