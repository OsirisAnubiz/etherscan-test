import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

import * as controllers from '../controllers';
import * as configs from '../configs';

import { GetMaxChangeBalancesUseCase } from '../use-cases';
import { EtherscanApiModule } from '../external-api';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: Object.values(configs)
    }),
    EtherscanApiModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<string>('etherscanApi.apiKey'),
        maxRequests: configService.get<number>('etherscanApi.maxRequests'),
        perMilliseconds: configService.get<number>(
          'etherscanApi.perMilliseconds',
        ),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: Object.values(controllers),
  providers: [GetMaxChangeBalancesUseCase],
})
export class EthereumModule {}
