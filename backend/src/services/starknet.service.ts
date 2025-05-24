import { Injectable, HttpStatus, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, RpcProvider, Account, stark, ec, CallData, num } from 'starknet';
import { CustomLoggerService } from '../logger/logger.service';
import { PreparedTransaction } from '../interfaces/starknet.interface';
import { ApiException } from '../exceptions/api.exception';
import { bitforgeAbi } from '../abis/bitforge.abi';
import { yieldVaultAbi } from '../abis/yield_vault.abi';
import { stakingModuleAbi } from '../abis/staking_module.abi';
import { liquidityPoolAbi } from '../abis/liquidity_pool.abi';
import { PragmaService } from './pragma.service';

@Injectable()
export class StarknetService {
  private provider: RpcProvider;
  private bitforgeContract: Contract;
  private yieldVaultContract: Contract;
  private stakingModuleContract: Contract;
  private liquidityPoolContract: Contract;
  private readonly logger: CustomLoggerService;

  constructor(
    private configService: ConfigService,
    private pragmaService: PragmaService,
    logger: CustomLoggerService, // Injected logger
  ) {
    this.logger = logger.setContext(StarknetService.name);
    this.logger.log('StarknetService instantiated');

    // Initialize Starknet provider
    const nodeUrl = this.configService.get<string>('STARKNET_RPC_URL', 'https://starknet-sepolia.infura.io/v3/');
    this.provider = new RpcProvider({ nodeUrl });
    this.logger.log(`Starknet provider initialized with URL: ${nodeUrl}`);

    // Initialize contract instances
    this.initializeContracts();
  }

  private initializeContracts() {
    this.logger.log('Initializing contracts...');
    const bitforgeAddress = this.configService.get<string>('BITFORGE_CONTRACT_ADDRESS');
    const yieldVaultAddress = this.configService.get<string>('YIELD_VAULT_CONTRACT_ADDRESS');
    const stakingModuleAddress = this.configService.get<string>('STAKING_MODULE_CONTRACT_ADDRESS');
    const liquidityPoolAddress = this.configService.get<string>('LIQUIDITY_POOL_CONTRACT_ADDRESS');

    if (bitforgeAddress) {
      this.bitforgeContract = new Contract(bitforgeAbi, bitforgeAddress, this.provider);
      this.logger.log(`BitForge contract initialized at address: ${bitforgeAddress}`);
    } else {
      this.logger.warn('BitForge contract address not found in config. Contract not initialized.');
    }

    if (yieldVaultAddress) {
      this.yieldVaultContract = new Contract(yieldVaultAbi, yieldVaultAddress, this.provider);
      this.logger.log(`YieldVault contract initialized at address: ${yieldVaultAddress}`);
    } else {
      this.logger.warn('YieldVault contract address not found in config. Contract not initialized.');
    }

    if (stakingModuleAddress) {
      this.stakingModuleContract = new Contract(stakingModuleAbi, stakingModuleAddress, this.provider);
      this.logger.log(`StakingModule contract initialized at address: ${stakingModuleAddress}`);
    } else {
      this.logger.warn('StakingModule contract address not found in config. Contract not initialized.');
    }

    if (liquidityPoolAddress) {
      this.liquidityPoolContract = new Contract(liquidityPoolAbi, liquidityPoolAddress, this.provider);
      this.logger.log(`LiquidityPool contract initialized at address: ${liquidityPoolAddress}`);
    } else {
      this.logger.warn('LiquidityPool contract address not found in config. Contract not initialized.');
    }
    this.logger.log('Contract initialization finished.');
  }

  private getAccount(address: string): Account {
    this.logger.debug(`Getting account for address (admin context): ${address}`);
    const privateKey = this.configService.get<string>('ADMIN_PRIVATE_KEY');
    const accountAddress = this.configService.get<string>('ADMIN_ACCOUNT_ADDRESS');
    
    if (!privateKey || !accountAddress) {
      this.logger.error('Admin account configuration missing. Cannot create account.', { privateKeyProvided: !!privateKey, accountAddressProvided: !!accountAddress });
      throw new ApiException('Admin account not configured. Check ADMIN_PRIVATE_KEY and ADMIN_ACCOUNT_ADDRESS.', HttpStatus.INTERNAL_SERVER_ERROR, 'ADMIN_ACCOUNT_CONFIG_ERROR');
    }
    this.logger.debug('Admin account configured, creating Account instance.');
    return new Account(this.provider, accountAddress, privateKey);
  }

  async getVesuApy(): Promise<number> {
    this.logger.debug('Attempting to get Vesu APY from PragmaService.');
    try {
      const apyData = await this.pragmaService.getApyData();
      if (apyData && apyData.vesu && typeof apyData.vesu.lending === 'number') {
        this.logger.debug(`Vesu APY fetched: ${apyData.vesu.lending}`);
        return apyData.vesu.lending;
      }
      this.logger.warn('Invalid APY data received from Pragma for Vesu.', { apyData });
      throw new ApiException('Invalid APY data received from Pragma for Vesu.', HttpStatus.BAD_GATEWAY, 'PRAGMA_INVALID_VESU_APY');
    } catch (error) {
      // Error already logged by GlobalExceptionFilter if ApiException
      // If not ApiException, it will be wrapped by it below
      this.logger.error(`Error getting Vesu APY from Pragma: ${error.message}`, error.stack);
      if (error instanceof ApiException) throw error;
      throw new ApiException(`Failed to get Vesu APY from Pragma: ${error.message}`, HttpStatus.BAD_GATEWAY, 'PRAGMA_VESU_APY_ERROR');
    }
  }

  async getBabylonApy(): Promise<number> {
    this.logger.debug('Attempting to get Babylon APY from PragmaService.');
    try {
      const apyData = await this.pragmaService.getApyData();
      if (apyData && apyData.babylon && typeof apyData.babylon.staking === 'number') {
        this.logger.debug(`Babylon APY fetched: ${apyData.babylon.staking}`);
        return apyData.babylon.staking;
      }
      this.logger.warn('Invalid APY data received from Pragma for Babylon.', { apyData });
      throw new ApiException('Invalid APY data received from Pragma for Babylon.', HttpStatus.BAD_GATEWAY, 'PRAGMA_INVALID_BABYLON_APY');
    } catch (error) {
      this.logger.error(`Error getting Babylon APY from Pragma: ${error.message}`, error.stack);
      if (error instanceof ApiException) throw error;
      throw new ApiException(`Failed to get Babylon APY from Pragma: ${error.message}`, HttpStatus.BAD_GATEWAY, 'PRAGMA_BABYLON_APY_ERROR');
    }
  }

  async getEkuboApy(): Promise<number> {
    this.logger.debug('Attempting to get Ekubo APY from PragmaService.');
    try {
      const apyData = await this.pragmaService.getApyData();
      if (apyData && apyData.ekubo && typeof apyData.ekubo.total === 'number') {
        this.logger.debug(`Ekubo APY fetched: ${apyData.ekubo.total}`);
        return apyData.ekubo.total;
      }
      this.logger.warn('Invalid APY data received from Pragma for Ekubo.', { apyData });
      throw new ApiException('Invalid APY data received from Pragma for Ekubo.', HttpStatus.BAD_GATEWAY, 'PRAGMA_INVALID_EKUBO_APY');
    } catch (error) {
      this.logger.error(`Error getting Ekubo APY from Pragma: ${error.message}`, error.stack);
      if (error instanceof ApiException) throw error;
      throw new ApiException(`Failed to get Ekubo APY from Pragma: ${error.message}`, HttpStatus.BAD_GATEWAY, 'PRAGMA_EKUBO_APY_ERROR');
    }
  }

  async getAllocation(): Promise<[number, number, number]> {
    this.logger.debug('Attempting to get allocation from YieldVault contract.');
    if (!this.yieldVaultContract) {
      this.logger.error('YieldVault contract is not initialized.');
      throw new ApiException('Yield Vault contract not initialized. Please check configuration.', HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_VAULT_CONTRACT_NOT_INIT');
    }
    try {
      this.logger.debug('Executing StarkNet call', { contract: 'YieldVault', method: 'get_current_allocation' });
      const allocationResult = await this.yieldVaultContract.call('get_current_allocation');
      const result: [number, number, number] = [
        Number(allocationResult.vesu_allocation),
        Number(allocationResult.babylon_allocation),
        Number(allocationResult.ekubo_allocation),
      ];
      this.logger.debug('Allocation fetched successfully.', { result });
      return result;
    } catch (error) {
      this.logger.error(`Error getting allocation from YieldVault contract: ${error.message}`, error.stack);
      throw new ApiException(`Failed to retrieve allocation from YieldVault: ${error.message}`, HttpStatus.SERVICE_UNAVAILABLE, 'STARKNET_YIELD_VAULT_READ_ERROR');
    }
  }

  async getUserBalance(address: string): Promise<BigInt> {
    this.logger.debug(`Attempting to get user balance for address: ${address}`);
    if (!this.bitforgeContract) {
      this.logger.error('BitForge contract is not initialized.');
      throw new ApiException('BitForge contract not initialized. Please check configuration.', HttpStatus.INTERNAL_SERVER_ERROR, 'BITFORGE_CONTRACT_NOT_INIT');
    }
    try {
      this.logger.debug('Executing StarkNet call', { contract: 'BitForge', method: 'get_user_balance', params: { address } });
      const balanceResult = await this.bitforgeContract.call('get_user_balance', [address]);
      const balance = BigInt(balanceResult.balance);
      this.logger.debug(`User balance fetched for ${address}: ${balance.toString()}`);
      return balance;
    } catch (error) {
      this.logger.error(`Error getting user balance for ${address}: ${error.message}`, error.stack);
      throw new ApiException(`Failed to retrieve user balance for ${address}: ${error.message}`, HttpStatus.SERVICE_UNAVAILABLE, 'STARKNET_USER_BALANCE_READ_ERROR');
    }
  }

  async getTotalDeposits(): Promise<BigInt> {
    this.logger.debug('Attempting to get total deposits from BitForge contract.');
    if (!this.bitforgeContract) {
      this.logger.error('BitForge contract is not initialized.');
      throw new ApiException('BitForge contract not initialized. Please check configuration.', HttpStatus.INTERNAL_SERVER_ERROR, 'BITFORGE_CONTRACT_NOT_INIT');
    }
    try {
      this.logger.debug('Executing StarkNet call', { contract: 'BitForge', method: 'get_total_deposits' });
      const totalDepositsResult = await this.bitforgeContract.call('get_total_deposits');
      const total = BigInt(totalDepositsResult.total);
      this.logger.debug(`Total deposits fetched: ${total.toString()}`);
      return total;
    } catch (error) {
      this.logger.error(`Error getting total deposits: ${error.message}`, error.stack);
      throw new ApiException(`Failed to retrieve total deposits: ${error.message}`, HttpStatus.SERVICE_UNAVAILABLE, 'STARKNET_TOTAL_DEPOSITS_READ_ERROR');
    }
  }

  async deposit(address: string, amount: BigInt): Promise<PreparedTransaction> {
    this.logger.log(`Preparing deposit transaction for user: ${address}, amount: ${amount.toString()}`, { address, amount: amount.toString() });
    if (!this.bitforgeContract) {
      this.logger.error('BitForge contract is not initialized for deposit preparation.');
      throw new ApiException('BitForge contract not initialized. Please check configuration.', HttpStatus.INTERNAL_SERVER_ERROR, 'BITFORGE_CONTRACT_NOT_INIT');
    }
    try {
      const calldata = CallData.compile({ amount: amount.toString() });
      this.logger.debug('Deposit calldata compiled successfully.', { calldata });
      return {
        contractAddress: this.bitforgeContract.address,
        entrypoint: 'deposit',
        calldata: calldata,
      };
    } catch (error) {
      this.logger.error(`Error preparing deposit transaction: ${error.message}`, error.stack, { address, amount: amount.toString() });
      throw new ApiException(`Failed to prepare deposit transaction data: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR, 'DEPOSIT_PREPARATION_ERROR');
    }
  }

  async withdraw(address: string, amount: BigInt): Promise<PreparedTransaction> {
    this.logger.log(`Preparing withdraw transaction for user: ${address}, amount: ${amount.toString()}`, { address, amount: amount.toString() });
    if (!this.bitforgeContract) {
      this.logger.error('BitForge contract is not initialized for withdraw preparation.');
      throw new ApiException('BitForge contract not initialized. Please check configuration.', HttpStatus.INTERNAL_SERVER_ERROR, 'BITFORGE_CONTRACT_NOT_INIT');
    }
    try {
      const calldata = CallData.compile({ amount: amount.toString() });
      this.logger.debug('Withdraw calldata compiled successfully.', { calldata });
      return {
        contractAddress: this.bitforgeContract.address,
        entrypoint: 'withdraw',
        calldata: calldata,
      };
    } catch (error) {
      this.logger.error(`Error preparing withdraw transaction: ${error.message}`, error.stack, { address, amount: amount.toString() });
      throw new ApiException(`Failed to prepare withdraw transaction data: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR, 'WITHDRAW_PREPARATION_ERROR');
    }
  }

  async rebalance(): Promise<string> {
    this.logger.log('Attempting to execute rebalance transaction.');
    if (!this.bitforgeContract) {
      this.logger.error('BitForge contract is not initialized for rebalance.');
      throw new ApiException('BitForge contract not initialized. Please check configuration.', HttpStatus.INTERNAL_SERVER_ERROR, 'BITFORGE_CONTRACT_NOT_INIT');
    }
    try {
      const adminAddress = this.configService.get<string>('ADMIN_ACCOUNT_ADDRESS');
      this.logger.debug(`Using admin account: ${adminAddress} for rebalance.`);
      const account = this.getAccount(adminAddress); // getAccount logs internally

      this.logger.debug('Executing StarkNet transaction', { contract: this.bitforgeContract.address, entrypoint: 'rebalance' });
      const { transaction_hash } = await account.execute({
        contractAddress: this.bitforgeContract.address,
        entrypoint: 'rebalance',
        calldata: CallData.compile({}),
      });
      this.logger.log(`Rebalance transaction successful: ${transaction_hash}`);
      return transaction_hash;
    } catch (error) {
      this.logger.error(`Error executing rebalance transaction: ${error.message}`, error.stack);
      throw new ApiException(`StarkNet rebalance transaction failed: ${error.message}`, HttpStatus.SERVICE_UNAVAILABLE, 'STARKNET_REBALANCE_EXECUTION_ERROR');
    }
  }
}
