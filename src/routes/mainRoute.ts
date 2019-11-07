import * as express from 'express';

import {ServerConfig} from '../config';
import {RepositoryParser} from '../RepositoryParser';

const {repository}: {repository: string} = require('../../package.json');
const repositoryUrl = RepositoryParser.parseRepository(repository);

const router = express.Router();

export const mainRoute = (config: ServerConfig) => {
  return router
    .get('/', (req, res) => {
      if (repositoryUrl) {
        if ('raw' in req.query) {
          return res.json({
            code: 200,
            url: repositoryUrl,
          });
        }
        return res.redirect(repositoryUrl);
      }
      return res.contentType('text/plain').send('Hello!');
    })
    .get('/robots.txt', (req, res) => res.contentType('text/plain').send('User-agent: *\nDisallow: /'))
    .get('/favicon.ico', (req, res) => res.status(404).send({code: 404, message: 'Not found'}));
};
