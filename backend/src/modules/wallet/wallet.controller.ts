import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('nonce/:address')
  @ApiOperation({ summary: 'Get nonce for a wallet address' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  async getNonce(@Param('address') address: string) {
    return this.walletService.getNonce(address);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect wallet to the platform' })
  async connect(@Body() connectDto: { address: string; signature: string }) {
    return this.walletService.connectWallet(connectDto.address, connectDto.signature);
  }

  @Get('allowance/:address')
  @ApiOperation({ summary: 'Get BTC allowance for BitForge contract' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  async getAllowance(@Param('address') address: string) {
    return this.walletService.getAllowance(address);
  }

  @Post('approve')
  @ApiOperation({ summary: 'Approve BitForge contract to spend BTC' })
  async approve(@Body() approveDto: { address: string; amount: string }) {
    return this.walletService.approve(approveDto.address, approveDto.amount);
  }

  @Get('transactions/:address')
  @ApiOperation({ summary: 'Get transaction history for a wallet' })
  @ApiParam({ name: 'address', description: 'Wallet address' })
  async getTransactions(@Param('address') address: string) {
    return this.walletService.getTransactionHistory(address);
  }
}
