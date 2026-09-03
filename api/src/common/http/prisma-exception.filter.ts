import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

type PrismaErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();
    const errorResponse = mapPrismaError(exception.code);

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}

function mapPrismaError(code: string): PrismaErrorResponse {
  if (code === 'P2025') {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      code: 'RESOURCE_NOT_FOUND',
      message: 'The requested resource was not found.',
    };
  }

  if (code === 'P2002') {
    return {
      statusCode: HttpStatus.CONFLICT,
      code: 'RESOURCE_CONFLICT',
      message: 'The requested change conflicts with existing data.',
    };
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'DATABASE_ERROR',
    message: 'An unexpected database error occurred.',
  };
}
