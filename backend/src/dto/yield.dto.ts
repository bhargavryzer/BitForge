import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetYieldHistoryDto {
  @ApiProperty({
    description: 'Filter by user address',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Number of days to look back',
    example: 30,
    required: false,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  days?: number = 30;
}

export class RebalanceDto {
  @ApiProperty({
    description: 'Force rebalance even if threshold not met',
    example: false,
    required: false,
  })
  @IsOptional()
  force?: boolean = false;
}
