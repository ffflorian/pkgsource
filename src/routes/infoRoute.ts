import {Router} from 'express';
import {findUpSync} from 'find-up';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import fs from 'node:fs';

import {getLogger} from '../utils.js';

interface InfoRouteResponseBody {
  code: HTTP_STATUS;
  commit?: string;
  version?: string;
}

const logger = getLogger('routes/infoRoute');

const router = Router();
let version: string;
let commit: string;

const packageJsonPath = findUpSync('package.json', {allowSymlinks: false, cwd: '.'});
if (!packageJsonPath) {
  logger.warn('Could not find file `package.json`. Version will not be shown in the `_info` endpoint');
} else {
  version = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')).version;
}

const commitPath = findUpSync('commit', {allowSymlinks: false, cwd: '.'});
if (!commitPath) {
  logger.warn('Could not find file `commit`. Commit will not be shown in the `_info` endpoint');
} else {
  commit = fs.readFileSync(commitPath, 'utf-8');
}

export function infoRoute(): Router {
  return router.get<void, InfoRouteResponseBody>('/_info{/}', (_request, res) => {
    res.json({
      code: HTTP_STATUS.OK,
      ...(commit && {commit}),
      ...(version && {version}),
    });
  });
}
