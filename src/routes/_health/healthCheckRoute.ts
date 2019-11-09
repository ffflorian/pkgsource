import {Router} from 'express';
import * as HTTP_STATUS from 'http-status-codes';

const router = Router();

export function healthCheckRoute(): Router {
  return router.get('/_health/?', (req, res) => {
    res.sendStatus(HTTP_STATUS.OK);
  });
}
