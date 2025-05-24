import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YieldModule } from './modules/yield/yield.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { OracleModule } from './modules/oracle/oracle.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule, // Added LoggerModule
    YieldModule,
    WalletModule,
    OracleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
