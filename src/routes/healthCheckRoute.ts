import {Router} from 'express';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

const router = Router();

export function healthCheckRoute(): Router {
  return router.get('/_health/?', (_, res) => {
    res.sendStatus(HTTP_STATUS.OK);
  });
}
