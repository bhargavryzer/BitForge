import { Module } from '@nestjs/common';
import { OracleController } from './oracle.controller';
import { OracleService } from './oracle.service';
import { StarknetService } from '../../services/starknet.service';
import { PragmaService } from '../../services/pragma.service';

@Module({
  controllers: [OracleController],
  providers: [OracleService, StarknetService, PragmaService],
  exports: [OracleService],
})
export class OracleModule {}
