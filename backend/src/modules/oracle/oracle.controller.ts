import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OracleService } from './oracle.service';

@ApiTags('oracle')
@Controller('oracle')
export class OracleController {
  constructor(private readonly oracleService: OracleService) {}

  @Get('prices')
  @ApiOperation({ summary: 'Get current prices from Pragma oracle' })
  @ApiQuery({ name: 'assets', description: 'Comma-separated list of assets', required: false })
  async getPrices(@Query('assets') assets?: string) {
    const assetList = assets ? assets.split(',') : ['BTC', 'WBTC', 'STRK'];
    return this.oracleService.getPrices(assetList);
  }

  @Get('apy')
  @ApiOperation({ summary: 'Get current APY data from Pragma oracle' })
  async getApyData() {
    return this.oracleService.getApyData();
  }

  @Get('volatility')
  @ApiOperation({ summary: 'Get market volatility data from Pragma oracle' })
  @ApiQuery({ name: 'asset', description: 'Asset to get volatility for', required: false })
  async getVolatility(@Query('asset') asset: string = 'BTC') {
    return this.oracleService.getVolatility(asset);
  }

  @Get('historical-prices')
  @ApiOperation({ summary: 'Get historical price data from Pragma oracle' })
  @ApiQuery({ name: 'asset', description: 'Asset to get historical prices for', required: false })
  @ApiQuery({ name: 'days', description: 'Number of days to look back', required: false })
  async getHistoricalPrices(
    @Query('asset') asset: string = 'BTC',
    @Query('days') days: number = 30,
  ) {
    return this.oracleService.getHistoricalPrices(asset, days);
  }
}
