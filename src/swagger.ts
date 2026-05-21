import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class InfoResult {
  @ApiProperty()
  code!: number;

  @ApiPropertyOptional()
  commit?: string;

  @ApiPropertyOptional()
  version?: string;
}

export class RawError {
  @ApiProperty()
  code!: number;

  @ApiProperty()
  message!: string;
}

export class RawErrorWithPackageInfo extends RawError {
  @ApiPropertyOptional({
    additionalProperties: true,
    description:
      'Metadata from npm for the requested package/version (for example name and version). Returned when no valid source URL can be resolved.',
    type: Object,
  })
  packageInfo?: Record<string, unknown>;
}

export class RawResult {
  @ApiProperty()
  code!: number;

  @ApiProperty()
  url!: string;
}
