import {Controller, Get, HttpStatus, Query, Res} from '@nestjs/common';
import {ApiExcludeEndpoint, ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Response} from 'express';

import {RawResult} from '../swagger.js';
import {getLogger} from '../utils.js';
import {unpkgBase} from './packages.controller.js';

interface MainRouteResponseBody {
  code: HttpStatus;
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
    res.status(HttpStatus.NOT_FOUND).json({
      code: HttpStatus.NOT_FOUND,
      message: 'Not found',
    } satisfies MainRouteResponseBody);
  }

  @ApiOperation({description: "Get the server's repository URL", operationId: 'getServerRepositoryUrl'})
  @ApiQuery({description: 'Get the result as JSON', name: 'raw', required: false, type: Boolean})
  @ApiQuery({description: 'Get a link to unpkg.com', name: 'unpkg', required: false, type: Boolean})
  @ApiResponse({description: 'That worked', status: HttpStatus.OK, type: RawResult})
  @ApiResponse({description: 'Redirect to repository URL', status: HttpStatus.FOUND})
  @Get()
  main(@Query('raw') raw: string, @Query('unpkg') unpkg: string, @Res() res: Response): void {
    logger.info('Got request for main page');

    if (unpkg !== undefined && unpkg !== 'false') {
      const redirectUrl = `${unpkgBase}/pkgsource@latest/`;
      if (raw !== undefined && raw !== 'false') {
        logger.info(`Returning raw unpkg info for main page: "${redirectUrl}" ...`);
        res.json({
          code: HttpStatus.OK,
          url: redirectUrl,
        } satisfies MainRouteResponseBody);
        return;
      }
      logger.info(`Redirecting main page to unpkg: "${redirectUrl}" ...`);
      res.redirect(HttpStatus.FOUND, redirectUrl);
      return;
    }

    if (raw !== undefined && raw !== 'false') {
      logger.info(`Returning raw info for main page: "${repositoryUrl}" ...`);
      res.json({
        code: HttpStatus.OK,
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
