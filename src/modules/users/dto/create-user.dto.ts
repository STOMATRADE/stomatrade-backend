import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ROLES } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    description: 'Wallet address of the user',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: ROLES,
    example: ROLES.COLLECTOR,
  })
  @IsEnum(ROLES)
  @IsNotEmpty()
  role: ROLES;
}
