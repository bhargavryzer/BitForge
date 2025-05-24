import { Test, TestingModule } from '@nestjs/testing';
import { StarknetService } from '../starknet.service';
import { ConfigService } from '@nestjs/config';

// Mock the starknet library
jest.mock('starknet', () => ({
  Contract: jest.fn().mockImplementation(() => ({
    call: jest.fn(),
    invoke: jest.fn(),
  })),
  Provider: jest.fn().mockImplementation(() => ({
    getTransactionReceipt: jest.fn(),
    getBlock: jest.fn(),
  })),
}));

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockImplementation((key) => {
    if (key === 'starknet.rpc') return 'https://starknet-testnet.infura.io/v3/test';
    if (key === 'starknet.privateKey') return '0xprivatekey';
    if (key === 'contracts.yield') return '0x123';
    if (key === 'contracts.wallet') return '0x456';
    if (key === 'contracts.btc') return '0x789';
    return null;
  }),
};

describe('StarknetService', () => {
  let service: StarknetService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarknetService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<StarknetService>(StarknetService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('callContract', () => {
    it('should call a contract method and return the result', async () => {
      // Mock data
      const contractAddress = '0x123';
      const method = 'getBalance';
      const args = ['0xuser'];
      const mockResult = { balance: '1.5' };

      // Mock the contract call
      const mockCall = jest.fn().mockResolvedValue(mockResult);
      jest.spyOn(service as any, 'getContract').mockReturnValue({
        call: mockCall,
      });

      // Execute the method
      const result = await service.callContract(contractAddress, method, args);

      // Assertions
      expect(result).toEqual(mockResult);
      expect(mockCall).toHaveBeenCalledWith(method, args);
      expect((service as any).getContract).toHaveBeenCalledWith(contractAddress);
    });

    it('should handle errors when calling a contract', async () => {
      // Mock data
      const contractAddress = '0x123';
      const method = 'getBalance';
      const args = ['0xuser'];
      const mockError = new Error('Contract call failed');

      // Mock the contract call to throw an error
      const mockCall = jest.fn().mockRejectedValue(mockError);
      jest.spyOn(service as any, 'getContract').mockReturnValue({
        call: mockCall,
      });

      // Execute and assert
      await expect(service.callContract(contractAddress, method, args)).rejects.toThrow(
        'Error calling contract method getBalance: Contract call failed'
      );
      expect(mockCall).toHaveBeenCalledWith(method, args);
      expect((service as any).getContract).toHaveBeenCalledWith(contractAddress);
    });
  });

  describe('executeTransaction', () => {
    it('should execute a transaction and return the transaction hash', async () => {
      // Mock data
      const contractAddress = '0x123';
      const method = 'deposit';
      const args = ['0xuser', '1.5'];
      const mockTxHash = '0xtxhash123';

      // Mock the contract invoke
      const mockInvoke = jest.fn().mockResolvedValue({ transaction_hash: mockTxHash });
      jest.spyOn(service as any, 'getContract').mockReturnValue({
        invoke: mockInvoke,
      });

      // Execute the method
      const result = await service.executeTransaction(contractAddress, method, args);

      // Assertions
      expect(result).toEqual({ txHash: mockTxHash });
      expect(mockInvoke).toHaveBeenCalledWith(method, args);
      expect((service as any).getContract).toHaveBeenCalledWith(contractAddress);
    });

    it('should handle errors when executing a transaction', async () => {
      // Mock data
      const contractAddress = '0x123';
      const method = 'deposit';
      const args = ['0xuser', '1.5'];
      const mockError = new Error('Transaction failed');

      // Mock the contract invoke to throw an error
      const mockInvoke = jest.fn().mockRejectedValue(mockError);
      jest.spyOn(service as any, 'getContract').mockReturnValue({
        invoke: mockInvoke,
      });

      // Execute and assert
      await expect(service.executeTransaction(contractAddress, method, args)).rejects.toThrow(
        'Error executing transaction method deposit: Transaction failed'
      );
      expect(mockInvoke).toHaveBeenCalledWith(method, args);
      expect((service as any).getContract).toHaveBeenCalledWith(contractAddress);
    });
  });

  describe('getContractData', () => {
    it('should get contract data by address', async () => {
      // Mock data
      const contractAddress = '0x123';
      const mockContractData = {
        name: 'YieldContract',
        version: '1.0',
        methods: ['deposit', 'withdraw', 'getBalance'],
      };

      // Mock the contract call
      const mockCall = jest.fn().mockResolvedValue(mockContractData);
      jest.spyOn(service as any, 'getContract').mockReturnValue({
        call: mockCall,
      });

      // Execute the method
      const result = await service.getContractData(contractAddress);

      // Assertions
      expect(result).toEqual(mockContractData);
      expect(mockCall).toHaveBeenCalledWith('getContractData', []);
      expect((service as any).getContract).toHaveBeenCalledWith(contractAddress);
    });
  });

  describe('verifySignature', () => {
    it('should verify a signature and return true if valid', async () => {
      // Mock data
      const address = '0xuser';
      const signature = '0xvalidsignature';

      // Mock implementation
      jest.spyOn(service as any, 'verifyStarknetSignature').mockResolvedValue(true);

      // Execute the method
      const result = await service.verifySignature(address, signature);

      // Assertions
      expect(result).toBe(true);
      expect((service as any).verifyStarknetSignature).toHaveBeenCalledWith(address, signature);
    });

    it('should return false if signature is invalid', async () => {
      // Mock data
      const address = '0xuser';
      const signature = '0xinvalidsignature';

      // Mock implementation
      jest.spyOn(service as any, 'verifyStarknetSignature').mockResolvedValue(false);

      // Execute the method
      const result = await service.verifySignature(address, signature);

      // Assertions
      expect(result).toBe(false);
      expect((service as any).verifyStarknetSignature).toHaveBeenCalledWith(address, signature);
    });
  });
});
