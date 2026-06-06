import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class InfoResult {
  @ApiProperty({type: Number})
  code!: number;

  @ApiPropertyOptional({type: String})
  commit?: string;

  @ApiPropertyOptional({type: String})
  version?: string;
}

export class RawError {
  @ApiProperty({type: Number})
  code!: number;

  @ApiProperty({type: String})
  message!: string;
}

export class RawResult {
  @ApiProperty({type: Number})
  code!: number;

  @ApiProperty({type: String})
  url!: string;
}
