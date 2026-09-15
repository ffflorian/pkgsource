import {Controller, Get, HttpStatus} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';

import {config} from '../config.js';
import {InfoResult} from '../swagger.js';

interface InfoRouteResponseBody {
  code: HttpStatus;
  commit?: string;
  version?: string;
}

@ApiTags('Server Info')
@Controller()
export class InfoController {
  @ApiOperation({description: 'Get information about the server', operationId: 'getServerInformation'})
  @ApiResponse({description: 'That worked', status: HttpStatus.OK, type: InfoResult})
  @Get('_info')
  info(): InfoRouteResponseBody {
    return {
      code: HttpStatus.OK,
      commit: config.COMMIT,
      version: config.VERSION,
    };
  }
}
