import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProjectSubmissionDto {
  @ApiProperty({example: 'cc0e8400-e29b-41d4-a716-446655440007',})
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({example: '1000000000000000000000',})
  @IsString()
  @IsNotEmpty()
  valueProject: string;

  @ApiProperty({example: '500000000000000000000',})
  @IsString()
  @IsNotEmpty()
  maxCrowdFunding: string;

  @ApiProperty({
    example: '5000',
    description: 'Total kilograms of commodity',
    required: false,
  })
  @IsString()
  @IsOptional()
  totalKilos?: string;

  @ApiProperty({
    example: '25000',
    description: 'Profit per kilogram in wei',
    required: false,
  })
  @IsString()
  @IsOptional()
  profitPerKillos?: string;

  @ApiProperty({
    example: 25,
    description: 'Shared profit percentage (e.g., 25 for 25%)',
    required: false,
  })
  @IsInt()
  @IsOptional()
  sharedProfit?: number;

  @ApiProperty({example: 'QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    required: false,})
  @IsString()
  @IsOptional()
  metadataCid?: string;

  @ApiProperty({example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44E',})
  @IsString()
  @IsNotEmpty()
  submittedBy: string;
}
