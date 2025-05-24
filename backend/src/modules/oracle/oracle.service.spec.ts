import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { ConfigService } from '@nestjs/config';
import { PragmaService } from '../../services/pragma.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { ApiException } from '../../exceptions/api.exception';

// Mock PragmaService
const mockPragmaService = {
  getPrices: jest.fn(),
  getApyData: jest.fn(),
  getVolatility: jest.fn(),
  getHistoricalPrices: jest.fn(),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockImplementation((key) => {
    if (key === 'pragma.apiKey') return 'test-api-key'; // Example, though not directly used in OracleService constructor
    return null;
  }),
};

// Mock CustomLoggerService
const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  setContext: jest.fn().mockReturnThis(),
};

describe('OracleService', () => {
  let service: OracleService;
  let pragmaService: jest.Mocked<PragmaService>; // For type safety with jest.fn()
  let logger: jest.Mocked<CustomLoggerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OracleService,
        { provide: PragmaService, useValue: mockPragmaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CustomLoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<OracleService>(OracleService);
    pragmaService = module.get<PragmaService>(PragmaService) as jest.Mocked<PragmaService>;
    logger = module.get<CustomLoggerService>(CustomLoggerService) as jest.Mocked<CustomLoggerService>;

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined and logger context set', () => {
    expect(service).toBeDefined();
    expect(logger.setContext).toHaveBeenCalledWith(OracleService.name);
    expect(logger.log).toHaveBeenCalledWith('OracleService instantiated', undefined);
  });

  // Helper for error testing
  const testErrorHandling = async (
    methodToTest: () => Promise<any>,
    mockPragmaMethod: jest.Mock,
    expectedErrorCode: string,
    methodArgs: any[] = [],
  ) => {
    const errorMessagePrefix = `Failed to get ${expectedErrorCode.split('_')[2].toLowerCase()} from Pragma Oracle:`;

    // Scenario 1: PragmaService throws ApiException
    const apiException = new ApiException('Pragma Error', HttpStatus.SERVICE_UNAVAILABLE, 'PRAGMA_DOWN');
    mockPragmaMethod.mockRejectedValueOnce(apiException);
    await expect(methodToTest()).rejects.toThrow(apiException); // Should re-throw the same ApiException
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(apiException.message), // Original message from ApiException
      apiException.stack,
      expect.any(Object)
    );

    // Scenario 2: PragmaService throws generic Error
    const genericError = new Error('Network issue with Pragma');
    mockPragmaMethod.mockRejectedValueOnce(genericError);
    try {
      await methodToTest();
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      expect(e.message).toBe(`${errorMessagePrefix} ${genericError.message}`);
      expect(e.getStatus()).toBe(HttpStatus.BAD_GATEWAY);
      expect(e.errorCode).toBe(expectedErrorCode);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(genericError.message),
        genericError.stack,
        expect.any(Object)
      );
    }
  };

  describe('getPrices', () => {
    const assets = ['BTC', 'WBTC', 'STRK'];
    const mockPricesData = { BTC: 60000 };

    it('should get current prices from Pragma oracle and log success', async () => {
      pragmaService.getPrices.mockResolvedValue(mockPricesData);
      const result = await service.getPrices(assets);
      
      expect(result.prices).toEqual(mockPricesData);
      expect(result.source).toBe('Pragma Oracle');
      expect(result.timestamp).toBeDefined();
      expect(pragmaService.getPrices).toHaveBeenCalledWith(assets);
      expect(logger.debug).toHaveBeenCalledWith(`Attempting to get prices for assets: ${assets.join(', ')}`, { assets });
      expect(logger.log).toHaveBeenCalledWith(`Prices fetched successfully for assets: ${assets.join(', ')}`, { assetsCount: assets.length });
    });

    it('should handle errors for getPrices', async () => {
      await testErrorHandling(() => service.getPrices(assets), pragmaService.getPrices, 'ORACLE_PRAGMA_PRICES_ERROR', assets);
    });
  });

  describe('getApyData', () => {
    const mockApy = { vesu: 10 };
    it('should get current APY data from Pragma oracle and log success', async () => {
      pragmaService.getApyData.mockResolvedValue(mockApy);
      const result = await service.getApyData();

      expect(result.apyData).toEqual(mockApy);
      expect(result.source).toBe('Pragma Oracle');
      expect(pragmaService.getApyData).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith('Attempting to get APY data from Pragma.', undefined);
      expect(logger.log).toHaveBeenCalledWith('APY data fetched successfully from Pragma.', undefined);
    });
    it('should handle errors for getApyData', async () => {
      await testErrorHandling(() => service.getApyData(), pragmaService.getApyData, 'ORACLE_PRAGMA_APY_ERROR');
    });
  });

  describe('getVolatility', () => {
    const asset = 'BTC';
    const mockVolatility = { daily: 0.02 };
    it('should get market volatility data from Pragma oracle and log success', async () => {
      pragmaService.getVolatility.mockResolvedValue(mockVolatility);
      const result = await service.getVolatility(asset);

      expect(result.volatility).toEqual(mockVolatility);
      expect(result.asset).toBe(asset);
      expect(pragmaService.getVolatility).toHaveBeenCalledWith(asset);
      expect(logger.debug).toHaveBeenCalledWith(`Attempting to get volatility for asset: ${asset}`, { asset });
      expect(logger.log).toHaveBeenCalledWith(`Volatility data fetched successfully for asset: ${asset}`, undefined);
    });
    it('should handle errors for getVolatility', async () => {
      await testErrorHandling(() => service.getVolatility(asset), pragmaService.getVolatility, 'ORACLE_PRAGMA_VOLATILITY_ERROR', [asset]);
    });
  });

  describe('getHistoricalPrices', () => {
    const asset = 'BTC';
    const days = 30;
    const mockHistorical = [{ date: '2023-01-01', price: '30000' }];
    it('should get historical price data from Pragma oracle and log success', async () => {
      pragmaService.getHistoricalPrices.mockResolvedValue(mockHistorical);
      const result = await service.getHistoricalPrices(asset, days);

      expect(result.prices).toEqual(mockHistorical);
      expect(result.asset).toBe(asset);
      expect(result.days).toBe(days);
      expect(pragmaService.getHistoricalPrices).toHaveBeenCalledWith(asset, days);
      expect(logger.debug).toHaveBeenCalledWith(`Attempting to get historical prices for asset: ${asset}, days: ${days}`, { asset, days });
      expect(logger.log).toHaveBeenCalledWith(`Historical prices fetched successfully for asset: ${asset}, days: ${days}`, undefined);
    });
    it('should handle errors for getHistoricalPrices', async () => {
      await testErrorHandling(() => service.getHistoricalPrices(asset, days), pragmaService.getHistoricalPrices, 'ORACLE_PRAGMA_HISTORICAL_PRICES_ERROR', [asset, days]);
    });
  });
});
