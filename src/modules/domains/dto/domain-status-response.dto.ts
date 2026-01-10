import { ApiProperty } from '@nestjs/swagger';

export class DomainStatusResponseDto {
  @ApiProperty({
    description: 'Domain status (TRUE or FALSE)',
    example: true,
  })
  status: boolean;
}
