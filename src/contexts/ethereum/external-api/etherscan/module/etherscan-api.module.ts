import type { DynamicModule } from '@nestjs/common';
import type { Provider } from '@nestjs/common';

import type { EtherscanApiModuleAsyncOptions } from './etherscan-api.module.interfaces';
import type { EtherscanApiModuleOptions } from './etherscan-api.module.interfaces';
import type { EtherscanApiOptionsFactory } from './etherscan-api.module.interfaces';

import { Module } from '@nestjs/common';

import { EtherscanApiService } from '../services';
import { ETHERSCAN_API_MODULE_OPTIONS } from './etherscan-api.module.constants';

@Module({})
export class EtherscanApiModule {
  static register(options: EtherscanApiModuleOptions): DynamicModule {
    return {
      module: EtherscanApiModule,
      providers: [
        ...(options.providers || []),
        {
          provide: ETHERSCAN_API_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: EtherscanApiService,
          useValue: new EtherscanApiService(options),
        },
      ],
      exports: [EtherscanApiService],
    };
  }

  static registerAsync(options: EtherscanApiModuleAsyncOptions): DynamicModule {
    return {
      module: EtherscanApiModule,
      imports: [...(options.imports || [])],
      providers: [
        ...(options.providers || []),
        ...this.createAsyncProviders(options),
        {
          provide: EtherscanApiService,
          useFactory: (options: EtherscanApiModuleOptions) => {
            return new EtherscanApiService(options);
          },
          inject: [ETHERSCAN_API_MODULE_OPTIONS],
        },
      ],
      exports: [EtherscanApiService],
    };
  }

  private static createAsyncProviders(
    options: EtherscanApiModuleAsyncOptions,
  ): Array<Provider> {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass!,
        useClass: options.useClass!,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: EtherscanApiModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: ETHERSCAN_API_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: ETHERSCAN_API_MODULE_OPTIONS,
      useFactory: (
        optionsFactory: EtherscanApiOptionsFactory,
      ): EtherscanApiModuleOptions | Promise<EtherscanApiModuleOptions> =>
        optionsFactory.createEtherscanApiOptions(),
      inject: [options.useExisting! || options.useClass!],
    };
  }
}
