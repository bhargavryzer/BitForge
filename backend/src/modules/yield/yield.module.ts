import { Module } from '@nestjs/common';
import { YieldController } from './yield.controller';
import { YieldService } from './yield.service';
import { StarknetService } from '../../services/starknet.service';

@Module({
  controllers: [YieldController],
  providers: [YieldService, StarknetService],
  exports: [YieldService],
})
export class YieldModule {}
