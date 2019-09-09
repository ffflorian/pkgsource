import * as express from 'express';
// import * as logdown from 'logdown';

import {ServerConfig} from '../config';

// const logger = logdown('pkgsource/mainRoute', {
//   logger: console,
//   markdown: false,
// });

const router = express.Router();

export const mainRoute = (config: ServerConfig) => {
  return router.get('/', async (req, res) => {
    return res.send('Hello!');
  });
};
