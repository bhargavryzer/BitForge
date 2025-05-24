import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { YieldService } from './yield.service';
import { StarknetService } from '../../services/starknet.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { ApiException } from '../../exceptions/api.exception';
import { DepositDto } from '../../dto/deposit.dto';
import { WithdrawDto } from '../../dto/withdraw.dto';
import { PreparedTransaction } from '../../interfaces/starknet.interface';

// Mock StarknetService methods
const mockStarknetService = {
  getVesuApy: jest.fn(),
  getBabylonApy: jest.fn(),
  getEkuboApy: jest.fn(),
  getAllocation: jest.fn(),
  getUserBalance: jest.fn(),
  getTotalDeposits: jest.fn(),
  deposit: jest.fn(),
  withdraw: jest.fn(),
  rebalance: jest.fn(),
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

describe('YieldService', () => {
  let service: YieldService;
  let starknetService: StarknetService; // Keep type for jest.Mocked
  let logger: CustomLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YieldService,
        { provide: StarknetService, useValue: mockStarknetService },
        { provide: CustomLoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<YieldService>(YieldService);
    starknetService = module.get<StarknetService>(StarknetService);
    logger = module.get<CustomLoggerService>(CustomLoggerService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(logger.setContext).toHaveBeenCalledWith(YieldService.name);
    expect(logger.log).toHaveBeenCalledWith('YieldService instantiated', undefined);
  });

  // Helper for error testing
  const testErrorHandling = async (
    methodToTest: () => Promise<any>,
    mockStarknetMethod: jest.Mock,
    expectedErrorCode: string,
    customErrorMessage?: string,
  ) => {
    // Scenario 1: StarknetService throws ApiException
    const apiException = new ApiException('Starknet Error', HttpStatus.BAD_REQUEST, 'STARKNET_SPECIFIC_ERROR');
    mockStarknetMethod.mockRejectedValueOnce(apiException);
    await expect(methodToTest()).rejects.toThrow(apiException);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(customErrorMessage || 'Error'), apiException.stack, expect.any(Object));


    // Scenario 2: StarknetService throws generic Error
    const genericError = new Error('Network issue');
    mockStarknetMethod.mockRejectedValueOnce(genericError);
    await expect(methodToTest()).rejects.toThrow(ApiException);
    try {
      await methodToTest(); // Call it again to catch the error
    } catch (e) {
      expect(e.message).toBe(customErrorMessage || 'Failed to perform operation.'); // Adjust this default
      expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(e.errorCode).toBe(expectedErrorCode);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(customErrorMessage || 'Error'), genericError.stack, expect.any(Object));
    }
  };
  
  describe('getCurrentApy', () => {
    it('should return current APY and log success', async () => {
      const vesuApy = 10.0;
      const babylonApy = 5.0;
      const ekuboApy = 12.0;
      const allocation = { vesu: 50, babylon: 30, ekubo: 20 }; // Percentages
      const expectedTotalApy = (vesuApy * 0.5) + (babylonApy * 0.3) + (ekuboApy * 0.2);

      mockStarknetService.getVesuApy.mockResolvedValue(vesuApy);
      mockStarknetService.getBabylonApy.mockResolvedValue(babylonApy);
      mockStarknetService.getEkuboApy.mockResolvedValue(ekuboApy);
      // Mocking getCurrentAllocation as it's called internally
      const getCurrentAllocationSpy = jest.spyOn(service, 'getCurrentAllocation').mockResolvedValueOnce(allocation);

      const result = await service.getCurrentApy();

      expect(result.total).toBeCloseTo(expectedTotalApy);
      expect(result.strategies).toEqual({ vesu: vesuApy, babylon: babylonApy, ekubo: ekuboApy });
      expect(logger.debug).toHaveBeenCalledWith('Attempting to get current APY.', undefined);
      expect(logger.log).toHaveBeenCalledWith('Current APY calculated successfully.', expect.any(Object));
      getCurrentAllocationSpy.mockRestore();
    });

    it('should handle errors for getCurrentApy', async () => {
      await testErrorHandling(
        () => service.getCurrentApy(),
        mockStarknetService.getVesuApy, // Assuming this is the first failing call
        'YIELD_APY_CALCULATION_ERROR',
        'Failed to calculate current APY.'
      );
    });
  });

  describe('getCurrentAllocation', () => {
    it('should return current allocation and log success', async () => {
      const mockAllocationResult: [number, number, number] = [4000, 3000, 3000]; // Basis points
      mockStarknetService.getAllocation.mockResolvedValue(mockAllocationResult);
      const result = await service.getCurrentAllocation();
      expect(result).toEqual({ vesu: 40, babylon: 30, ekubo: 30 });
      expect(logger.debug).toHaveBeenCalledWith('Attempting to get current allocation from StarknetService.', undefined);
      expect(logger.debug).toHaveBeenCalledWith('Current allocation processed.', { currentAllocation: { vesu: 40, babylon: 30, ekubo: 30 } }, undefined);
    });
    it('should handle errors for getCurrentAllocation', async () => {
      await testErrorHandling(
        () => service.getCurrentAllocation(),
        mockStarknetService.getAllocation,
        'YIELD_ALLOCATION_ERROR',
        'Failed to get current allocation.'
      );
    });
  });

  describe('getUserBalance', () => {
    const address = '0xuser';
    it('should return user balance and log success', async () => {
      const mockBalance = 100000000n; // 1 BTC
      mockStarknetService.getUserBalance.mockResolvedValue(mockBalance);
      const result = await service.getUserBalance(address);
      expect(result.balance).toBe(mockBalance.toString());
      expect(result.balanceFormatted).toBe('1.00000000');
      expect(logger.debug).toHaveBeenCalledWith(`Attempting to get user balance for address: ${address}`, undefined);
      expect(logger.debug).toHaveBeenCalledWith(`User balance for ${address} processed.`, expect.any(Object), undefined);
    });
    it('should handle errors for getUserBalance', async () => {
      await testErrorHandling(
        () => service.getUserBalance(address),
        mockStarknetService.getUserBalance,
        'YIELD_USER_BALANCE_ERROR',
        `Failed to get user balance for ${address}.`
      );
    });
  });

  describe('getTotalDeposits', () => {
    it('should return total deposits and log success', async () => {
      const mockTotal = 50000000000n; // 500 BTC
      mockStarknetService.getTotalDeposits.mockResolvedValue(mockTotal);
      const result = await service.getTotalDeposits();
      expect(result.total).toBe(mockTotal.toString());
      expect(result.totalFormatted).toBe('500.00000000');
      expect(logger.debug).toHaveBeenCalledWith('Attempting to get total deposits from StarknetService.', undefined);
      expect(logger.debug).toHaveBeenCalledWith('Total deposits processed.', expect.any(Object), undefined);
    });
     it('should handle errors for getTotalDeposits', async () => {
      await testErrorHandling(
        () => service.getTotalDeposits(),
        mockStarknetService.getTotalDeposits,
        'YIELD_TOTAL_DEPOSITS_ERROR',
        'Failed to get total deposits.'
      );
    });
  });

  describe('deposit', () => {
    const depositDto: DepositDto = { address: '0xuser', amount: 1.5 };
    const preparedTx: PreparedTransaction = { contractAddress: '0x1', entrypoint: 'deposit', calldata: ['150000000'] };

    it('should return PreparedTransaction for deposit and log success', async () => {
      mockStarknetService.deposit.mockResolvedValue(preparedTx);
      const result = await service.deposit(depositDto);
      expect(result).toEqual(preparedTx);
      expect(starknetService.deposit).toHaveBeenCalledWith(depositDto.address, 150000000n);
      expect(logger.log).toHaveBeenCalledWith('Attempting to prepare deposit transaction.', { address: depositDto.address, amount: depositDto.amount }, undefined);
      expect(logger.log).toHaveBeenCalledWith('Deposit transaction prepared successfully.', { preparedTx }, undefined);
    });
    it('should handle errors for deposit', async () => {
      await testErrorHandling(
        () => service.deposit(depositDto),
        mockStarknetService.deposit,
        'YIELD_DEPOSIT_PREPARATION_ERROR',
        'Failed to prepare deposit transaction.'
      );
    });
  });

  describe('withdraw', () => {
    const withdrawDto: WithdrawDto = { address: '0xuser', amount: 1.0 };
    const preparedTx: PreparedTransaction = { contractAddress: '0x1', entrypoint: 'withdraw', calldata: ['100000000'] };

    it('should return PreparedTransaction for withdraw and log success', async () => {
      mockStarknetService.withdraw.mockResolvedValue(preparedTx);
      const result = await service.withdraw(withdrawDto);
      expect(result).toEqual(preparedTx);
      expect(starknetService.withdraw).toHaveBeenCalledWith(withdrawDto.address, 100000000n);
      expect(logger.log).toHaveBeenCalledWith('Attempting to prepare withdraw transaction.', { address: withdrawDto.address, amount: withdrawDto.amount }, undefined);
      expect(logger.log).toHaveBeenCalledWith('Withdraw transaction prepared successfully.', { preparedTx }, undefined);
    });
    it('should handle errors for withdraw', async () => {
      await testErrorHandling(
        () => service.withdraw(withdrawDto),
        mockStarknetService.withdraw,
        'YIELD_WITHDRAW_PREPARATION_ERROR',
        'Failed to prepare withdraw transaction.'
      );
    });
  });

  describe('rebalance', () => {
    const mockTxHash = '0xtxhashrebalance';
    const mockNewAllocation = { vesu: 60, babylon: 20, ekubo: 20 };
    it('should process rebalance and log success', async () => {
      mockStarknetService.rebalance.mockResolvedValue(mockTxHash);
      const getCurrentAllocationSpy = jest.spyOn(service, 'getCurrentAllocation').mockResolvedValueOnce(mockNewAllocation);
      
      const result = await service.rebalance();
      expect(result.success).toBe(true);
      expect(result.txHash).toBe(mockTxHash);
      expect(result.allocation).toEqual(mockNewAllocation);
      expect(logger.log).toHaveBeenCalledWith('Attempting to trigger rebalance.', undefined);
      expect(logger.log).toHaveBeenCalledWith('Rebalance process completed successfully.', { txHash: mockTxHash, newAllocation: mockNewAllocation }, undefined);
      getCurrentAllocationSpy.mockRestore();
    });
    it('should handle errors for rebalance', async () => {
      await testErrorHandling(
        () => service.rebalance(),
        mockStarknetService.rebalance,
        'YIELD_REBALANCE_ERROR',
        'Failed to rebalance.'
      );
    });
  });

  describe('getYieldHistory', () => {
    it('should return mock yield history and log', async () => {
      const result = await service.getYieldHistory('0xuser', 5);
      expect(result.history.length).toBe(5);
      expect(logger.debug).toHaveBeenCalledWith('Getting yield history for address: 0xuser, days: 5', undefined);
    });

    it('should throw ApiException if mock data generation fails (edge case)', async () => {
        // This is tricky to test without modifying the source or complex mocks.
        // For simplicity, we'll assume the internal logic is simple and doesn't throw.
        // If it could, we'd mock Date or Math.random to throw.
        // Here, we'll just assert that if an error *did* occur, it would be wrapped.
        const originalDate = global.Date;
        global.Date = jest.fn(() => { throw new Error("Date error"); }) as any; // Force an error
        
        try {
            await expect(service.getYieldHistory('0xuser', 5)).rejects.toThrow(ApiException);
            const historyResult = await service.getYieldHistory('0xuser', 5); // to get into catch
        } catch (e) {
            expect(e.message).toBe('Failed to get yield history.');
            expect(e.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
            expect(e.errorCode).toBe('YIELD_HISTORY_ERROR');
            expect(logger.error).toHaveBeenCalledWith('Error getting yield history (mock data): Date error', expect.any(String), { address: '0xuser', days: 5 });
        } finally {
            global.Date = originalDate; // Restore original Date
        }
    });
  });
});
