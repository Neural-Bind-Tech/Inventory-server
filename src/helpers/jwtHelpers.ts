import fs from 'fs';
import path from 'path';
import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import type { JWTPayload } from '../interface';

export interface TokenPayload extends JWTPayload {
  type: 'ACCESS' | 'REFRESH';
  tokenId: string;
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

export const jwtHelpers = {
  generateTokenPair,
  verifyToken,
};
