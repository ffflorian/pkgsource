import {Router} from 'express';
import * as HTTP_STATUS from 'http-status-codes';

import {getLogger} from '../utils';
import {unpkgBase} from './packagesRoute';
import {repositoryURL} from '../lib';

const logger = getLogger('routes/mainRoute');
const router = Router();

export function mainRoute(): Router {
  return router
    .get('/', (req, res) => {
      logger.info('Got request for main site');

      if ('unpkg' in req.query && req.query.unpkg !== 'false') {
        const redirectSite = `${unpkgBase}/pkgsource@latest/`;
        if ('raw' in req.query && req.query.raw !== 'false') {
          logger.info(`Returning raw unpkg info main site: "${redirectSite}" ...`);
          return res.json({
            code: HTTP_STATUS.OK,
            url: redirectSite,
          });
        }
        logger.info(`Redirecting main page to unpkg: "${redirectSite}" ...`);
        return res.redirect(HTTP_STATUS.MOVED_TEMPORARILY, redirectSite);
      }

      if ('raw' in req.query && req.query.raw !== 'false') {
        logger.info(`Returning raw info for main page: "${repositoryURL}" ...`);
        return res.json({
          code: HTTP_STATUS.OK,
          url: repositoryURL,
        });
      }

      logger.info(`Redirecting main page to "${repositoryURL}" ...`);
      return res.redirect(repositoryURL);
    })
    .get('/robots.txt', (req, res) => {
      return res.contentType('text/plain').send('User-agent: *\nDisallow: /');
    })
    .get('/favicon.ico', (req, res) => {
      return res.status(HTTP_STATUS.NOT_FOUND).send({
        code: HTTP_STATUS.NOT_FOUND,
        message: 'Not found',
      });
    });
}
