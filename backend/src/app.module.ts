import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YieldModule } from './modules/yield/yield.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { OracleModule } from './modules/oracle/oracle.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    YieldModule,
    WalletModule,
    OracleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
