import {Router} from 'express';
import * as findUp from 'find-up';
import * as fs from 'fs';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {getLogger} from '../utils';

const logger = getLogger('routes/infoRoute');

const router = Router();

let version: string;
let commit: string;

const packageJsonPath = findUp.sync('package.json', {allowSymlinks: false, cwd: __dirname});
if (!packageJsonPath) {
  logger.warn('Could not find file `package.json`. Version will not be shown in the `_info` endpoint');
} else {
  version = require(packageJsonPath).version;
}

const commitPath = findUp.sync('commit', {allowSymlinks: false, cwd: __dirname});
if (!commitPath) {
  logger.warn('Could not find file `commit`. Commit will not be shown in the `_info` endpoint');
} else {
  commit = fs.readFileSync(commitPath, 'utf-8');
}

export function infoRoute(): Router {
  return router.get('/_info/?', (_req, res) => {
    return res.json({
      code: HTTP_STATUS.OK,
      ...(commit ? {commit} : undefined),
      ...(version ? {version} : undefined),
    });
  });
}
