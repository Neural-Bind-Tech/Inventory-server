import type { Prisma } from '../generated/prisma/client';
import type { IApiErrorResponse } from '../interface';

const handleValidationError = (
  error: Prisma.PrismaClientValidationError
): IApiErrorResponse => {
  const errors = [
    {
      path: '',
      message: error.message,
    },
  ];
  const statusCode = 400;
  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: errors,
  };
};

export default handleValidationError;
