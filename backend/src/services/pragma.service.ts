import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface PriceResponse {
  [asset: string]: number;
}

interface ApyData {
  vesu: { lending: number; borrowing: number; utilization: number };
  babylon: { staking: number; rewards: number; total: number };
  ekubo: { fees: number; rewards: number; total: number };
}

interface VolatilityData {
  [timeframe: string]: number;
}

interface HistoricalPrice {
  date: string;
  price: string;
}

@Injectable()
export class PragmaService {
  private readonly logger = new Logger(PragmaService.name);
  private readonly apiKey: string;
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string = 'https://api.pragma.build/v1';
  private readonly requestTimeout: number = 10000; // 10 seconds timeout

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PRAGMA_API_KEY');
    if (!this.apiKey) {
      throw new Error('PRAGMA_API_KEY is not configured');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: this.requestTimeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getPrices(assets: string[]): Promise<PriceResponse> {
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      throw new HttpException('Assets array is required and must not be empty', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await this.axiosInstance.get('/prices', {
        params: {
          assets: assets.join(','),
          timestamp: Math.floor(Date.now() / 1000),
        },
      });

      const prices: PriceResponse = response.data.reduce((acc, item) => {
        acc[item.asset] = Number(item.price);
        return acc;
      }, {});

      this.logger.debug(`Successfully fetched prices for assets: ${assets.join(', ')}`);
      return prices;
    } catch (error) {
      this.logger.error('Error fetching prices from Pragma:', error.message);
      throw new HttpException(
        'Failed to fetch prices from Pragma Oracle',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getApyData(): Promise<ApyData> {
    try {
      const response = await this.axiosInstance.get('/apy');
      const data: ApyData = response.data;

      // Validate response structure
      if (!data.vesu || !data.babylon || !data.ekubo) {
        throw new Error('Invalid APY data structure');
      }

      this.logger.debug('Successfully fetched APY data');
      return data;
    } catch (error) {
      this.logger.error('Error fetching APY data from Pragma:', error.message);
      throw new HttpException(
        'Failed to fetch APY data from Pragma Oracle',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getVolatility(asset: string): Promise<VolatilityData> {
    if (!asset || typeof asset !== 'string') {
      throw new HttpException('Asset must be a non-empty string', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await this.axiosInstance.get(`/volatility/${asset}`, {
        params: {
          timeframes: ['1d', '7d', '30d'].join(','),
        },
      });

      const volatility: VolatilityData = response.data.reduce((acc, item) => {
        acc[item.timeframe] = Number(item.volatility);
        return acc;
      }, {});

      this.logger.debug(`Successfully fetched volatility data for asset: ${asset}`);
      return volatility;
    } catch (error) {
      this.logger.error(`Error fetching volatility data for ${asset}:`, error.message);
      throw new HttpException(
        'Failed to fetch volatility data from Pragma Oracle',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getHistoricalPrices(asset: string, days: number): Promise<HistoricalPrice[]> {
    if (!asset || typeof asset !== 'string') {
      throw new HttpException('Asset must be a non-empty string', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(days) || days <= 0 || days > 365) {
      throw new HttpException(
        'Days must be a positive integer not exceeding 365',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const response = await this.axiosInstance.get(`/historical-prices/${asset}`, {
        params: {
          days,
          end_timestamp: Math.floor(Date.now() / 1000),
        },
      });

      const prices: HistoricalPrice[] = response.data.map(item => ({
        date: item.date,
        price: Number(item.price).toFixed(2),
      }));

      this.logger.debug(`Successfully fetched ${days} days of historical prices for ${asset}`);
      return prices;
    } catch (error) {
      this.logger.error(`Error fetching historical prices for ${asset}:`, error.message);
      throw new HttpException(
        'Failed to fetch historical prices from Pragma Oracle',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}