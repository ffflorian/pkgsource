import {Router} from 'express';
import * as HTTP_STATUS from 'http-status-codes';

import {RepositoryParser} from '../RepositoryParser';

const {repository}: {repository: string} = require('../../package.json');
const repositoryUrl = RepositoryParser.parseRepositoryEntry(repository);

const router = Router();

export function mainRoute(): Router {
  return router
    .get('/', (req, res) => {
      if (!repositoryUrl) {
        return res.contentType('text/plain').send('Hello!');
      }

      if ('raw' in req.query) {
        return res.json({
          code: HTTP_STATUS.OK,
          url: repositoryUrl,
        });
      }

      return res.redirect(repositoryUrl);
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
