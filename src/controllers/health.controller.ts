import {Controller, Get, HttpCode, HttpStatus, Res} from '@nestjs/common';
import {Response} from 'express';

@Controller()
export class HealthController {
  @Get('_health')
  @HttpCode(HttpStatus.OK)
  health(@Res() res: Response): void {
    res.sendStatus(HttpStatus.OK);
  }
}
