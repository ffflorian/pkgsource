import * as express from 'express';

import {ServerConfig} from '../config';
import {parseRepository} from '../utils';

const {repository} = require('../../package.json');
const repositoryUrl = parseRepository(repository);

const router = express.Router();

export const mainRoute = (config: ServerConfig) => {
  return router.get('/', (req, res) => (repositoryUrl ? res.redirect(repositoryUrl) : res.send('Hello!')));
};
