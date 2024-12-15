import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as configs from './configs';

import { EthereumModule } from './contexts';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: Object.values(configs),
    }),
    EthereumModule,
  ],
})
export class AppModule {}
