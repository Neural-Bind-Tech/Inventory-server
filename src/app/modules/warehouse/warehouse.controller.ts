import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { warehouseService } from './warehouse.service';

const createWarehouseByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await warehouseService.createWarehouseByAdmin(req);
        res.status(httpStatus.CREATED).json({
            success: true,
            message: 'Warehouse created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const createWarehouseByOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await warehouseService.createWarehouseByOwner(req);
        res.status(httpStatus.CREATED).json({
            success: true,
            message: 'Warehouse created successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await warehouseService.updateWarehouse(req);
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Warehouse updated successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteWarehouse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await warehouseService.deleteWarehouse(req);
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Warehouse deleted successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getAllWarehousesForAdmin = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await warehouseService.getAllWarehousesForAdmin();
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Warehouses retrieved successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getWarehouseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = String(req.params['id']);
        const user = req.user;
        const result = await warehouseService.getWarehouseById(id, user as any);
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Warehouse retrieved successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getWarehousesByShopId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shopId = String(req.params['shopId']);
        const user = req.user;
        const result = await warehouseService.getWarehousesByShopId(shopId, user as any);
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Warehouses retrieved successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getOwnerWarehouses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const result = await warehouseService.getOwnerWarehouses(user as any);
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Owner warehouses retrieved successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const warehouseController = {
    createWarehouseByAdmin,
    createWarehouseByOwner,
    updateWarehouse,
    deleteWarehouse,
    getAllWarehousesForAdmin,
    getWarehouseById,
    getWarehousesByShopId,
    getOwnerWarehouses,
};
