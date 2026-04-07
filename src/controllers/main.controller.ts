import {Controller, Get, Query, Res} from '@nestjs/common';
import {Response} from 'express';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {getLogger} from '../utils';
import {unpkgBase} from './packages.controller';

interface MainRouteResponseBody {
  code: HTTP_STATUS;
  message?: string;
  url?: string;
}

const logger = getLogger('controllers/MainController');
const repositoryUrl = 'https://github.com/ffflorian/pkgsource';

@Controller()
export class MainController {
  @Get('favicon.ico')
  favicon(@Res() res: Response): void {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      code: HTTP_STATUS.NOT_FOUND,
      message: 'Not found',
    } satisfies MainRouteResponseBody);
  }

  @Get()
  main(
    @Query('raw') raw: string,
    @Query('unpkg') unpkg: string,
    @Res() res: Response
  ): void {
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

  @Get('robots.txt')
  robots(@Res() res: Response): void {
    res.contentType('text/plain').send('User-agent: *\nDisallow: /');
  }
}
