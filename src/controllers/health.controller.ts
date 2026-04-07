import {Controller, Get, HttpCode, HttpStatus, Res} from '@nestjs/common';
import {Response} from 'express';

import {getLogger} from '../utils';

const logger = getLogger('controllers/HealthController');

@Controller()
export class HealthController {
  @Get('_health')
  @HttpCode(HttpStatus.OK)
  health(@Res() res: Response): void {
    logger.info('Health check requested.');
    res.sendStatus(HttpStatus.OK);
  }
}
