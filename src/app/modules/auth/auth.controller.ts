import { Request, Response } from 'express';
import catchAsync from '../../../lib/catchAsync';
import sendResponse from '../../../lib/sendResponse';
import { AuthService } from './auth.service';
import { AuthCookie } from '../../../helpers/authCookies';
import { JWTPayload } from '../../../interface';

const loginUser = catchAsync(async (req: Request, res: Response) => {

  const result = await AuthService.loginUser(req);
  AuthCookie.setAuthCookies(res, result.access, result.refresh)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Login is successful.',
    data: result.message
  });

});


const getTokenForTest = catchAsync(async (_, res: Response) => {

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your token',
    data: "result"
  });

});


const changePassword = catchAsync(async (req: Request, res: Response) => {

  await AuthService.changePassword(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully!',
    data: {
      message: 'Password changed successfully!',
    },
  });
});


const getMe = catchAsync(async (req: Request, res: Response) => {

  const user = req.user;
  const result = await AuthService.getMe(user as JWTPayload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully!',
    data: result
  });
});


const logoutUser = catchAsync(async (req: Request, res: Response) => {

  await AuthService.logout(req);
  AuthCookie.removeAuthCookies(res)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logout is successful.',
    data: {
      message: 'Logout is successful'
    }
  });

});


export const AuthController = {
  loginUser,
  getTokenForTest,
  changePassword,
  getMe,
  logoutUser
};
