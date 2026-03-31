import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../lib/catchAsync';
import sendResponse from '../../../lib/sendResponse';
import { UserServices } from './user.service';


const createAdmin = catchAsync(async (req: Request, res: Response) => {

  const result = await UserServices.createAdmin(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin created successfully!',
    data: result,
  });
});

const createOwner = catchAsync(async (req: Request, res: Response) => {

  const result = await UserServices.createOwner(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Owner created successfully!',
    data: result,
  });
});

const createEmployee = catchAsync(async (req: Request, res: Response) => {

  const result = await UserServices.createEmployee(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Employee created successfully!',
    data: result,
  });
});

export const UserController = {
  createAdmin,
  createOwner,
  createEmployee
};
