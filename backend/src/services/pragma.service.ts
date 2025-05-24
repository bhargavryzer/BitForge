import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PragmaService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://api.pragma.build/v1';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('pragma.apiKey');
  }

  async getPrices(assets: string[]): Promise<Record<string, number>> {
    try {
      // In a real implementation, this would call the Pragma API
      // For simplicity, returning mock data
      const prices = {};
      
      for (const asset of assets) {
        if (asset === 'BTC') {
          prices[asset] = 65000 + Math.random() * 2000;
        } else if (asset === 'WBTC') {
          prices[asset] = 65000 + Math.random() * 2000;
        } else if (asset === 'STRK') {
          prices[asset] = 3.5 + Math.random() * 0.5;
        } else if (asset === 'LBTC') {
          prices[asset] = 65000 + Math.random() * 2000;
        } else {
          prices[asset] = 100 + Math.random() * 50;
        }
      }
      
      return prices;
    } catch (error) {
      console.error('Error fetching prices from Pragma:', error);
      throw new Error('Failed to fetch prices from Pragma Oracle');
    }
  }

  async getApyData(): Promise<{
    vesu: { lending: number; borrowing: number; utilization: number };
    babylon: { staking: number; rewards: number; total: number };
    ekubo: { fees: number; rewards: number; total: number };
  }> {
    try {
      // In a real implementation, this would call the Pragma API
      // For simplicity, returning mock data
      return {
        vesu: {
          lending: 14.5,
          borrowing: 18.2,
          utilization: 78.5,
        },
        babylon: {
          staking: 8.2,
          rewards: 2.5,
          total: 10.7,
        },
        ekubo: {
          fees: 12.3,
          rewards: 5.5,
          total: 17.8,
        },
      };
    } catch (error) {
      console.error('Error fetching APY data from Pragma:', error);
      throw new Error('Failed to fetch APY data from Pragma Oracle');
    }
  }

  async getVolatility(asset: string): Promise<Record<string, number>> {
    try {
      // In a real implementation, this would call the Pragma API
      // For simplicity, returning mock data
      const timeframes = ['1d', '7d', '30d'];
      const volatility = {};
      
      for (const timeframe of timeframes) {
        if (timeframe === '1d') {
          volatility[timeframe] = 1.2 + Math.random() * 0.8;
        } else if (timeframe === '7d') {
          volatility[timeframe] = 2.5 + Math.random() * 1.5;
        } else if (timeframe === '30d') {
          volatility[timeframe] = 4.8 + Math.random() * 2.2;
        }
      }
      
      return volatility;
    } catch (error) {
      console.error('Error fetching volatility data from Pragma:', error);
      throw new Error('Failed to fetch volatility data from Pragma Oracle');
    }
  }

  async getHistoricalPrices(asset: string, days: number): Promise<Array<{ date: string; price: string }>> {
    try {
      // In a real implementation, this would call the Pragma API
      // For simplicity, returning mock data
      const today = new Date();
      const prices = [];
      
      // Generate base price based on asset
      let basePrice = 0;
      if (asset === 'BTC' || asset === 'WBTC' || asset === 'LBTC') {
        basePrice = 65000;
      } else if (asset === 'STRK') {
        basePrice = 3.5;
      } else {
        basePrice = 100;
      }
      
      // Generate random price movements
      let currentPrice = basePrice;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Add some random price movement (-2% to +2%)
        const change = (Math.random() * 4 - 2) / 100;
        currentPrice = currentPrice * (1 + change);
        
        prices.push({
          date: date.toISOString().split('T')[0],
          price: currentPrice.toFixed(2),
        });
      }
      
      return prices;
    } catch (error) {
      console.error('Error fetching historical prices from Pragma:', error);
      throw new Error('Failed to fetch historical prices from Pragma Oracle');
    }
  }
}
