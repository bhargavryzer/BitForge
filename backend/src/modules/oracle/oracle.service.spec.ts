import { Test, TestingModule } from '@nestjs/testing';
import { OracleService } from './oracle.service';
import { ConfigService } from '@nestjs/config';
import { PragmaService } from '../../services/pragma.service';

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
    if (key === 'pragma.apiKey') return 'test-api-key';
    return null;
  }),
};

describe('OracleService', () => {
  let service: OracleService;
  let pragmaService: PragmaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OracleService,
        { provide: PragmaService, useValue: mockPragmaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OracleService>(OracleService);
    pragmaService = module.get<PragmaService>(PragmaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPrices', () => {
    it('should get current prices from Pragma oracle', async () => {
      // Mock data
      const assets = ['BTC', 'WBTC', 'STRK'];
      const mockPricesData = {
        BTC: { usd: 30500, timestamp: 1621500000 },
        WBTC: { usd: 30450, timestamp: 1621500000 },
        STRK: { usd: 1.25, timestamp: 1621500000 },
      };

      // Mock PragmaService call
      mockPragmaService.getPrices.mockResolvedValue(mockPricesData);

      // Execute the method
      const result = await service.getPrices(assets);

      // Assertions
      expect(result).toEqual(mockPricesData);
      expect(pragmaService.getPrices).toHaveBeenCalledWith(assets);
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

      // Mock PragmaService call
      mockPragmaService.getApyData.mockResolvedValue(mockApyData);

      // Execute the method
      const result = await service.getApyData();

      // Assertions
      expect(result).toEqual(mockApyData);
      expect(pragmaService.getApyData).toHaveBeenCalled();
    });
  });

  describe('getVolatility', () => {
    it('should get market volatility data from Pragma oracle', async () => {
      // Mock data
      const asset = 'BTC';
      const mockVolatilityData = {
        daily: 2.1,
        weekly: 5.3,
        monthly: 12.7,
      };

      // Mock PragmaService call
      mockPragmaService.getVolatility.mockResolvedValue(mockVolatilityData);

      // Execute the method
      const result = await service.getVolatility(asset);

      // Assertions
      expect(result).toEqual(mockVolatilityData);
      expect(pragmaService.getVolatility).toHaveBeenCalledWith(asset);
    });
  });

  describe('getHistoricalPrices', () => {
    it('should get historical price data from Pragma oracle', async () => {
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

      // Mock PragmaService call
      mockPragmaService.getHistoricalPrices.mockResolvedValue(mockHistoricalData);

      // Execute the method
      const result = await service.getHistoricalPrices(asset, days);

      // Assertions
      expect(result).toEqual(mockHistoricalData);
      expect(pragmaService.getHistoricalPrices).toHaveBeenCalledWith(asset, days);
    });
  });
});
