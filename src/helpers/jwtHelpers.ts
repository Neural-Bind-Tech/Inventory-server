import fs from 'fs';
import path from 'path';
import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import type { JWTPayload } from '../interface';

export interface TokenPayload extends JWTPayload {
  type: 'ACCESS' | 'REFRESH';
  tokenId: string;
}

export interface ResetPasswordTokenPayload {
  userId: string;
  type: 'RESET_PASSWORD';
  randomToken: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenId: string;
}

const publicKey: string = fs.readFileSync(
  path.resolve('secret/tokenECPublic.pem'),
  'utf8'
);

const privateKey: string = fs.readFileSync(
  path.resolve('secret/tokenECPrivate.pem'),
  'utf8'
);

const signToken = (
  payload: object,
  options: SignOptions = {}
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(
      payload,
      privateKey,
      { algorithm: 'RS256', ...options },
      (err: Error | null, token?: string) => {
        if (err) {
          reject(err);
        } else if (token) {
          resolve(token);
        } else {
          reject(new Error('Token generation failed'));
        }
      }
    );
  });
};

const verifyToken = (token: string): Promise<TokenPayload> => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, payload) => {
      if (err) {
        reject(err);
      } else if (payload && Object.keys(payload).length > 0) {
        resolve(payload as TokenPayload);
      } else {
        reject(new Error('Token verification failed'));
      }
    });
  });
};

const verifyResetPasswordToken = (
  token: string
): Promise<ResetPasswordTokenPayload> => {
  return new Promise<ResetPasswordTokenPayload>((resolve, reject) => {
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, payload) => {
      if (err) {
        reject(err);
      } else if (payload && Object.keys(payload).length > 0) {
        resolve(payload as ResetPasswordTokenPayload);
      } else {
        reject(new Error('Reset token verification failed'));
      }
    });
  });
};

const generateTokenId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const generateTokenPair = async (userData: JWTPayload): Promise<TokenPair> => {
  const tokenId: string = generateTokenId();

  const accessToken: string = await signToken(
    {
      ...userData,
      type: 'ACCESS',
      tokenId: `access_${tokenId}`,
    } as TokenPayload,
    { expiresIn: '15m' }
  );

  const refreshToken: string = await signToken(
    {
      ...userData,
      type: 'REFRESH',
      tokenId: `refresh_${tokenId}`,
    } as TokenPayload,
    { expiresIn: '7d' }
  );

  return {
    accessToken,
    refreshToken,
    tokenId,
  };
};

const generateResetPasswordToken = async (userId: string) => {
  const randomToken = crypto.randomBytes(32).toString('hex');

  const token = await signToken(
    {
      userId,
      type: 'RESET_PASSWORD',
      randomToken,
    } as ResetPasswordTokenPayload,
    { expiresIn: '15m' }
  );

  return {
    token,
    randomToken,
  };
};

export const jwtHelpers = {
  generateTokenPair,
  generateResetPasswordToken,
  verifyToken,
  verifyResetPasswordToken,
};
