import {Router} from 'express';
import * as HTTP_STATUS from 'http-status-codes';

export function healthCheckRoute(): Router {
  return Router().get('/_health/?', (req, res) => {
    res.sendStatus(HTTP_STATUS.OK);
  });
}
