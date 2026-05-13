import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus} from '@nestjs/common';
import {Response} from 'express';

import {getLogger} from '../utils';

const logger = getLogger('AllExceptionsFilter');

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = status === HttpStatus.NOT_FOUND ? 'Not found' : exception.message;
      logger.info(`HTTP exception: ${status} ${message}`);
      response.status(status).json({code: status, message});
      return;
    }

    const error = exception instanceof Error ? exception : new Error(String(exception));
    logger.error(error.stack);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      stack: error.stack,
    });
  }
}
