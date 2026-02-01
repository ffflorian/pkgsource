import {ErrorRequestHandler, Router} from 'express';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {formatDate, getLogger} from '../../utils.js';

interface InternalErrorRouteResponseBody {
  code: HTTP_STATUS;
  message: string;
  stack?: string;
}

interface NotFoundRouteResponseBody {
  code: HTTP_STATUS;
  message: string;
}

const logger = getLogger('routes/errorRoutes');
const router = Router();

export function internalErrorRoute(): ErrorRequestHandler<void, InternalErrorRouteResponseBody> {
  return (error: Error, _request, response) => {
    logger.error(`[${formatDate()}] ${error.stack}`);
    response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      stack: error.stack,
    });
  };
}

export function notFoundRoute(): Router {
  return router.get<void, NotFoundRouteResponseBody>('*splat', (_request, response) => {
    response.status(HTTP_STATUS.NOT_FOUND).json({
      code: HTTP_STATUS.NOT_FOUND,
      message: 'Not found',
    });
  });
}
