import {Controller, Get} from '@nestjs/common';
import {findUpSync} from 'find-up';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import fs from 'node:fs';

import {getLogger} from '../utils';

interface InfoRouteResponseBody {
  code: HTTP_STATUS;
  commit?: string;
  version?: string;
}

const logger = getLogger('controllers/InfoController');

let version: string | undefined;

const packageJsonPath = findUpSync('package.json', {allowSymlinks: false, cwd: '.'});
if (!packageJsonPath) {
  logger.warn('Could not find file `package.json`. Version will not be shown in the `_info` endpoint');
} else {
  version = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')).version;
}

@Controller()
export class InfoController {
  @Get('_info')
  info(): InfoRouteResponseBody {
    return {
      code: HTTP_STATUS.OK,
      commit: process.env.SOURCE_COMMIT || 'main',
      ...(version && {version}),
    };
  }
}
