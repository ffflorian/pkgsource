import {Router} from 'express';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {getLogger} from '../utils';
import {unpkgBase} from './packagesRoute';

const logger = getLogger('routes/mainRoute');
const router = Router();
const repositoryUrl = 'https://github.com/ffflorian/pkgsource';

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
        logger.info(`Returning raw info for main page: "${repositoryUrl}" ...`);
        return res.json({
          code: HTTP_STATUS.OK,
          url: repositoryUrl,
        });
      }

      logger.info(`Redirecting main page to "${repositoryUrl}" ...`);
      return res.redirect(repositoryUrl);
    })
    .get('/robots.txt', (_, res) => {
      return res.contentType('text/plain').send('User-agent: *\nDisallow: /');
    })
    .get('/favicon.ico', (_, res) => {
      return res.status(HTTP_STATUS.NOT_FOUND).send({
        code: HTTP_STATUS.NOT_FOUND,
        message: 'Not found',
      });
    });
}
