import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { StarknetService } from '../../services/starknet.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, StarknetService],
  exports: [WalletService],
})
export class WalletModule {}
