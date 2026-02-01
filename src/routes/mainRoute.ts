import {Router} from 'express';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {getLogger} from '../utils.js';
import {unpkgBase} from './packagesRoute.js';

type MainRouteParamsDictionary = [string, string];

type MainRouteQueryParameters = Record<'raw' | 'unpkg', string>;

interface MainRouteResponseBody {
  code: HTTP_STATUS;
  message?: string;
  url?: string;
}

const logger = getLogger('routes/mainRoute');
const router = Router();
const repositoryUrl = 'https://github.com/ffflorian/pkgsource';

export function mainRoute(): Router {
  return router
    .get<MainRouteParamsDictionary, MainRouteResponseBody, void, MainRouteQueryParameters>('/', (req, res) => {
      logger.info('Got request for main page');

      if ('unpkg' in req.query && req.query.unpkg !== 'false') {
        const redirectUrl = `${unpkgBase}/pkgsource@latest/`;
        if ('raw' in req.query && req.query.raw !== 'false') {
          logger.info(`Returning raw unpkg info for main page: "${redirectUrl}" ...`);
          res.json({
            code: HTTP_STATUS.OK,
            url: redirectUrl,
          });
          return;
        }
        logger.info(`Redirecting main page to unpkg: "${redirectUrl}" ...`);
        res.redirect(HTTP_STATUS.MOVED_TEMPORARILY, redirectUrl);
        return;
      }

      if ('raw' in req.query && req.query.raw !== 'false') {
        logger.info(`Returning raw info for main page: "${repositoryUrl}" ...`);
        res.json({
          code: HTTP_STATUS.OK,
          url: repositoryUrl,
        });
        return;
      }

      logger.info(`Redirecting main page to "${repositoryUrl}" ...`);
      res.redirect(repositoryUrl);
    })
    .get('/robots.txt', (_, res) => {
      res.contentType('text/plain').send('User-agent: *\nDisallow: /');
    })
    .get('/favicon.ico', (_, res) => {
      res.status(HTTP_STATUS.NOT_FOUND).send({
        code: HTTP_STATUS.NOT_FOUND,
        message: 'Not found',
      });
    });
}
