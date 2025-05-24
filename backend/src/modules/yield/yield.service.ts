import { Injectable, HttpStatus, LoggerService as NestLoggerService } from '@nestjs/common';
import { StarknetService } from '../../services/starknet.service';
import { DepositDto } from '../../dto/deposit.dto';
import { CustomLoggerService } from '../../logger/logger.service';
import { WithdrawDto } from '../../dto/withdraw.dto';
import { PreparedTransaction } from '../../interfaces/starknet.interface';
import { ApiException } from '../../exceptions/api.exception';

@Injectable()
export class YieldService {
  private readonly logger: CustomLoggerService;

  constructor(
    private readonly starknetService: StarknetService,
    logger: CustomLoggerService, // Injected logger
  ) {
    this.logger = logger.setContext(YieldService.name);
    this.logger.log('YieldService instantiated');
  }

  async getCurrentApy() {
    this.logger.debug('Attempting to get current APY.');
    try {
      this.logger.debug('Fetching individual strategy APYs from StarknetService.');
      const vesuApy = await this.starknetService.getVesuApy();
      const babylonApy = await this.starknetService.getBabylonApy();
      const ekuboApy = await this.starknetService.getEkuboApy();
      this.logger.debug('Individual strategy APYs fetched.', { vesuApy, babylonApy, ekuboApy });

      this.logger.debug('Fetching current allocation.');
      const allocation = await this.getCurrentAllocation(); // Already logs internally
      this.logger.debug('Current allocation fetched.', { allocation });
      
      const vesuWeight = typeof allocation.vesu === 'number' ? allocation.vesu / 100 : 0;
      const babylonWeight = typeof allocation.babylon === 'number' ? allocation.babylon / 100 : 0;
      const ekuboWeight = typeof allocation.ekubo === 'number' ? allocation.ekubo / 100 : 0;

      const totalApy = (vesuApy * vesuWeight) + (babylonApy * babylonWeight) + (ekuboApy * ekuboWeight);
      this.logger.log('Current APY calculated successfully.', { totalApy, strategies: { vesu: vesuApy, babylon: babylonApy, ekubo: ekuboApy } });
      
      return {
        total: totalApy,
        strategies: {
          vesu: vesuApy,
          babylon: babylonApy,
          ekubo: ekuboApy,
        },
      };
    } catch (error) {
      this.logger.error(`Error calculating current APY in YieldService: ${error.message}`, error.stack);
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException('Failed to calculate current APY.', HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_APY_CALCULATION_ERROR');
    }
  }

  async getCurrentAllocation() {
    this.logger.debug('Attempting to get current allocation from StarknetService.');
    try {
      const allocation = await this.starknetService.getAllocation();
      const currentAllocation = {
        vesu: allocation[0] / 100,
        babylon: allocation[1] / 100,
        ekubo: allocation[2] / 100,
      };
      this.logger.debug('Current allocation processed.', { currentAllocation });
      return currentAllocation;
    } catch (error) {
      this.logger.error(`Error getting current allocation in YieldService: ${error.message}`, error.stack);
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException('Failed to get current allocation.', HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_ALLOCATION_ERROR');
    }
  }

  async getUserBalance(address: string) {
    this.logger.debug(`Attempting to get user balance for address: ${address}`);
    try {
      const balance = await this.starknetService.getUserBalance(address);
      const userBalance = {
        address,
        balance: balance.toString(),
        balanceFormatted: this.formatBtcAmount(balance),
      };
      this.logger.debug(`User balance for ${address} processed.`, { userBalance });
      return userBalance;
    } catch (error) {
      this.logger.error(`Error getting user balance for ${address} in YieldService: ${error.message}`, error.stack);
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(`Failed to get user balance for ${address}.`, HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_USER_BALANCE_ERROR');
    }
  }

  async getTotalDeposits() {
    this.logger.debug('Attempting to get total deposits from StarknetService.');
    try {
      const totalDeposits = await this.starknetService.getTotalDeposits();
      const result = {
        total: totalDeposits.toString(),
        totalFormatted: this.formatBtcAmount(totalDeposits),
      };
      this.logger.debug('Total deposits processed.', { result });
      return result;
    } catch (error) {
      this.logger.error(`Error getting total deposits in YieldService: ${error.message}`, error.stack);
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException('Failed to get total deposits.', HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_TOTAL_DEPOSITS_ERROR');
    }
  }

  async deposit(depositDto: DepositDto): Promise<PreparedTransaction> {
    this.logger.log('Attempting to prepare deposit transaction.', { address: depositDto.address, amount: depositDto.amount });
    try {
      const { address, amount } = depositDto;
      const amountInWei = BigInt(amount) * BigInt(10 ** 8);
      this.logger.debug('Calling StarknetService for deposit preparation.', { address, amountInWei: amountInWei.toString() });
      const preparedTx = await this.starknetService.deposit(address, amountInWei);
      this.logger.log('Deposit transaction prepared successfully.', { preparedTx });
      return preparedTx;
    } catch (error) {
      this.logger.error(`Error preparing deposit in YieldService: ${error.message}`, error.stack, { depositDto });
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException('Failed to prepare deposit transaction.', HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_DEPOSIT_PREPARATION_ERROR');
    }
  }

  async withdraw(withdrawDto: WithdrawDto): Promise<PreparedTransaction> {
    this.logger.log('Attempting to prepare withdraw transaction.', { address: withdrawDto.address, amount: withdrawDto.amount });
    try {
      const { address, amount } = withdrawDto;
      const amountInWei = BigInt(amount) * BigInt(10 ** 8);
      this.logger.debug('Calling StarknetService for withdraw preparation.', { address, amountInWei: amountInWei.toString() });
      const preparedTx = await this.starknetService.withdraw(address, amountInWei);
      this.logger.log('Withdraw transaction prepared successfully.', { preparedTx });
      return preparedTx;
    } catch (error) {
      this.logger.error(`Error preparing withdraw in YieldService: ${error.message}`, error.stack, { withdrawDto });
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException('Failed to prepare withdraw transaction.', HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_WITHDRAW_PREPARATION_ERROR');
    }
  }

  async rebalance() {
    this.logger.log('Attempting to trigger rebalance.');
    try {
      this.logger.debug('Calling StarknetService to execute rebalance.');
      const txHash = await this.starknetService.rebalance();
      this.logger.debug('Rebalance transaction hash received.', { txHash });
      this.logger.debug('Fetching new allocation post-rebalance.');
      const newAllocation = await this.getCurrentAllocation();
      this.logger.log('Rebalance process completed successfully.', { txHash, newAllocation });
      return {
        success: true,
        txHash,
        allocation: newAllocation,
      };
    } catch (error) {
      this.logger.error(`Error during rebalance in YieldService: ${error.message}`, error.stack);
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException('Failed to rebalance.', HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_REBALANCE_ERROR');
    }
  }

  async getYieldHistory(address?: string, days: number = 30) {
    this.logger.debug(`Getting yield history for address: ${address || 'platform'}, days: ${days}`);
    try {
      const today = new Date();
      const history = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Generate random APY between 18% and 22%
        const apy = 18 + Math.random() * 4;
        
        history.push({
          date: date.toISOString().split('T')[0],
          apy: apy.toFixed(2),
        });
      }
      
      return {
        address: address || 'platform',
        days,
        history,
      };
    } catch (error) {
      this.logger.error(`Error getting yield history (mock data): ${error.message}`, error.stack, { address, days });
      throw new ApiException('Failed to get yield history.', HttpStatus.INTERNAL_SERVER_ERROR, 'YIELD_HISTORY_ERROR');
    }
  }

  private formatBtcAmount(amount: BigInt): string {
    // Convert from satoshis to BTC (8 decimal places)
    const btcAmount = Number(amount) / 10 ** 8;
    return btcAmount.toFixed(8);
  }
}
