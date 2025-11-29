import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ROLES } from '@prisma/client';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Ethereum wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty({
    description: 'User role',
    enum: ROLES,
    example: 'COLLECTOR',
  })
  @IsEnum(ROLES)
  @IsNotEmpty()
  role: ROLES;
}

