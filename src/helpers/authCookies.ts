import { type CookieOptions, type Request, type Response } from 'express';

const isDevelopment = process.env['NODE_ENV'] === 'development';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: isDevelopment ? 'lax' : 'strict',
  secure: isDevelopment ? false : true,
  signed: true,
};

export const getCookiesInExpress = (req: Request) => {
  const accessToken = (req as any).signedCookies.accessToken;
  const refreshToken = (req as any).signedCookies.refreshToken;

  return { accessToken, refreshToken };
};

export const AuthCookie = {
  setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 900000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  },

  removeAuthCookies(res: Response): void {
    res.clearCookie('accessToken', {
      ...cookieOptions,
    });

    res.clearCookie('refreshToken', {
      ...cookieOptions,
    });
  },
};
