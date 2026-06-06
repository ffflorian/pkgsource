import {Controller, Get} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {InfoResult} from '../swagger.js';

interface InfoRouteResponseBody {
  code: HTTP_STATUS;
  commit?: string;
  version?: string;
}

@ApiTags('Server Info')
@Controller()
export class InfoController {
  @ApiOperation({description: 'Get information about the server', operationId: 'getServerInformation'})
  @ApiResponse({description: 'That worked', status: HTTP_STATUS.OK, type: InfoResult})
  @Get('_info')
  info(): InfoRouteResponseBody {
    return {
      code: HTTP_STATUS.OK,
      commit: process.env.COMMIT || 'unknown',
      version: process.env.VERSION,
    };
  }
}
