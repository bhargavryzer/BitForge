import { Test, TestingModule } from '@nestjs/testing';
import { OracleController } from './oracle.controller';
import { OracleService } from './oracle.service';

// Mock OracleService
const mockOracleService = {
  getPrices: jest.fn(),
  getApyData: jest.fn(),
  getVolatility: jest.fn(),
  getHistoricalPrices: jest.fn(),
};

describe('OracleController', () => {
  let controller: OracleController;
  let service: OracleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OracleController],
      providers: [
        { provide: OracleService, useValue: mockOracleService },
      ],
    }).compile();

    controller = module.get<OracleController>(OracleController);
    service = module.get<OracleService>(OracleService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPrices', () => {
    it('should get current prices for specified assets', async () => {
      // Mock data
      const assets = 'BTC,WBTC,STRK';
      const assetList = ['BTC', 'WBTC', 'STRK'];
      const mockPricesData = {
        BTC: { usd: 30500, timestamp: 1621500000 },
        WBTC: { usd: 30450, timestamp: 1621500000 },
        STRK: { usd: 1.25, timestamp: 1621500000 },
      };

      // Mock service call
      mockOracleService.getPrices.mockResolvedValue(mockPricesData);

      // Execute the method
      const result = await controller.getPrices(assets);

      // Assertions
      expect(result).toEqual(mockPricesData);
      expect(service.getPrices).toHaveBeenCalledWith(assetList);
    });

    it('should use default assets when none are provided', async () => {
      // Mock data
      const defaultAssets = ['BTC', 'WBTC', 'STRK'];
      const mockPricesData = {
        BTC: { usd: 30500, timestamp: 1621500000 },
        WBTC: { usd: 30450, timestamp: 1621500000 },
        STRK: { usd: 1.25, timestamp: 1621500000 },
      };

      // Mock service call
      mockOracleService.getPrices.mockResolvedValue(mockPricesData);

      // Execute the method
      const result = await controller.getPrices(undefined);

      // Assertions
      expect(result).toEqual(mockPricesData);
      expect(service.getPrices).toHaveBeenCalledWith(defaultAssets);
    });
  });

  describe('getApyData', () => {
    it('should get current APY data from Pragma oracle', async () => {
      // Mock data
      const mockApyData = {
        strategies: {
          babylon: { current: 12.5, historical: [12.1, 12.3, 12.5] },
          ekubo: { current: 18.2, historical: [17.8, 18.0, 18.2] },
          vesu: { current: 15.7, historical: [15.5, 15.6, 15.7] },
        },
        average: 15.47,
      };

      // Mock service call
      mockOracleService.getApyData.mockResolvedValue(mockApyData);

      // Execute the method
      const result = await controller.getApyData();

      // Assertions
      expect(result).toEqual(mockApyData);
      expect(service.getApyData).toHaveBeenCalled();
    });
  });

  describe('getVolatility', () => {
    it('should get market volatility data for a specific asset', async () => {
      // Mock data
      const asset = 'BTC';
      const mockVolatilityData = {
        daily: 2.1,
        weekly: 5.3,
        monthly: 12.7,
      };

      // Mock service call
      mockOracleService.getVolatility.mockResolvedValue(mockVolatilityData);

      // Execute the method
      const result = await controller.getVolatility(asset);

      // Assertions
      expect(result).toEqual(mockVolatilityData);
      expect(service.getVolatility).toHaveBeenCalledWith(asset);
    });

    it('should use default asset when none is provided', async () => {
      // Mock data
      const defaultAsset = 'BTC';
      const mockVolatilityData = {
        daily: 2.1,
        weekly: 5.3,
        monthly: 12.7,
      };

      // Mock service call
      mockOracleService.getVolatility.mockResolvedValue(mockVolatilityData);

      // Execute the method
      const result = await controller.getVolatility(undefined);

      // Assertions
      expect(result).toEqual(mockVolatilityData);
      expect(service.getVolatility).toHaveBeenCalledWith(defaultAsset);
    });
  });

  describe('getHistoricalPrices', () => {
    it('should get historical price data for a specific asset', async () => {
      // Mock data
      const asset = 'BTC';
      const days = 30;
      const mockHistoricalData = {
        prices: [
          { timestamp: 1621500000, price: 30500 },
          { timestamp: 1621400000, price: 30200 },
          { timestamp: 1621300000, price: 30100 },
        ],
        summary: {
          high: 30500,
          low: 30100,
          average: 30266.67,
        },
      };

      // Mock service call
      mockOracleService.getHistoricalPrices.mockResolvedValue(mockHistoricalData);

      // Execute the method
      const result = await controller.getHistoricalPrices(asset, days);

      // Assertions
      expect(result).toEqual(mockHistoricalData);
      expect(service.getHistoricalPrices).toHaveBeenCalledWith(asset, days);
    });

    it('should use default values when none are provided', async () => {
      // Mock data
      const defaultAsset = 'BTC';
      const defaultDays = 30;
      const mockHistoricalData = {
        prices: [
          { timestamp: 1621500000, price: 30500 },
          { timestamp: 1621400000, price: 30200 },
          { timestamp: 1621300000, price: 30100 },
        ],
        summary: {
          high: 30500,
          low: 30100,
          average: 30266.67,
        },
      };

      // Mock service call
      mockOracleService.getHistoricalPrices.mockResolvedValue(mockHistoricalData);

      // Execute the method
      const result = await controller.getHistoricalPrices(undefined, undefined);

      // Assertions
      expect(result).toEqual(mockHistoricalData);
      expect(service.getHistoricalPrices).toHaveBeenCalledWith(defaultAsset, defaultDays);
    });
  });
});
