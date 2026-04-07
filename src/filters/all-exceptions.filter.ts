import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {Response} from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = status === HttpStatus.NOT_FOUND ? 'Not found' : exception.message;
      response.status(status).json({code: status, message});
      return;
    }

    const error = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(error.stack);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      stack: error.stack,
    });
  }
}
