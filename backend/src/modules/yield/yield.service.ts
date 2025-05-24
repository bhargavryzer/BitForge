import { Injectable } from '@nestjs/common';
import { StarknetService } from '../../services/starknet.service';
import { DepositDto } from '../../dto/deposit.dto';
import { WithdrawDto } from '../../dto/withdraw.dto';

@Injectable()
export class YieldService {
  constructor(private readonly starknetService: StarknetService) {}

  async getCurrentApy() {
    try {
      // Get APY from each strategy
      const vesuApy = await this.starknetService.getVesuApy();
      const babylonApy = await this.starknetService.getBabylonApy();
      const ekuboApy = await this.starknetService.getEkuboApy();
      
      // Get current allocation
      const allocation = await this.getCurrentAllocation();
      
      // Calculate weighted average APY
      const totalApy = (
        (vesuApy * allocation.vesu / 100) +
        (babylonApy * allocation.babylon / 100) +
        (ekuboApy * allocation.ekubo / 100)
      );
      
      return {
        total: totalApy,
        strategies: {
          vesu: vesuApy,
          babylon: babylonApy,
          ekubo: ekuboApy,
        },
      };
    } catch (error) {
      console.error('Error getting APY:', error);
      throw new Error('Failed to get current APY');
    }
  }

  async getCurrentAllocation() {
    try {
      const allocation = await this.starknetService.getAllocation();
      
      return {
        vesu: allocation[0] / 100, // Convert basis points to percentage
        babylon: allocation[1] / 100,
        ekubo: allocation[2] / 100,
      };
    } catch (error) {
      console.error('Error getting allocation:', error);
      throw new Error('Failed to get current allocation');
    }
  }

  async getUserBalance(address: string) {
    try {
      const balance = await this.starknetService.getUserBalance(address);
      
      return {
        address,
        balance: balance.toString(),
        balanceFormatted: this.formatBtcAmount(balance),
      };
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw new Error('Failed to get user balance');
    }
  }

  async getTotalDeposits() {
    try {
      const totalDeposits = await this.starknetService.getTotalDeposits();
      
      return {
        total: totalDeposits.toString(),
        totalFormatted: this.formatBtcAmount(totalDeposits),
      };
    } catch (error) {
      console.error('Error getting total deposits:', error);
      throw new Error('Failed to get total deposits');
    }
  }

  async deposit(depositDto: DepositDto) {
    try {
      const { address, amount } = depositDto;
      
      // Convert amount to wei (satoshis for BTC)
      const amountInWei = BigInt(amount) * BigInt(10 ** 8);
      
      // Call deposit function on BitForge contract
      const txHash = await this.starknetService.deposit(address, amountInWei);
      
      return {
        success: true,
        txHash,
        address,
        amount,
      };
    } catch (error) {
      console.error('Error depositing:', error);
      throw new Error('Failed to deposit');
    }
  }

  async withdraw(withdrawDto: WithdrawDto) {
    try {
      const { address, amount } = withdrawDto;
      
      // Convert amount to wei (satoshis for BTC)
      const amountInWei = BigInt(amount) * BigInt(10 ** 8);
      
      // Call withdraw function on BitForge contract
      const txHash = await this.starknetService.withdraw(address, amountInWei);
      
      return {
        success: true,
        txHash,
        address,
        amount,
      };
    } catch (error) {
      console.error('Error withdrawing:', error);
      throw new Error('Failed to withdraw');
    }
  }

  async rebalance() {
    try {
      // Call rebalance function on BitForge contract
      const txHash = await this.starknetService.rebalance();
      
      // Get new allocation after rebalance
      const newAllocation = await this.getCurrentAllocation();
      
      return {
        success: true,
        txHash,
        allocation: newAllocation,
      };
    } catch (error) {
      console.error('Error rebalancing:', error);
      throw new Error('Failed to rebalance');
    }
  }

  async getYieldHistory(address?: string, days: number = 30) {
    try {
      // In a real implementation, this would fetch historical yield data from a database
      // For simplicity, returning mock data
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
      console.error('Error getting yield history:', error);
      throw new Error('Failed to get yield history');
    }
  }

  private formatBtcAmount(amount: BigInt): string {
    // Convert from satoshis to BTC (8 decimal places)
    const btcAmount = Number(amount) / 10 ** 8;
    return btcAmount.toFixed(8);
  }
}
