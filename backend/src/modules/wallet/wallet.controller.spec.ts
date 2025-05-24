import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

// Mock WalletService
const mockWalletService = {
  getNonce: jest.fn(),
  connectWallet: jest.fn(),
  getAllowance: jest.fn(),
  approve: jest.fn(),
  getTransactionHistory: jest.fn(),
};

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        { provide: WalletService, useValue: mockWalletService },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNonce', () => {
    it('should return nonce for a wallet address', async () => {
      // Mock data
      const address = '0xuser';
      const mockNonce = { nonce: '123456' };

      // Mock service call
      mockWalletService.getNonce.mockResolvedValue(mockNonce);

      // Execute the method
      const result = await controller.getNonce(address);

      // Assertions
      expect(result).toEqual(mockNonce);
      expect(service.getNonce).toHaveBeenCalledWith(address);
    });
  });

  describe('connect', () => {
    it('should connect wallet to the platform', async () => {
      // Mock data
      const connectDto = {
        address: '0xuser',
        signature: '0xsignature',
      };
      const mockConnectionData = { 
        connected: true, 
        timestamp: Date.now(),
        address: connectDto.address
      };

      // Mock service call
      mockWalletService.connectWallet.mockResolvedValue(mockConnectionData);

      // Execute the method
      const result = await controller.connect(connectDto);

      // Assertions
      expect(result).toEqual(mockConnectionData);
      expect(service.connectWallet).toHaveBeenCalledWith(connectDto.address, connectDto.signature);
    });
  });

  describe('getAllowance', () => {
    it('should get BTC allowance for BitForge contract', async () => {
      // Mock data
      const address = '0xuser';
      const mockAllowanceData = { allowance: '10.0' };

      // Mock service call
      mockWalletService.getAllowance.mockResolvedValue(mockAllowanceData);

      // Execute the method
      const result = await controller.getAllowance(address);

      // Assertions
      expect(result).toEqual(mockAllowanceData);
      expect(service.getAllowance).toHaveBeenCalledWith(address);
    });
  });

  describe('approve', () => {
    it('should approve BitForge contract to spend BTC', async () => {
      // Mock data
      const approveDto = {
        address: '0xuser',
        amount: '5.0',
      };
      const mockTxHash = { txHash: '0xtxhash123' };

      // Mock service call
      mockWalletService.approve.mockResolvedValue(mockTxHash);

      // Execute the method
      const result = await controller.approve(approveDto);

      // Assertions
      expect(result).toEqual(mockTxHash);
      expect(service.approve).toHaveBeenCalledWith(approveDto.address, approveDto.amount);
    });
  });

  describe('getTransactions', () => {
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

      // Mock service call
      mockWalletService.getTransactionHistory.mockResolvedValue(mockTransactionHistory);

      // Execute the method
      const result = await controller.getTransactions(address);

      // Assertions
      expect(result).toEqual(mockTransactionHistory);
      expect(service.getTransactionHistory).toHaveBeenCalledWith(address);
    });
  });
});
