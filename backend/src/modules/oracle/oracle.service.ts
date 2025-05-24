import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PragmaService } from '../../services/pragma.service';

@Injectable()
export class OracleService {
  constructor(
    private readonly configService: ConfigService,
    private readonly pragmaService: PragmaService
  ) {}

  async getPrices(assets: string[]) {
    try {
      const prices = await this.pragmaService.getPrices(assets);
      
      return {
        timestamp: new Date().toISOString(),
        source: 'Pragma Oracle',
        prices,
      };
    } catch (error) {
      console.error('Error getting prices:', error);
      throw new Error('Failed to get prices from oracle');
    }
  }

  async getApyData() {
    try {
      const apyData = await this.pragmaService.getApyData();
      
      return {
        timestamp: new Date().toISOString(),
        source: 'Pragma Oracle',
        apyData,
      };
    } catch (error) {
      console.error('Error getting APY data:', error);
      throw new Error('Failed to get APY data from oracle');
    }
  }

  async getVolatility(asset: string) {
    try {
      const volatility = await this.pragmaService.getVolatility(asset);
      
      return {
        asset,
        timestamp: new Date().toISOString(),
        source: 'Pragma Oracle',
        volatility,
      };
    } catch (error) {
      console.error('Error getting volatility data:', error);
      throw new Error('Failed to get volatility data from oracle');
    }
  }

  async getHistoricalPrices(asset: string, days: number) {
    try {
      const prices = await this.pragmaService.getHistoricalPrices(asset, days);
      
      return {
        asset,
        days,
        timestamp: new Date().toISOString(),
        source: 'Pragma Oracle',
        prices,
      };
    } catch (error) {
      console.error('Error getting historical prices:', error);
      throw new Error('Failed to get historical prices from oracle');
    }
  }
}
