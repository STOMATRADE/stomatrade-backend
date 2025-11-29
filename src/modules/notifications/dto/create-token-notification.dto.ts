import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTokenNotificationDto {
  @ApiProperty({example: '550e8400-e29b-41d4-a716-446655440000',})
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({example: 'fcm_token_abc123xyz',})
  @IsString()
  @IsNotEmpty()
  tokenId: string;
}
