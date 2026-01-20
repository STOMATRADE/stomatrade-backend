import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class BuildTransactionDto {
  @ApiProperty({
    description: 'Project ID to invest in',
    example: '95da48fa-7cfb-4520-aa3c-b82057aee248',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'Investment amount in clean format (not wei)',
    example: '10000',
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'Investor wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'investorAddress must be a valid Ethereum address',
  })
  investorAddress: string;
}

export class TransactionDataDto {
  @ApiProperty({
    description: 'Contract address to call',
    example: '0x9B8C75890676574c00cc992FD48F73da2A9272db',
  })
  to: string;

  @ApiProperty({
    description: 'Hex encoded transaction data',
    example: '0x095ea7b3000000000000000000000000...',
  })
  data: string;
}

export class ProjectInfoDto {
  @ApiProperty({ example: '95da48fa-7cfb-4520-aa3c-b82057aee248' })
  id: string;

  @ApiProperty({ example: 'Rice Farming Project' })
  name: string;

  @ApiProperty({ example: 5 })
  tokenId: number;

  @ApiProperty({ example: 'Ahmad Hidayat' })
  farmerName: string;

  @ApiProperty({ example: 'Rice' })
  commodity: string;
}

export class BuildTransactionResponseDto {
  @ApiProperty({
    type: TransactionDataDto,
  })
  approval: TransactionDataDto;

  @ApiProperty({
    type: TransactionDataDto,
  })
  invest: TransactionDataDto;

  @ApiProperty({
    example: '0x9B8C75890676574c00cc992FD48F73da2A9272db',
  })
  idrxAddress: string;

  @ApiProperty({
    example: '0x08A2cefa99A8848cD3aC34620f49F115587dcE28',
  })
  stomaTradeAddress: string;

  @ApiProperty({
    example: '10000000000000000000000',
  })
  amountWei: string;

  @ApiProperty({
    example: '10000',
  })
  amountClean: string;

  @ApiProperty({
    example: 4202,
  })
  chainId: number;

  @ApiProperty({
    type: ProjectInfoDto,
  })
  project: ProjectInfoDto;
}
