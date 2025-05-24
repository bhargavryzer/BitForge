import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { StarknetService } from '../starknet.service';
import { PragmaService } from '../pragma.service';
import { CustomLoggerService } from '../../logger/logger.service';
import { ApiException } from '../../exceptions/api.exception';
import { RpcProvider, Contract, Account, CallData } from 'starknet'; // Import actual types for structure, but they will be mocked

// Mock StarkNet.js library components
const mockBitforgeContract = { call: jest.fn(), execute: jest.fn(), address: 'bitforgeAddress_mock' };
const mockYieldVaultContract = { call: jest.fn(), execute: jest.fn(), address: 'yieldVaultAddress_mock' };
const mockStakingModuleContract = { call: jest.fn(), execute: jest.fn(), address: 'stakingModuleAddress_mock' };
const mockLiquidityPoolContract = { call: jest.fn(), execute: jest.fn(), address: 'liquidityPoolAddress_mock' };
const mockAccountExecute = jest.fn();

jest.mock('starknet', () => ({
  RpcProvider: jest.fn().mockImplementation(() => ({
    // Mock RpcProvider methods if any are directly used by StarknetService, otherwise empty
  })),
  Contract: jest.fn().mockImplementation((abi, address) => {
    if (address === 'bitforgeAddress_mock') return mockBitforgeContract;
    if (address === 'yieldVaultAddress_mock') return mockYieldVaultContract;
    if (address === 'stakingModuleAddress_mock') return mockStakingModuleContract;
    if (address === 'liquidityPoolAddress_mock') return mockLiquidityPoolContract;
    return { call: jest.fn(), execute: jest.fn(), address: 'unknown_mock_address' };
  }),
  Account: jest.fn().mockImplementation(() => ({
    execute: mockAccountExecute,
  })),
  CallData: { // Mock CallData if its methods are used directly
    compile: jest.fn().mockImplementation(obj => Object.values(obj).map(String)), // Simple mock
  },
  ec: {
    // Mock ec components if needed
  },
  stark: {
    // Mock stark components if needed
  }
}));

describe('StarknetService', () => {
  let service: StarknetService;
  let mockConfigService: Partial<ConfigService>;
  let mockPragmaService: Partial<PragmaService>;
  let mockLoggerService: CustomLoggerService;

  const RPC_URL = 'https://mock-rpc.com';
  const ADMIN_PRIVATE_KEY = '0x123adminprivatekey';
  const ADMIN_ACCOUNT_ADDRESS = '0xadminaccountaddress';

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    mockBitforgeContract.call.mockReset();
    mockYieldVaultContract.call.mockReset();
    mockAccountExecute.mockReset();
    
    // Mock implementations
    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const configValues = {
          STARKNET_RPC_URL: RPC_URL,
          BITFORGE_CONTRACT_ADDRESS: 'bitforgeAddress_mock',
          YIELD_VAULT_CONTRACT_ADDRESS: 'yieldVaultAddress_mock',
          STAKING_MODULE_CONTRACT_ADDRESS: 'stakingModuleAddress_mock',
          LIQUIDITY_POOL_CONTRACT_ADDRESS: 'liquidityPoolAddress_mock',
          ADMIN_PRIVATE_KEY: ADMIN_PRIVATE_KEY,
          ADMIN_ACCOUNT_ADDRESS: ADMIN_ACCOUNT_ADDRESS,
        };
        return configValues[key] || defaultValue;
      }),
    };

    mockPragmaService = {
      getApyData: jest.fn(),
    };

    mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
      setContext: jest.fn().mockReturnThis(), // Important for `this.logger = logger.setContext(...)`
    } as unknown as CustomLoggerService; // Cast to allow mocking setContext easily

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarknetService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PragmaService, useValue: mockPragmaService },
        { provide: CustomLoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    service = module.get<StarknetService>(StarknetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize provider and contracts from config', () => {
      expect(RpcProvider).toHaveBeenCalledWith({ nodeUrl: RPC_URL });
      expect(Contract).toHaveBeenCalledWith(expect.any(Array), 'bitforgeAddress_mock', expect.any(RpcProvider));
      expect(Contract).toHaveBeenCalledWith(expect.any(Array), 'yieldVaultAddress_mock', expect.any(RpcProvider));
      expect(mockLoggerService.log).toHaveBeenCalledWith('StarknetService instantiated', undefined);
      expect(mockLoggerService.log).toHaveBeenCalledWith(`Starknet provider initialized with URL: ${RPC_URL}`, undefined);
      expect(mockLoggerService.log).toHaveBeenCalledWith('Initializing contracts...', undefined);
      expect(mockLoggerService.log).toHaveBeenCalledWith('BitForge contract initialized at address: bitforgeAddress_mock', undefined);
    });

    it('should log warnings if contract addresses are missing', () => {
        mockConfigService.get = jest.fn((key: string) => {
            if (key === 'STARKNET_RPC_URL') return RPC_URL;
            // Return undefined for other contract addresses
            return undefined;
        });
        // Re-initialize service with new config mock for this test
        service = new StarknetService(
            mockConfigService as ConfigService, 
            mockPragmaService as PragmaService, 
            mockLoggerService
        );
        expect(mockLoggerService.warn).toHaveBeenCalledWith('BitForge contract address not found in config. Contract not initialized.', undefined);
        expect(mockLoggerService.warn).toHaveBeenCalledWith('YieldVault contract address not found in config. Contract not initialized.', undefined);
    });
  });

  describe('getAccount', () => {
    it('should return an Account instance with admin credentials', () => {
      const account = (service as any).getAccount('someAddress'); // test private method
      expect(Account).toHaveBeenCalledWith(expect.any(RpcProvider), ADMIN_ACCOUNT_ADDRESS, ADMIN_PRIVATE_KEY);
      expect(account).toBeInstanceOf(Account);
      expect(mockLoggerService.debug).toHaveBeenCalledWith(`Getting account for address (admin context): someAddress`, undefined);
    });

    it('should throw ApiException if admin credentials are not configured', () => {
      mockConfigService.get = jest.fn((key: string) => {
        if (key === 'ADMIN_PRIVATE_KEY') return undefined;
        return ADMIN_ACCOUNT_ADDRESS;
      });
      service = new StarknetService(mockConfigService as ConfigService, mockPragmaService as PragmaService, mockLoggerService); // Re-initialize with new config

      expect(() => (service as any).getAccount('someAddress')).toThrow(
        new ApiException('Admin account not configured. Check ADMIN_PRIVATE_KEY and ADMIN_ACCOUNT_ADDRESS.', HttpStatus.INTERNAL_SERVER_ERROR, 'ADMIN_ACCOUNT_CONFIG_ERROR'),
      );
      expect(mockLoggerService.error).toHaveBeenCalledWith('Admin account configuration missing. Cannot create account.', {"accountAddressProvided": true, "privateKeyProvided": false}, undefined);
    });
  });

  describe('APY Getters', () => {
    const apyDataMock = {
        vesu: { lending: 10.5 },
        babylon: { staking: 5.2 },
        ekubo: { total: 12.3 },
      };

    describe('getVesuApy', () => {
      it('should return Vesu APY from PragmaService', async () => {
        (mockPragmaService.getApyData as jest.Mock).mockResolvedValueOnce(apyDataMock);
        const result = await service.getVesuApy();
        expect(result).toBe(10.5);
        expect(mockPragmaService.getApyData).toHaveBeenCalled();
        expect(mockLoggerService.debug).toHaveBeenCalledWith('Vesu APY fetched: 10.5', undefined);
      });

      it('should throw ApiException if PragmaService returns invalid Vesu data', async () => {
        (mockPragmaService.getApyData as jest.Mock).mockResolvedValueOnce({ vesu: {} }); // Invalid data
        await expect(service.getVesuApy()).rejects.toThrow(
          new ApiException('Invalid APY data received from Pragma for Vesu.', HttpStatus.BAD_GATEWAY, 'PRAGMA_INVALID_VESU_APY'),
        );
        expect(mockLoggerService.warn).toHaveBeenCalledWith('Invalid APY data received from Pragma for Vesu.', { apyData: { vesu: {} } }, undefined);
      });

      it('should throw ApiException if PragmaService.getApyData throws', async () => {
        const pragmaError = new Error('Pragma down');
        (mockPragmaService.getApyData as jest.Mock).mockRejectedValueOnce(pragmaError);
        await expect(service.getVesuApy()).rejects.toThrow(
          new ApiException(`Failed to get Vesu APY from Pragma: ${pragmaError.message}`, HttpStatus.BAD_GATEWAY, 'PRAGMA_VESU_APY_ERROR'),
        );
        expect(mockLoggerService.error).toHaveBeenCalledWith(`Error getting Vesu APY from Pragma: ${pragmaError.message}`, pragmaError.stack, undefined);
      });
    });
    // Similar tests for getBabylonApy and getEkuboApy
    describe('getBabylonApy', () => {
        it('should return Babylon APY from PragmaService', async () => {
          (mockPragmaService.getApyData as jest.Mock).mockResolvedValueOnce(apyDataMock);
          const result = await service.getBabylonApy();
          expect(result).toBe(5.2);
          expect(mockPragmaService.getApyData).toHaveBeenCalled();
          expect(mockLoggerService.debug).toHaveBeenCalledWith('Babylon APY fetched: 5.2', undefined);
        });
      });
  
      describe('getEkuboApy', () => {
        it('should return Ekubo APY from PragmaService', async () => {
          (mockPragmaService.getApyData as jest.Mock).mockResolvedValueOnce(apyDataMock);
          const result = await service.getEkuboApy();
          expect(result).toBe(12.3);
          expect(mockPragmaService.getApyData).toHaveBeenCalled();
          expect(mockLoggerService.debug).toHaveBeenCalledWith('Ekubo APY fetched: 12.3', undefined);
        });
      });
  });

  describe('Contract Data Getters', () => {
    describe('getAllocation', () => {
      it('should return allocation from YieldVault contract', async () => {
        const mockAllocation = { vesu_allocation: 4000n, babylon_allocation: 3000n, ekubo_allocation: 3000n };
        mockYieldVaultContract.call.mockResolvedValueOnce(mockAllocation);
        const result = await service.getAllocation();
        expect(result).toEqual([40, 30, 30]);
        expect(mockYieldVaultContract.call).toHaveBeenCalledWith('get_current_allocation');
        expect(mockLoggerService.debug).toHaveBeenCalledWith('Allocation fetched successfully.', { result: [40, 30, 30] }, undefined);
      });

      it('should throw ApiException if YieldVault contract not initialized', async () => {
        (service as any).yieldVaultContract = null; // Simulate not initialized
        await expect(service.getAllocation()).rejects.toThrow(
          new ApiException('Yield Vault contract not initialized. Please check configuration.', HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_VAULT_CONTRACT_NOT_INIT'),
        );
        expect(mockLoggerService.error).toHaveBeenCalledWith('YieldVault contract is not initialized.', undefined);
      });

      it('should throw ApiException on YieldVault contract call failure', async () => {
        const contractError = new Error('YieldVault call failed');
        mockYieldVaultContract.call.mockRejectedValueOnce(contractError);
        await expect(service.getAllocation()).rejects.toThrow(
          new ApiException(`Failed to retrieve allocation from YieldVault: ${contractError.message}`, HttpStatus.SERVICE_UNAVAILABLE, 'STARKNET_YIELD_VAULT_READ_ERROR'),
        );
        expect(mockLoggerService.error).toHaveBeenCalledWith(`Error getting allocation from YieldVault contract: ${contractError.message}`, contractError.stack, undefined);
      });
    });

    // Similar tests for getUserBalance and getTotalDeposits
    describe('getUserBalance', () => {
        const userAddress = '0xuser';
        it('should return user balance from BitForge contract', async () => {
          const mockBalance = { balance: 100000000n }; // 1 BTC in satoshis
          mockBitforgeContract.call.mockResolvedValueOnce(mockBalance);
          const result = await service.getUserBalance(userAddress);
          expect(result).toEqual(100000000n);
          expect(mockBitforgeContract.call).toHaveBeenCalledWith('get_user_balance', [userAddress]);
          expect(mockLoggerService.debug).toHaveBeenCalledWith(`User balance fetched for ${userAddress}: 100000000`, undefined);
        });
      });
  
      describe('getTotalDeposits', () => {
        it('should return total deposits from BitForge contract', async () => {
          const mockTotalDeposits = { total: 50000000000n }; // 500 BTC in satoshis
          mockBitforgeContract.call.mockResolvedValueOnce(mockTotalDeposits);
          const result = await service.getTotalDeposits();
          expect(result).toEqual(50000000000n);
          expect(mockBitforgeContract.call).toHaveBeenCalledWith('get_total_deposits');
          expect(mockLoggerService.debug).toHaveBeenCalledWith('Total deposits fetched: 50000000000', undefined);
        });
      });
  });

  describe('Transaction Preparation', () => {
    const userAddress = '0xuser';
    const amount = 100000000n; // 1 BTC

    describe('deposit', () => {
      it('should prepare deposit transaction data', async () => {
        const result = await service.deposit(userAddress, amount);
        expect(result).toEqual({
          contractAddress: 'bitforgeAddress_mock',
          entrypoint: 'deposit',
          calldata: [amount.toString()],
        });
        expect(CallData.compile).toHaveBeenCalledWith({ amount: amount.toString() });
        expect(mockLoggerService.log).toHaveBeenCalledWith(`Preparing deposit transaction for user: ${userAddress}, amount: ${amount.toString()}`, { address: userAddress, amount: amount.toString() }, undefined);
      });

      it('should throw ApiException if BitForge contract not initialized for deposit', async () => {
        (service as any).bitforgeContract = null;
        await expect(service.deposit(userAddress, amount)).rejects.toThrow(
          new ApiException('BitForge contract not initialized. Please check configuration.', HttpStatus.INTERNAL_SERVER_ERROR, 'BITFORGE_CONTRACT_NOT_INIT'),
        );
         expect(mockLoggerService.error).toHaveBeenCalledWith('BitForge contract is not initialized for deposit preparation.', undefined);
      });
    });
    // Similar tests for withdraw
    describe('withdraw', () => {
        it('should prepare withdraw transaction data', async () => {
          const result = await service.withdraw(userAddress, amount);
          expect(result).toEqual({
            contractAddress: 'bitforgeAddress_mock',
            entrypoint: 'withdraw',
            calldata: [amount.toString()],
          });
          expect(CallData.compile).toHaveBeenCalledWith({ amount: amount.toString() });
          expect(mockLoggerService.log).toHaveBeenCalledWith(`Preparing withdraw transaction for user: ${userAddress}, amount: ${amount.toString()}`, { address: userAddress, amount: amount.toString() }, undefined);
        });
      });
  });

  describe('rebalance', () => {
    const mockTxHash = '0xrebalancetxhash';

    it('should execute rebalance transaction and return transaction hash', async () => {
      mockAccountExecute.mockResolvedValueOnce({ transaction_hash: mockTxHash });
      const result = await service.rebalance();
      expect(result).toBe(mockTxHash);
      expect(mockAccountExecute).toHaveBeenCalledWith({
        contractAddress: 'bitforgeAddress_mock',
        entrypoint: 'rebalance',
        calldata: [], // Assuming empty calldata from CallData.compile({})
      });
      expect(mockLoggerService.log).toHaveBeenCalledWith('Attempting to execute rebalance transaction.', undefined);
      expect(mockLoggerService.log).toHaveBeenCalledWith(`Rebalance transaction successful: ${mockTxHash}`, undefined);
    });

    it('should throw ApiException if BitForge contract not initialized for rebalance', async () => {
      (service as any).bitforgeContract = null;
      await expect(service.rebalance()).rejects.toThrow(
        new ApiException('BitForge contract not initialized. Please check configuration.', HttpStatus.INTERNAL_SERVER_ERROR, 'BITFORGE_CONTRACT_NOT_INIT'),
      );
      expect(mockLoggerService.error).toHaveBeenCalledWith('BitForge contract is not initialized for rebalance.', undefined);
    });

    it('should throw ApiException on rebalance transaction execution failure', async () => {
      const executionError = new Error('Rebalance execution failed');
      mockAccountExecute.mockRejectedValueOnce(executionError);
      await expect(service.rebalance()).rejects.toThrow(
        new ApiException(`StarkNet rebalance transaction failed: ${executionError.message}`, HttpStatus.SERVICE_UNAVAILABLE, 'STARKNET_REBALANCE_EXECUTION_ERROR'),
      );
      expect(mockLoggerService.error).toHaveBeenCalledWith(`Error executing rebalance transaction: ${executionError.message}`, executionError.stack, undefined);
    });

    it('should fail if getAccount throws due to missing admin config', async () => {
        mockConfigService.get = jest.fn((key: string) => {
            if (key === 'ADMIN_PRIVATE_KEY') return undefined; // Cause getAccount to fail
            return 'some_value'; // Default for other keys
          });
        service = new StarknetService(mockConfigService as ConfigService, mockPragmaService as PragmaService, mockLoggerService);

        await expect(service.rebalance()).rejects.toThrow(
            new ApiException('Admin account not configured. Check ADMIN_PRIVATE_KEY and ADMIN_ACCOUNT_ADDRESS.', HttpStatus.INTERNAL_SERVER_ERROR, 'ADMIN_ACCOUNT_CONFIG_ERROR')
        );
    });
  });
});
