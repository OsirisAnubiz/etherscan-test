import { registerAs } from '@nestjs/config';

import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator'
import { Min } from 'class-validator';

import { EnvironmentVariableName } from '@utils/validation-env';
import { validateEnv } from '@utils/validation-env';

import { EtherscanApiModuleOptions } from '../external-api';

class EtherscanApiEnvConfig {
  @IsString()
  @IsNotEmpty()
  @EnvironmentVariableName('ETHERSCAN_API_KEY')
  apiKey: string;

  @IsInt()
  @Type(() => Number)
  @EnvironmentVariableName('ETHERSCAN_MAX_REQUESTS')
  maxRequests: number;

  @IsInt()
  @Type(() => Number)
  @EnvironmentVariableName('ETHERSCAN_PER_MILLISECONDS')
  perMilliseconds: number;
}

export const etherscanApiConfig = registerAs(
  'etherscanApi',
  (): EtherscanApiModuleOptions => validateEnv(EtherscanApiEnvConfig),
);
