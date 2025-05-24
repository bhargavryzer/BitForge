import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PragmaService } from '../../services/pragma.service';
import { ApiException } from '../../exceptions/api.exception';
import { CustomLoggerService } from '../../logger/logger.service';

@Injectable()
export class OracleService {
  private readonly logger: CustomLoggerService;

  constructor(
    private readonly configService: ConfigService,
    private readonly pragmaService: PragmaService,
    logger: CustomLoggerService,
  ) {
    this.logger = logger.setContext(OracleService.name);
    this.logger.log('OracleService instantiated');
  }

  async getPrices(assets: string[]) {
    this.logger.debug(`Attempting to get prices for assets: ${assets.join(', ')}`, { assets });
    try {
      const prices = await this.pragmaService.getPrices(assets);
      this.logger.log(`Prices fetched successfully for assets: ${assets.join(', ')}`, { assetsCount: assets.length });
      return {
        timestamp: new Date().toISOString(),
        source: 'Pragma Oracle',
        prices,
      };
    } catch (error) {
      this.logger.error(`Error getting prices from Pragma for assets [${assets.join(', ')}]: ${error.message}`, error.stack, { assets });
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(`Failed to get prices from Pragma Oracle: ${error.message}`, HttpStatus.BAD_GATEWAY, 'ORACLE_PRAGMA_PRICES_ERROR');
    }
  }

  async getApyData() {
    this.logger.debug('Attempting to get APY data from Pragma.');
    try {
      const apyData = await this.pragmaService.getApyData();
      this.logger.log('APY data fetched successfully from Pragma.');
      return {
        timestamp: new Date().toISOString(),
        source: 'Pragma Oracle',
        apyData,
      };
    } catch (error) {
      this.logger.error(`Error getting APY data from Pragma: ${error.message}`, error.stack);
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(`Failed to get APY data from Pragma Oracle: ${error.message}`, HttpStatus.BAD_GATEWAY, 'ORACLE_PRAGMA_APY_ERROR');
    }
  }

  async getVolatility(asset: string) {
    this.logger.debug(`Attempting to get volatility for asset: ${asset}`, { asset });
    try {
      const volatility = await this.pragmaService.getVolatility(asset);
      this.logger.log(`Volatility data fetched successfully for asset: ${asset}`);
      return {
        asset,
        timestamp: new Date().toISOString(),
        source: 'Pragma Oracle',
        volatility,
      };
    } catch (error) {
      this.logger.error(`Error getting volatility data for asset [${asset}] from Pragma: ${error.message}`, error.stack, { asset });
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(`Failed to get volatility data for ${asset} from Pragma Oracle: ${error.message}`, HttpStatus.BAD_GATEWAY, 'ORACLE_PRAGMA_VOLATILITY_ERROR');
    }
  }

  async getHistoricalPrices(asset: string, days: number) {
    this.logger.debug(`Attempting to get historical prices for asset: ${asset}, days: ${days}`, { asset, days });
    try {
      const prices = await this.pragmaService.getHistoricalPrices(asset, days);
      this.logger.log(`Historical prices fetched successfully for asset: ${asset}, days: ${days}`);
      return {
        asset,
        days,
        timestamp: new Date().toISOString(),
        source: 'Pragma Oracle',
        prices,
      };
    } catch (error) {
      this.logger.error(`Error getting historical prices for asset [${asset}], days [${days}] from Pragma: ${error.message}`, error.stack, { asset, days });
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(`Failed to get historical prices for ${asset} from Pragma Oracle: ${error.message}`, HttpStatus.BAD_GATEWAY, 'ORACLE_PRAGMA_HISTORICAL_PRICES_ERROR');
    }
  }
}
