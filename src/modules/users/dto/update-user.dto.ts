import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ROLES } from '@prisma/client';

export class UpdateUserDto {
  @ApiProperty({enum: ROLES,
    example: 'ADMIN',
    required: false,})
  @IsEnum(ROLES)
  @IsOptional()
  role?: ROLES;
}
