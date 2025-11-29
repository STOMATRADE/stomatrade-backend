import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChannelNotificationDto {
  @ApiProperty({
    description: 'Unique key identifier for the channel',
    example: 'project_updates',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'Channel description',
    example: 'Channel for project-related updates',
  })
  @IsString()
  @IsNotEmpty()
  desc: string;
}
