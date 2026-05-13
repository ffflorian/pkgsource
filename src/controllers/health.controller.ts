import {Controller, Get, HttpCode, HttpStatus, Res} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Response} from 'express';

@ApiTags('Server Info')
@Controller()
export class HealthController {
  @ApiOperation({description: "Get the server's health status", operationId: 'getServerHealth'})
  @ApiResponse({description: 'Everything is ok', status: HttpStatus.OK})
  @Get('_health')
  @HttpCode(HttpStatus.OK)
  health(@Res() res: Response): void {
    res.sendStatus(HttpStatus.OK);
  }
}
