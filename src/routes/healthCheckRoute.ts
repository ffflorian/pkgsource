import {Router} from 'express';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

const router = Router();

export function healthCheckRoute(): Router {
  return router.get<void, HTTP_STATUS>('/_health{/}', (_request, response) => {
    response.sendStatus(HTTP_STATUS.OK);
  });
}
