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

export class RawResult {
  @ApiProperty()
  code!: number;

  @ApiProperty()
  url!: string;
}
