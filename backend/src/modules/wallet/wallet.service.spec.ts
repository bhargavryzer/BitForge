import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { StarknetService } from '../../services/starknet.service';
import { ConfigService } from '@nestjs/config';

// Mock StarknetService
const mockStarknetService = {
  callContract: jest.fn(),
  executeTransaction: jest.fn(),
  getContractData: jest.fn(),
  verifySignature: jest.fn(),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockImplementation((key) => {
    if (key === 'contracts.wallet') return '0x789';
    if (key === 'contracts.btc') return '0x456';
    return null;
  }),
};

describe('WalletService', () => {
  let service: WalletService;
  let starknetService: StarknetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: StarknetService, useValue: mockStarknetService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    starknetService = module.get<StarknetService>(StarknetService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNonce', () => {
    it('should return nonce for a wallet address', async () => {
      // Mock data
      const address = '0xuser';
      const mockNonce = { nonce: '123456' };

      // Mock StarknetService call
      mockStarknetService.callContract.mockResolvedValue(mockNonce);

      // Execute the method
      const result = await service.getNonce(address);

      // Assertions
      expect(result).toEqual(mockNonce);
      expect(starknetService.callContract).toHaveBeenCalledWith(
        expect.any(String),
        'getNonce',
        [address],
      );
    });
  });

  describe('connectWallet', () => {
    it('should connect wallet to the platform', async () => {
      // Mock data
      const address = '0xuser';
      const signature = '0xsignature';
      const mockConnectionData = { 
        connected: true, 
        timestamp: Date.now(),
        address
      };

      // Mock StarknetService calls
      mockStarknetService.verifySignature.mockResolvedValue(true);
      mockStarknetService.executeTransaction.mockResolvedValue(mockConnectionData);

      // Execute the method
      const result = await service.connectWallet(address, signature);

      // Assertions
      expect(result).toEqual(mockConnectionData);
      expect(starknetService.verifySignature).toHaveBeenCalledWith(address, signature);
      expect(starknetService.executeTransaction).toHaveBeenCalledWith(
        expect.any(String),
        'connectWallet',
        [address],
      );
    });

    it('should throw an error if signature verification fails', async () => {
      // Mock data
      const address = '0xuser';
      const signature = '0xinvalidsignature';

      // Mock StarknetService call
      mockStarknetService.verifySignature.mockResolvedValue(false);

      // Execute and assert
      await expect(service.connectWallet(address, signature)).rejects.toThrow(
        'Invalid signature'
      );
      expect(starknetService.verifySignature).toHaveBeenCalledWith(address, signature);
      expect(starknetService.executeTransaction).not.toHaveBeenCalled();
    });
  });

  describe('getAllowance', () => {
    it('should get BTC allowance for BitForge contract', async () => {
      // Mock data
      const address = '0xuser';
      const mockAllowanceData = { allowance: '10.0' };

      // Mock StarknetService call
      mockStarknetService.callContract.mockResolvedValue(mockAllowanceData);

      // Execute the method
      const result = await service.getAllowance(address);

      // Assertions
      expect(result).toEqual(mockAllowanceData);
      expect(starknetService.callContract).toHaveBeenCalledWith(
        expect.any(String),
        'getAllowance',
        [address, expect.any(String)],
      );
    });
  });

  describe('approve', () => {
    it('should approve BitForge contract to spend BTC', async () => {
      // Mock data
      const address = '0xuser';
      const amount = '5.0';
      const mockTxHash = '0xtxhash123';

      // Mock StarknetService call
      mockStarknetService.executeTransaction.mockResolvedValue({ txHash: mockTxHash });

      // Execute the method
      const result = await service.approve(address, amount);

      // Assertions
      expect(result).toEqual({ txHash: mockTxHash });
      expect(starknetService.executeTransaction).toHaveBeenCalledWith(
        expect.any(String),
        'approve',
        [address, expect.any(String), amount],
      );
    });
  });

  describe('getTransactionHistory', () => {
    it('should get transaction history for a wallet', async () => {
      // Mock data
      const address = '0xuser';
      const mockTransactionHistory = {
        transactions: [
          {
            txHash: '0xtx1',
            type: 'deposit',
            amount: '1.0',
            timestamp: 1621500000,
            status: 'confirmed',
          },
          {
            txHash: '0xtx2',
            type: 'withdraw',
            amount: '0.5',
            timestamp: 1621600000,
            status: 'confirmed',
          },
        ],
      };

      // Mock StarknetService call
      mockStarknetService.callContract.mockResolvedValue(mockTransactionHistory);

      // Execute the method
      const result = await service.getTransactionHistory(address);

      // Assertions
      expect(result).toEqual(mockTransactionHistory);
      expect(starknetService.callContract).toHaveBeenCalledWith(
        expect.any(String),
        'getTransactionHistory',
        [address],
      );
    });
  });
});
