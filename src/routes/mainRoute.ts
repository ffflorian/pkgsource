import * as express from 'express';

import {ServerConfig} from '../config';
import {parseRepository} from '../utils';

const {repository} = require('../../package.json');
const repositoryUrl = parseRepository(repository);

const router = express.Router();

export const mainRoute = (config: ServerConfig) => {
  return router
    .get('/', (req, res) =>
      repositoryUrl ? res.redirect(repositoryUrl) : res.contentType('text/plain').send('Hello!')
    )
    .get('/robots.txt', (req, res) => res.contentType('text/plain').send('User-agent: *\nDisallow: /'))
    .get('/favicon.ico', (req, res) => res.status(404).send('Not found'));
};
