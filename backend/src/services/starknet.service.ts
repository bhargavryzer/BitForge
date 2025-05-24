import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, RpcProvider, Account, stark, ec, CallData } from 'starknet';
import { bitforgeAbi } from '../abis/bitforge.abi';
import { yieldVaultAbi } from '../abis/yield_vault.abi';
import { stakingModuleAbi } from '../abis/staking_module.abi';
import { liquidityPoolAbi } from '../abis/liquidity_pool.abi';

@Injectable()
export class StarknetService {
  private provider: RpcProvider;
  private bitforgeContract: Contract;
  private yieldVaultContract: Contract;
  private stakingModuleContract: Contract;
  private liquidityPoolContract: Contract;

  constructor(private configService: ConfigService) {
    // Initialize Starknet provider
    this.provider = new RpcProvider({
      nodeUrl: this.configService.get<string>('STARKNET_RPC_URL', 'https://starknet-sepolia.infura.io/v3/'),
    });

    // Initialize contract instances
    this.initializeContracts();
  }

  private async initializeContracts() {
    const bitforgeAddress = this.configService.get<string>('BITFORGE_CONTRACT_ADDRESS');
    const yieldVaultAddress = this.configService.get<string>('YIELD_VAULT_CONTRACT_ADDRESS');
    const stakingModuleAddress = this.configService.get<string>('STAKING_MODULE_CONTRACT_ADDRESS');
    const liquidityPoolAddress = this.configService.get<string>('LIQUIDITY_POOL_CONTRACT_ADDRESS');

    // ABIs are imported from the abis directory

    // Initialize contract instances
    if (bitforgeAddress) {
      this.bitforgeContract = new Contract(bitforgeAbi, bitforgeAddress, this.provider);
    }

    if (yieldVaultAddress) {
      this.yieldVaultContract = new Contract(yieldVaultAbi, yieldVaultAddress, this.provider);
    }

    if (stakingModuleAddress) {
      this.stakingModuleContract = new Contract(stakingModuleAbi, stakingModuleAddress, this.provider);
    }

    if (liquidityPoolAddress) {
      this.liquidityPoolContract = new Contract(liquidityPoolAbi, liquidityPoolAddress, this.provider);
    }
  }

  private getAccount(address: string): Account {
    // In a real implementation, this would handle account abstraction
    // For simplicity, using a basic account
    const privateKey = this.configService.get<string>('ADMIN_PRIVATE_KEY');
    const accountAddress = this.configService.get<string>('ADMIN_ACCOUNT_ADDRESS');
    
    if (!privateKey || !accountAddress) {
      throw new Error('Admin account not configured');
    }
    
    return new Account(this.provider, accountAddress, privateKey);
  }

  async getVesuApy(): Promise<number> {
    try {
      // In a real implementation, this would query the Vesu protocol or Pragma oracle
      // For simplicity, returning a placeholder value
      return 14.5; // 14.5% APY
    } catch (error) {
      console.error('Error getting Vesu APY:', error);
      throw error;
    }
  }

  async getBabylonApy(): Promise<number> {
    try {
      // In a real implementation, this would query the Babylon protocol or Pragma oracle
      // For simplicity, returning a placeholder value
      return 8.2; // 8.2% APY
    } catch (error) {
      console.error('Error getting Babylon APY:', error);
      throw error;
    }
  }

  async getEkuboApy(): Promise<number> {
    try {
      // In a real implementation, this would query the Ekubo protocol or Pragma oracle
      // For simplicity, returning a placeholder value
      return 17.8; // 17.8% APY
    } catch (error) {
      console.error('Error getting Ekubo APY:', error);
      throw error;
    }
  }

  async getAllocation(): Promise<[number, number, number]> {
    try {
      if (!this.yieldVaultContract) {
        throw new Error('Yield Vault contract not initialized');
      }

      // Call the get_current_allocation function on the YieldVault contract
      // In a real implementation, this would return actual values from the contract
      // For simplicity, returning placeholder values
      return [4000, 3000, 3000]; // 40%, 30%, 30% (in basis points)
    } catch (error) {
      console.error('Error getting allocation:', error);
      throw error;
    }
  }

  async getUserBalance(address: string): Promise<BigInt> {
    try {
      if (!this.bitforgeContract) {
        throw new Error('BitForge contract not initialized');
      }

      // Call the get_user_balance function on the BitForge contract
      // In a real implementation, this would return actual values from the contract
      // For simplicity, returning a placeholder value
      return BigInt(1_000_000_000); // 10 BTC (in satoshis)
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  async getTotalDeposits(): Promise<BigInt> {
    try {
      if (!this.bitforgeContract) {
        throw new Error('BitForge contract not initialized');
      }

      // Call the get_total_deposits function on the BitForge contract
      // In a real implementation, this would return actual values from the contract
      // For simplicity, returning a placeholder value
      return BigInt(100_000_000_000); // 1000 BTC (in satoshis)
    } catch (error) {
      console.error('Error getting total deposits:', error);
      throw error;
    }
  }

  async deposit(address: string, amount: BigInt): Promise<string> {
    try {
      if (!this.bitforgeContract) {
        throw new Error('BitForge contract not initialized');
      }

      // Get account for transaction
      const account = this.getAccount(address);

      // Call the deposit function on the BitForge contract
      const { transaction_hash } = await account.execute({
        contractAddress: this.bitforgeContract.address,
        entrypoint: 'deposit',
        calldata: CallData.compile({
          amount: amount.toString(),
        }),
      });

      return transaction_hash;
    } catch (error) {
      console.error('Error depositing:', error);
      throw error;
    }
  }

  async withdraw(address: string, amount: BigInt): Promise<string> {
    try {
      if (!this.bitforgeContract) {
        throw new Error('BitForge contract not initialized');
      }

      // Get account for transaction
      const account = this.getAccount(address);

      // Call the withdraw function on the BitForge contract
      const { transaction_hash } = await account.execute({
        contractAddress: this.bitforgeContract.address,
        entrypoint: 'withdraw',
        calldata: CallData.compile({
          amount: amount.toString(),
        }),
      });

      return transaction_hash;
    } catch (error) {
      console.error('Error withdrawing:', error);
      throw error;
    }
  }

  async rebalance(): Promise<string> {
    try {
      if (!this.bitforgeContract) {
        throw new Error('BitForge contract not initialized');
      }

      // Get admin account for transaction
      const adminAddress = this.configService.get<string>('ADMIN_ACCOUNT_ADDRESS');
      const account = this.getAccount(adminAddress);

      // Call the rebalance function on the BitForge contract
      const { transaction_hash } = await account.execute({
        contractAddress: this.bitforgeContract.address,
        entrypoint: 'rebalance',
        calldata: CallData.compile({}),
      });

      return transaction_hash;
    } catch (error) {
      console.error('Error rebalancing:', error);
      throw error;
    }
  }
}
