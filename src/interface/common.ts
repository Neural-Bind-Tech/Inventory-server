import type { UserRole } from '../generated/prisma/enums';

export type IApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?:
    | {
        page: number;
        limit: number;
        total: number;
      }
    | undefined;
  data?: T | null | undefined;
};

export type IApiErrorMessage = {
  path: any;
  message: string;
};

export type IApiErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IApiErrorMessage[];
};

export type IPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type JWTPayload = {
  userId: string;
  role: UserRole;
  email?: string;
  phone: string;
};
