import type { ModuleMetadata } from '@nestjs/common';
import type { Type } from '@nestjs/common';
import type { InjectionToken } from '@nestjs/common';
import type { OptionalFactoryDependency } from '@nestjs/common';

export interface EtherscanApiModuleOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  maxRequests: number;
  perMilliseconds: number;
  apiKey: string;
}

export interface EtherscanApiOptionsFactory {
  createEtherscanApiOptions: () =>
    | EtherscanApiModuleOptions
    | Promise<EtherscanApiModuleOptions>;
}

export interface EtherscanApiModuleSyncOptions
  extends EtherscanApiModuleOptions {}

export interface EtherscanApiModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports' | 'providers'> {
  useExisting?: Type<EtherscanApiModuleOptions>;
  useClass?: Type<EtherscanApiModuleOptions>;
  useFactory?: (
    ...args: Array<any>
  ) => EtherscanApiModuleOptions | Promise<EtherscanApiModuleOptions>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}
