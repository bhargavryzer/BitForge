import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'; // Added ApiResponse
import { YieldService } from './yield.service';
import { DepositDto } from '../../dto/deposit.dto';
import { WithdrawDto } from '../../dto/withdraw.dto';
import { PreparedTransaction } from '../../interfaces/starknet.interface'; // Added import

@ApiTags('yield')
@Controller('yield')
export class YieldController {
  constructor(private readonly yieldService: YieldService) {}

  @Get('apy')
  @ApiOperation({ summary: 'Get current APY for all strategies' })
  async getApy() {
    return this.yieldService.getCurrentApy();
  }

  @Get('allocation')
  @ApiOperation({ summary: 'Get current allocation across strategies' })
  async getAllocation() {
    return this.yieldService.getCurrentAllocation();
  }

  @Get('balance/:address')
  @ApiOperation({ summary: 'Get user balance' })
  @ApiParam({ name: 'address', description: 'User wallet address' })
  async getBalance(@Param('address') address: string) {
    return this.yieldService.getUserBalance(address);
  }

  @Get('total-deposits')
  @ApiOperation({ summary: 'Get total deposits in the platform' })
  async getTotalDeposits() {
    return this.yieldService.getTotalDeposits();
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Prepare a deposit transaction for frontend signing' }) // Summary updated
  @ApiResponse({ status: 201, description: 'Transaction prepared successfully.', type: PreparedTransaction }) // ApiResponse updated
  async deposit(@Body() depositDto: DepositDto): Promise<PreparedTransaction> { // Signature updated
    return this.yieldService.deposit(depositDto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Prepare a withdraw transaction for frontend signing' }) // Summary updated
  @ApiResponse({ status: 201, description: 'Transaction prepared successfully.', type: PreparedTransaction }) // ApiResponse updated
  async withdraw(@Body() withdrawDto: WithdrawDto): Promise<PreparedTransaction> { // Signature updated
    return this.yieldService.withdraw(withdrawDto);
  }

  @Post('rebalance')
  @ApiOperation({ summary: 'Trigger rebalance of funds across strategies' })
  async rebalance() {
    return this.yieldService.rebalance();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get yield history' })
  @ApiQuery({ name: 'address', required: false, description: 'Filter by user address' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back' })
  async getHistory(
    @Query('address') address?: string,
    @Query('days') days?: number,
  ) {
    return this.yieldService.getYieldHistory(address, days || 30);
  }
}
