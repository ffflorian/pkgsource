import {ErrorRequestHandler, Router} from 'express';

import * as HTTP_STATUS from 'http-status-codes';
import {formatDate, getLogger} from '../../utils';

const logger = getLogger('routes/errorRoutes');
const router = Router();

export function internalErrorRoute(): ErrorRequestHandler {
  return (err, req, res) => {
    logger.error(`[${formatDate()}] ${err.stack}`);
    const error = {
      code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      stack: err.stack,
    };
    return res.status(error.code).json(error);
  };
}

export function notFoundRoute(): Router {
  return router.get('*', (req, res) => {
    const error = {
      code: HTTP_STATUS.NOT_FOUND,
      message: 'Not found',
    };
    return res.status(error.code).json(error);
  });
}
