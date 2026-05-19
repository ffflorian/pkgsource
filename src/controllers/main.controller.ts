import {Controller, Get, Query, Res} from '@nestjs/common';
import {ApiExcludeEndpoint, ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Response} from 'express';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {RawResult} from '../swagger';
import {getLogger} from '../utils';
import {unpkgBase} from './packages.controller';

interface MainRouteResponseBody {
  code: HTTP_STATUS;
  message?: string;
  url?: string;
}

const logger = getLogger('controllers/MainController');
const repositoryUrl = 'https://github.com/ffflorian/pkgsource';

@ApiTags('API')
@Controller()
export class MainController {
  @ApiExcludeEndpoint()
  @Get('favicon.ico')
  favicon(@Res() res: Response): void {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      code: HTTP_STATUS.NOT_FOUND,
      message: 'Not found',
    } satisfies MainRouteResponseBody);
  }

  @ApiOperation({description: "Get the server's repository URL", operationId: 'getServerRepositoryUrl'})
  @ApiQuery({description: 'Get the result as JSON', name: 'raw', required: false, type: Boolean})
  @ApiQuery({description: 'Get a link to unpkg.com', name: 'unpkg', required: false, type: Boolean})
  @ApiResponse({description: 'That worked', status: HTTP_STATUS.OK, type: RawResult})
  @ApiResponse({description: 'Redirect to repository URL', status: HTTP_STATUS.MOVED_TEMPORARILY})
  @Get()
  main(@Query('raw') raw: string, @Query('unpkg') unpkg: string, @Res() res: Response): void {
    logger.info('Got request for main page');

    if (unpkg !== undefined && unpkg !== 'false') {
      const redirectUrl = `${unpkgBase}/pkgsource@latest/`;
      if (raw !== undefined && raw !== 'false') {
        logger.info(`Returning raw unpkg info for main page: "${redirectUrl}" ...`);
        res.json({
          code: HTTP_STATUS.OK,
          url: redirectUrl,
        } satisfies MainRouteResponseBody);
        return;
      }
      logger.info(`Redirecting main page to unpkg: "${redirectUrl}" ...`);
      res.redirect(HTTP_STATUS.MOVED_TEMPORARILY, redirectUrl);
      return;
    }

    if (raw !== undefined && raw !== 'false') {
      logger.info(`Returning raw info for main page: "${repositoryUrl}" ...`);
      res.json({
        code: HTTP_STATUS.OK,
        url: repositoryUrl,
      } satisfies MainRouteResponseBody);
      return;
    }

    logger.info(`Redirecting main page to "${repositoryUrl}" ...`);
    res.redirect(repositoryUrl);
  }

  @ApiExcludeEndpoint()
  @Get('robots.txt')
  robots(@Res() res: Response): void {
    res.contentType('text/plain').send('User-agent: *\nDisallow: /');
  }
}
