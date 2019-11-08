import * as express from 'express';

import {formatDate, getLogger} from '../../utils';

const router = express.Router();

const logger = getLogger('routes/errorRoutes');

export const internalErrorRoute = (): express.ErrorRequestHandler => (err, req, res, next) => {
  logger.error(`[${formatDate()}] ${err.stack}`);
  const error = {
    code: 500,
    message: 'Internal server error',
    stack: err.stack,
  };
  return res.status(error.code).json(error);
};

export const notFoundRoute = () =>
  router.get('*', (req, res) => {
    const error = {
      code: 404,
      message: 'Not found',
    };
    return res.status(error.code).json(error);
  });
