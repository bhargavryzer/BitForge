import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { YieldService } from './yield.service';
import { DepositDto } from '../../dto/deposit.dto';
import { WithdrawDto } from '../../dto/withdraw.dto';

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
  @ApiOperation({ summary: 'Deposit BTC into the platform' })
  async deposit(@Body() depositDto: DepositDto) {
    return this.yieldService.deposit(depositDto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw BTC from the platform' })
  async withdraw(@Body() withdrawDto: WithdrawDto) {
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
