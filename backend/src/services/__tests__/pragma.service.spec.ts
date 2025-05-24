import { Test, TestingModule } from '@nestjs/testing';
import { PragmaService } from '../pragma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockImplementation((key) => {
    if (key === 'pragma.apiUrl') return 'https://api.pragma.build/v1';
    if (key === 'pragma.apiKey') return 'test-api-key';
    return null;
  }),
};

describe('PragmaService', () => {
  let service: PragmaService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PragmaService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PragmaService>(PragmaService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPrices', () => {
    it('should get current prices for specified assets', async () => {
      // Mock data
      const assets = ['BTC', 'WBTC', 'STRK'];
      const mockResponse = {
        data: {
          prices: {
            BTC: { usd: 30500, timestamp: 1621500000 },
            WBTC: { usd: 30450, timestamp: 1621500000 },
            STRK: { usd: 1.25, timestamp: 1621500000 },
          },
        },
      };

      // Mock axios call
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Execute the method
      const result = await service.getPrices(assets);

      // Assertions
      expect(result).toEqual(mockResponse.data.prices);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.pragma.build/v1/prices',
        expect.objectContaining({
          params: { assets: 'BTC,WBTC,STRK' },
          headers: expect.objectContaining({ 'x-api-key': 'test-api-key' }),
        }),
      );
    });

    it('should handle errors when getting prices', async () => {
      // Mock data
      const assets = ['BTC', 'WBTC', 'STRK'];
      const mockError = new Error('API request failed');

      // Mock axios call to throw an error
      mockedAxios.get.mockRejectedValue(mockError);

      // Execute and assert
      await expect(service.getPrices(assets)).rejects.toThrow(
        'Error fetching prices from Pragma: API request failed'
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.pragma.build/v1/prices',
        expect.any(Object),
      );
    });
  });

  describe('getApyData', () => {
    it('should get current APY data for yield strategies', async () => {
      // Mock data
      const mockResponse = {
        data: {
          apy: {
            strategies: {
              babylon: { current: 12.5, historical: [12.1, 12.3, 12.5] },
              ekubo: { current: 18.2, historical: [17.8, 18.0, 18.2] },
              vesu: { current: 15.7, historical: [15.5, 15.6, 15.7] },
            },
            average: 15.47,
          },
        },
      };

      // Mock axios call
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Execute the method
      const result = await service.getApyData();

      // Assertions
      expect(result).toEqual(mockResponse.data.apy);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.pragma.build/v1/yield/apy',
        expect.objectContaining({
          headers: expect.objectContaining({ 'x-api-key': 'test-api-key' }),
        }),
      );
    });
  });

  describe('getVolatility', () => {
    it('should get market volatility data for a specific asset', async () => {
      // Mock data
      const asset = 'BTC';
      const mockResponse = {
        data: {
          volatility: {
            daily: 2.1,
            weekly: 5.3,
            monthly: 12.7,
          },
        },
      };

      // Mock axios call
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Execute the method
      const result = await service.getVolatility(asset);

      // Assertions
      expect(result).toEqual(mockResponse.data.volatility);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.pragma.build/v1/market/volatility',
        expect.objectContaining({
          params: { asset },
          headers: expect.objectContaining({ 'x-api-key': 'test-api-key' }),
        }),
      );
    });
  });

  describe('getHistoricalPrices', () => {
    it('should get historical price data for a specific asset', async () => {
      // Mock data
      const asset = 'BTC';
      const days = 30;
      const mockResponse = {
        data: {
          historical: {
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
          },
        },
      };

      // Mock axios call
      mockedAxios.get.mockResolvedValue(mockResponse);

      // Execute the method
      const result = await service.getHistoricalPrices(asset, days);

      // Assertions
      expect(result).toEqual(mockResponse.data.historical);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.pragma.build/v1/prices/historical',
        expect.objectContaining({
          params: { asset, days },
          headers: expect.objectContaining({ 'x-api-key': 'test-api-key' }),
        }),
      );
    });
  });
});
