import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiException } from '../exceptions/api.exception';
import { CustomLoggerService } from '../logger/logger.service'; // Import logger

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {} // Inject logger

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let errorCode: string | undefined;
    let stack: string | undefined;

    if (exception instanceof ApiException) {
      status = exception.getStatus();
      message = exception.message;
      errorCode = exception.errorCode;
      stack = exception.stack;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      stack = exception.stack;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error: ' + exception.message;
      stack = exception.stack;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred.';
    }

    const logMessage = {
      message: `Error: ${message}`,
      errorCode,
      path: request.url,
      stack,
      method: request.method,
      body: request.body, // Be cautious with logging sensitive body data in production
      query: request.query,
      params: request.params,
    };

    if (status >= 500) {
      this.logger.error(logMessage.message, stack, `GlobalExceptionFilter - ${status}`);
    } else {
      this.logger.warn(logMessage.message, `GlobalExceptionFilter - ${status}`);
    }
    
    // Log the full context for better debugging, customize as needed
    this.logger.debug('Full error context for request', JSON.stringify(logMessage, null, 2));


    const responseBody = {
      statusCode: status,
      message: message,
      errorCode: errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (errorCode === undefined) {
      delete responseBody.errorCode;
    }
    
    response.status(status).json(responseBody);
  }
}
