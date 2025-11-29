import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelNotificationDto {
  @ApiProperty({example: 'project_updates',})
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({example: 'Channel for project-related updates',})
  @IsString()
  @IsNotEmpty()
  desc: string;
}
