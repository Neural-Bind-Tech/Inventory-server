/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { JWTPayload } from './common';
declare global {
  namespace Express {
    interface Request {
      user: JWTPayload | null;
      cookies: Record<string, string>;
      signedCookies: Record<string, string>;
    }
  }
}

export type { JWTPayload } from './common';
