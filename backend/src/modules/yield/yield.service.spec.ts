import { Test, TestingModule } from '@nestjs/testing';
import { YieldService } from './yield.service';
import { StarknetService } from '../../services/starknet.service';
import { ConfigService } from '@nestjs/config';
import { DepositDto } from '../../dto/deposit.dto';
import { WithdrawDto } from '../../dto/withdraw.dto';

// Mock StarknetService
const mockStarknetService = {
  getVesuApy: jest.fn(),
  getBabylonApy: jest.fn(),
  getEkuboApy: jest.fn(),
  getAllocation: jest.fn(),
  getUserBalance: jest.fn(),
  getTotalDeposits: jest.fn(),
  deposit: jest.fn(),
  withdraw: jest.fn(),
  rebalance: jest.fn()
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockImplementation((key) => {
    if (key === 'BITFORGE_CONTRACT_ADDRESS') return '0x123';
    if (key === 'YIELD_VAULT_CONTRACT_ADDRESS') return '0x456';
    return null;
  }),
};

describe('YieldService', () => {
  let service: YieldService;
  let starknetService: StarknetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YieldService,
        { provide: StarknetService, useValue: mockStarknetService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<YieldService>(YieldService);
    starknetService = module.get<StarknetService>(StarknetService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentApy', () => {
    it('should return current APY for all strategies', async () => {
      // Mock data
      const vesuApy = 14.5;
      const babylonApy = 8.2;
      const ekuboApy = 17.8;
      const allocation = {
        vesu: 40,
        babylon: 30,
        ekubo: 30
      };
      
      // Calculate expected total APY
      const expectedTotalApy = (
        (vesuApy * allocation.vesu / 100) +
        (babylonApy * allocation.babylon / 100) +
        (ekuboApy * allocation.ekubo / 100)
      );

      // Mock StarknetService calls
      mockStarknetService.getVesuApy.mockResolvedValue(vesuApy);
      mockStarknetService.getBabylonApy.mockResolvedValue(babylonApy);
      mockStarknetService.getEkuboApy.mockResolvedValue(ekuboApy);
      
      // Mock getCurrentAllocation
      jest.spyOn(service, 'getCurrentAllocation').mockResolvedValue(allocation);

      // Execute the method
      const result = await service.getCurrentApy();

      // Assertions
      expect(result).toEqual({
        total: expectedTotalApy,
        strategies: {
          vesu: vesuApy,
          babylon: babylonApy,
          ekubo: ekuboApy,
        },
      });
      expect(starknetService.getVesuApy).toHaveBeenCalled();
      expect(starknetService.getBabylonApy).toHaveBeenCalled();
      expect(starknetService.getEkuboApy).toHaveBeenCalled();
    });
  });

  describe('getCurrentAllocation', () => {
    it('should return current allocation across strategies', async () => {
      // Mock data
      const mockAllocation = [4000, 3000, 3000]; // 40%, 30%, 30% in basis points

      // Mock StarknetService call
      mockStarknetService.getAllocation.mockResolvedValue(mockAllocation);

      // Execute the method
      const result = await service.getCurrentAllocation();

      // Assertions
      expect(result).toEqual({
        vesu: 40,
        babylon: 30,
        ekubo: 30,
      });
      expect(starknetService.getAllocation).toHaveBeenCalled();
    });
  });

  describe('getUserBalance', () => {
    it('should return user balance', async () => {
      // Mock data
      const address = '0xuser';
      const mockBalance = BigInt(1_000_000_000); // 10 BTC in satoshis

      // Mock StarknetService call
      mockStarknetService.getUserBalance.mockResolvedValue(mockBalance);

      // Execute the method
      const result = await service.getUserBalance(address);

      // Assertions
      expect(result).toEqual({
        address,
        balance: mockBalance.toString(),
        balanceFormatted: '10.00000000', // 10 BTC formatted
      });
      expect(starknetService.getUserBalance).toHaveBeenCalledWith(address);
    });
  });

  describe('getTotalDeposits', () => {
    it('should return total deposits in the platform', async () => {
      // Mock data
      const mockTotalDeposits = BigInt(100_000_000_000); // 1000 BTC in satoshis

      // Mock StarknetService call
      mockStarknetService.getTotalDeposits.mockResolvedValue(mockTotalDeposits);

      // Execute the method
      const result = await service.getTotalDeposits();

      // Assertions
      expect(result).toEqual({
        total: mockTotalDeposits.toString(),
        totalFormatted: '1000.00000000', // 1000 BTC formatted
      });
      expect(starknetService.getTotalDeposits).toHaveBeenCalled();
    });
  });

  describe('deposit', () => {
    it('should process a deposit', async () => {
      // Mock data
      const depositDto: DepositDto = {
        address: '0xuser',
        amount: 1.5,
      };
      const mockTxHash = '0xtxhash123';
      const expectedAmountInWei = BigInt(depositDto.amount) * BigInt(10 ** 8);

      // Mock StarknetService call
      mockStarknetService.deposit.mockResolvedValue(mockTxHash);

      // Execute the method
      const result = await service.deposit(depositDto);

      // Assertions
      expect(result).toEqual({
        success: true,
        txHash: mockTxHash,
        address: depositDto.address,
        amount: depositDto.amount,
      });
      expect(starknetService.deposit).toHaveBeenCalledWith(
        depositDto.address,
        expectedAmountInWei,
      );
    });
  });

  describe('withdraw', () => {
    it('should process a withdrawal', async () => {
      // Mock data
      const withdrawDto: WithdrawDto = {
        address: '0xuser',
        amount: 1.0,
      };
      const mockTxHash = '0xtxhash456';
      const expectedAmountInWei = BigInt(withdrawDto.amount) * BigInt(10 ** 8);

      // Mock StarknetService call
      mockStarknetService.withdraw.mockResolvedValue(mockTxHash);

      // Execute the method
      const result = await service.withdraw(withdrawDto);

      // Assertions
      expect(result).toEqual({
        success: true,
        txHash: mockTxHash,
        address: withdrawDto.address,
        amount: withdrawDto.amount,
      });
      expect(starknetService.withdraw).toHaveBeenCalledWith(
        withdrawDto.address,
        expectedAmountInWei,
      );
    });
  });

  describe('rebalance', () => {
    it('should trigger rebalance of funds across strategies', async () => {
      // Mock data
      const mockTxHash = '0xtxhash789';
      const mockAllocation = {
        vesu: 40,
        babylon: 30,
        ekubo: 30,
      };

      // Mock StarknetService call
      mockStarknetService.rebalance.mockResolvedValue(mockTxHash);
      
      // Mock getCurrentAllocation to return the new allocation after rebalance
      jest.spyOn(service, 'getCurrentAllocation').mockResolvedValue(mockAllocation);

      // Execute the method
      const result = await service.rebalance();

      // Assertions
      expect(result).toEqual({
        success: true,
        txHash: mockTxHash,
        allocation: mockAllocation,
      });
      expect(starknetService.rebalance).toHaveBeenCalled();
    });
  });

  describe('getYieldHistory', () => {
    it('should return yield history for a specific user', async () => {
      // Mock data
      const address = '0xuser';
      const days = 30;
      
      // Execute the method
      const result = await service.getYieldHistory(address, days);

      // Assertions
      expect(result).toHaveProperty('address', address);
      expect(result).toHaveProperty('days', days);
      expect(result).toHaveProperty('history');
      expect(Array.isArray(result.history)).toBe(true);
      expect(result.history.length).toBe(days);
      
      // Check structure of history items
      result.history.forEach(item => {
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('apy');
      });
    });

    it('should return platform-wide yield history when no address is provided', async () => {
      // Mock data
      const days = 30;
      
      // Execute the method
      const result = await service.getYieldHistory(undefined, days);

      // Assertions
      expect(result).toHaveProperty('address', 'platform');
      expect(result).toHaveProperty('days', days);
      expect(result).toHaveProperty('history');
      expect(Array.isArray(result.history)).toBe(true);
      expect(result.history.length).toBe(days);
    });
  });
});
