import { Test, TestingModule } from '@nestjs/testing';
import { YieldController } from './yield.controller';
import { YieldService } from './yield.service';
import { DepositDto } from '../../dto/deposit.dto';
import { WithdrawDto } from '../../dto/withdraw.dto';

// Mock YieldService
const mockYieldService = {
  getCurrentApy: jest.fn(),
  getCurrentAllocation: jest.fn(),
  getUserBalance: jest.fn(),
  getTotalDeposits: jest.fn(),
  deposit: jest.fn(),
  withdraw: jest.fn(),
  rebalance: jest.fn(),
  getYieldHistory: jest.fn(),
};

describe('YieldController', () => {
  let controller: YieldController;
  let service: YieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YieldController],
      providers: [
        { provide: YieldService, useValue: mockYieldService },
      ],
    }).compile();

    controller = module.get<YieldController>(YieldController);
    service = module.get<YieldService>(YieldService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getApy', () => {
    it('should return current APY for all strategies', async () => {
      // Mock data
      const mockApyData = {
        babylon: 12.5,
        ekubo: 18.2,
        vesu: 15.7,
        average: 15.47,
      };

      // Mock service call
      mockYieldService.getCurrentApy.mockResolvedValue(mockApyData);

      // Execute the method
      const result = await controller.getApy();

      // Assertions
      expect(result).toEqual(mockApyData);
      expect(service.getCurrentApy).toHaveBeenCalled();
    });
  });

  describe('getAllocation', () => {
    it('should return current allocation across strategies', async () => {
      // Mock data
      const mockAllocationData = {
        babylon: 40,
        ekubo: 35,
        vesu: 25,
      };

      // Mock service call
      mockYieldService.getCurrentAllocation.mockResolvedValue(mockAllocationData);

      // Execute the method
      const result = await controller.getAllocation();

      // Assertions
      expect(result).toEqual(mockAllocationData);
      expect(service.getCurrentAllocation).toHaveBeenCalled();
    });
  });

  describe('getBalance', () => {
    it('should return user balance', async () => {
      // Mock data
      const address = '0xuser';
      const mockBalanceData = {
        totalDeposited: '1.5',
        currentBalance: '1.62',
        yield: '0.12',
        yieldPercentage: 8,
      };

      // Mock service call
      mockYieldService.getUserBalance.mockResolvedValue(mockBalanceData);

      // Execute the method
      const result = await controller.getBalance(address);

      // Assertions
      expect(result).toEqual(mockBalanceData);
      expect(service.getUserBalance).toHaveBeenCalledWith(address);
    });
  });

  describe('getTotalDeposits', () => {
    it('should return total deposits in the platform', async () => {
      // Mock data
      const mockTotalDeposits = {
        totalBtc: '125.75',
        totalUsd: '3845000',
        users: 42,
      };

      // Mock service call
      mockYieldService.getTotalDeposits.mockResolvedValue(mockTotalDeposits);

      // Execute the method
      const result = await controller.getTotalDeposits();

      // Assertions
      expect(result).toEqual(mockTotalDeposits);
      expect(service.getTotalDeposits).toHaveBeenCalled();
    });
  });

  describe('deposit', () => {
    it('should process a deposit', async () => {
      // Mock data
      const depositDto: DepositDto = {
        address: '0xuser',
        amount: 1.5,
      };
      const mockTxHash = { txHash: '0xtxhash123' };

      // Mock service call
      mockYieldService.deposit.mockResolvedValue(mockTxHash);

      // Execute the method
      const result = await controller.deposit(depositDto);

      // Assertions
      expect(result).toEqual(mockTxHash);
      expect(service.deposit).toHaveBeenCalledWith(depositDto);
    });
  });

  describe('withdraw', () => {
    it('should process a withdrawal', async () => {
      // Mock data
      const withdrawDto: WithdrawDto = {
        address: '0xuser',
        amount: 1.0,
      };
      const mockTxHash = { txHash: '0xtxhash456' };

      // Mock service call
      mockYieldService.withdraw.mockResolvedValue(mockTxHash);

      // Execute the method
      const result = await controller.withdraw(withdrawDto);

      // Assertions
      expect(result).toEqual(mockTxHash);
      expect(service.withdraw).toHaveBeenCalledWith(withdrawDto);
    });
  });

  describe('rebalance', () => {
    it('should trigger rebalance of funds across strategies', async () => {
      // Mock data
      const mockTxHash = { txHash: '0xtxhash789' };

      // Mock service call
      mockYieldService.rebalance.mockResolvedValue(mockTxHash);

      // Execute the method
      const result = await controller.rebalance();

      // Assertions
      expect(result).toEqual(mockTxHash);
      expect(service.rebalance).toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return yield history for a specific user', async () => {
      // Mock data
      const address = '0xuser';
      const days = 30;
      const mockHistoryData = {
        daily: [
          { date: '2025-05-21', yield: '0.002', apy: 8.2 },
          { date: '2025-05-20', yield: '0.0019', apy: 8.1 },
        ],
        total: {
          yield: '0.12',
          apy: 8.15,
        },
      };

      // Mock service call
      mockYieldService.getYieldHistory.mockResolvedValue(mockHistoryData);

      // Execute the method
      const result = await controller.getHistory(address, days);

      // Assertions
      expect(result).toEqual(mockHistoryData);
      expect(service.getYieldHistory).toHaveBeenCalledWith(address, days || 30);
    });

    it('should return platform-wide yield history when no address is provided', async () => {
      // Mock data
      const days = 30;
      const mockHistoryData = {
        daily: [
          { date: '2025-05-21', yield: '0.25', apy: 9.2 },
          { date: '2025-05-20', yield: '0.24', apy: 9.1 },
        ],
        total: {
          yield: '7.5',
          apy: 9.15,
        },
      };

      // Mock service call
      mockYieldService.getYieldHistory.mockResolvedValue(mockHistoryData);

      // Execute the method
      const result = await controller.getHistory(undefined, days);

      // Assertions
      expect(result).toEqual(mockHistoryData);
      expect(service.getYieldHistory).toHaveBeenCalledWith(undefined, days || 30);
    });
  });
});
