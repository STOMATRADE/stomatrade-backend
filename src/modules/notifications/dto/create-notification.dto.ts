import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({example: 'dd0e8400-e29b-41d4-a716-446655440008',})
  @IsUUID()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty({example: 'New Project Available',})
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({example: 'A new rice project has been added to your area',})
  @IsString()
  @IsNotEmpty()
  body: string;
}
