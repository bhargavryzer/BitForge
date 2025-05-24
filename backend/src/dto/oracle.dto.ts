import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPricesDto {
  @ApiProperty({
    description: 'Comma-separated list of assets',
    example: 'BTC,WBTC,STRK',
    required: false,
  })
  @IsOptional()
  @IsString()
  assets?: string;
}

export class GetVolatilityDto {
  @ApiProperty({
    description: 'Asset to get volatility for',
    example: 'BTC',
    required: false,
  })
  @IsOptional()
  @IsString()
  asset?: string = 'BTC';
}

export class GetHistoricalPricesDto {
  @ApiProperty({
    description: 'Asset to get historical prices for',
    example: 'BTC',
    required: false,
  })
  @IsOptional()
  @IsString()
  asset?: string = 'BTC';

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
