import { ApiProperty } from '@nestjs/swagger';

export class ResponseHeaderDto {
  @ApiProperty({
    example: 200,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Success',
    type: String,
  })
  message: string;

  @ApiProperty({
    example: '2025-11-30T10:30:00.000Z',
    type: String,
  })
  timestamp: string;
}

export class ApiResponseDto<T = any> {
  @ApiProperty({
    type: ResponseHeaderDto,
  })
  header: ResponseHeaderDto;

  @ApiProperty()
  data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.header = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };
    this.data = data;
  }
}

export class PaginationMetaDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  page: number;

  @ApiProperty({
    example: 10,
    type: Number,
  })
  limit: number;

  @ApiProperty({
    example: 100,
    type: Number,
  })
  total: number;

  @ApiProperty({
    example: 10,
    type: Number,
  })
  totalPages: number;
}

export class PaginatedDataDto<T = any> {
  @ApiProperty({
    isArray: true,
  })
  items: T[];

  @ApiProperty({
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

export class ErrorResponseDto {
  @ApiProperty({
    type: ResponseHeaderDto,
  })
  header: ResponseHeaderDto;

  @ApiProperty({
    required: false,
    example: { field: 'email', message: 'Invalid email format' },
  })
  data?: any;

  constructor(statusCode: number, message: string, data?: any) {
    this.header = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };
    this.data = data || null;
  }
}
