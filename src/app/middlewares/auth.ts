/// <reference path="../../interface/index.d.ts" />
import { type NextFunction, type Request, type Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import { AuthCookie, getCookiesInExpress } from '../../helpers/authCookies';
import { getDeviceInfo } from '../../helpers/getDeviceInfo';
import { prisma } from '../../lib/prisma';

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenPair = getCookiesInExpress(req as any);

      if (!tokenPair.accessToken) {
        if (tokenPair.refreshToken) {
          throw new Error('jwt expired');
        }
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'You are not authorized:token not found'
        );
      }

      const decodedValue = await jwtHelpers.verifyToken(tokenPair.accessToken);

      const { userId, role, tokenId, type, phone, email } = decodedValue;

      if (type !== 'ACCESS') {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'You are not authorized:Invalid token type'
        );
      }

      const activeToken = await prisma.activeToken.findFirst({
        where: { tokenId },
      });
      if (!activeToken) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'You are not authorized:Invalid token'
        );
      }

      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          'You are not authorized:Forbidden'
        );
      }

      req.user = {
        userId,
        role,
        phone,
        ...(email ? { email } : {}),
      };
      return next();
    } catch (error: any) {
      if (error.message === 'jwt expired') {
        try {
          const tokenPair = getCookiesInExpress(req as any);

          if (!tokenPair.refreshToken) {
            throw new ApiError(
              httpStatus.UNAUTHORIZED,
              'You are not authorized:Session expired'
            );
          }

          const decodedValue = await jwtHelpers.verifyToken(
            tokenPair.refreshToken
          );

          const { userId, role, tokenId, type, phone, email } = decodedValue;

          const accessTokenId = tokenId.split('_')[1];

          if (type !== 'REFRESH') {
            throw new ApiError(
              httpStatus.UNAUTHORIZED,
              'You are not authorized:Invalid token type'
            );
          }

          const activeRefreshToken = await prisma.activeToken.findFirst({
            where: { tokenId },
          });
          const activeAccessToken = await prisma.activeToken.findFirst({
            where: { tokenId: `access_${accessTokenId}` },
          });

          if (!activeRefreshToken || !activeAccessToken) {
            throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
          }

          const client = getDeviceInfo(req);

          const newTokenPair = await jwtHelpers.generateTokenPair({
            userId,
            role,
            phone,
            ...(email ? { email } : {}),
          });

          await prisma.$transaction([
            prisma.activeToken.delete({ where: { id: activeRefreshToken.id } }),
            prisma.activeToken.delete({
              where: { tokenId: `access_${accessTokenId}` },
            }),

            prisma.activeToken.create({
              data: {
                tokenId: `access_${newTokenPair.tokenId}`,
                tokenType: 'ACCESS',
                ipAddress: client.ip,
                deviceInfo: client.device,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                userId: userId,
              },
            }),

            prisma.activeToken.create({
              data: {
                tokenId: `refresh_${newTokenPair.tokenId}`,
                tokenType: 'REFRESH',
                ipAddress: client.ip,
                deviceInfo: client.device,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                userId: userId,
              },
            }),
          ]);

          AuthCookie.setAuthCookies(
            res,
            newTokenPair.accessToken,
            newTokenPair.refreshToken
          );
          req.user = {
            phone,
            userId,
            role,
            ...(email ? { email } : {}),
          };

          return next();
        } catch (refreshError) {
          return next(refreshError);
        }
      }

      return next(error);
    }
  };

export default auth;
