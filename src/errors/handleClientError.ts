import type { Prisma } from '../generated/prisma/client';
import type { IApiErrorMessage, IApiErrorResponse } from '../interface';

const handleClientError = (
  error: Prisma.PrismaClientKnownRequestError
): IApiErrorResponse => {
  let errors: IApiErrorMessage[] = [];
  let message = '';
  let statusCode = 400;

  switch (error.code) {
    case 'P2025': {
      statusCode = 404;
      message = (error.meta?.['cause'] as string) || 'Record not found!';
      errors = [{ path: '', message }];
      break;
    }
    case 'P2002': {
      statusCode = 409;
      const target = error.meta?.['target'] as string[];
      const field = target?.join(', ') || 'unknown field';
      message = `Duplicate entry for: ${field}`;
      errors = [{ path: field, message }];
      break;
    }
    case 'P2003': {
      message = error.message.includes('delete()` invocation:')
        ? 'Delete failed: related record depends on this entry'
        : 'Foreign key constraint failed';
      errors = [{ path: '', message }];
      break;
    }
    case 'P2024': {
      statusCode = 503;
      message = 'Database operation timed out. Please try again.';
      errors = [{ path: '', message }];
      break;
    }
    default: {
      message = 'A database error occurred';
      errors = [{ path: '', message: error.message }];
      break;
    }
  }

  return {
    statusCode,
    message,
    errorMessages: errors,
  };
};

export default handleClientError;

//"//\nInvalid `prisma.semesterRegistration.delete()` invocation:\n\n\nAn operation failed because it depends on one or more records that were required but not found. Record to delete does not exist.",
