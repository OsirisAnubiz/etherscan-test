import { registerAs } from '@nestjs/config';

import { Type } from 'class-transformer';
import { Min } from 'class-validator';
import { Max } from 'class-validator';
import { IsInt } from 'class-validator';

import { EnvironmentVariableName } from '@utils/validation-env';
import { EnvironmentVariableDefaultValue } from '@utils/validation-env';
import { validateEnv } from '@utils/validation-env';

export interface ServiceConfig {
  port: number;
}

class ServiceEnvConfig {
  @Max(65535)
  @Min(1)
  @IsInt()
  @Type(() => Number)
  @EnvironmentVariableName('PORT')
  @EnvironmentVariableDefaultValue(3000)
  port: number;
}

export const serviceConfig = registerAs(
  'service',
  (): ServiceConfig => validateEnv(ServiceEnvConfig),
);
