import * as express from 'express';
import * as logdown from 'logdown';

import {formatDate} from '../../utils';

const router = express.Router();

const logger = logdown('pkgsource/errorRoutes', {
  logger: console,
  markdown: false,
});

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
