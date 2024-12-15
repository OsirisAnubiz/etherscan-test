import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ENV_KEY } from './constants.js';
import { DEFAULT_KEY } from './constants.js';

export const validateEnv = <T>(configClass: new () => T): T => {
  const configInstance = {};

  const envs = Reflect.getMetadata(ENV_KEY, configClass.prototype) || {};
  const defaults =
    Reflect.getMetadata(DEFAULT_KEY, configClass.prototype) || {};

  for (const [key, envName] of Object.entries(envs)) {
    const envValue = process.env[envName as string];
    configInstance[key] = envValue !== undefined ? envValue : defaults[key];
  }

  let validatedInstance;

  try {
    validatedInstance = plainToInstance(configClass, configInstance);
  } catch (error) {
    const message = `Error transforming envs to instance: ${(error as Error).message}`;
    throw new Error(message);
  }

  const validationErrors = validateSync(validatedInstance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (validationErrors.length > 0) {
    const errorMessages = validationErrors.map(
      (error) =>
        `Invalid env: ${envs[error.property]} (value = ${error.value}, jsType = ${typeof error.value})`,
    );
    const messages = errorMessages.join('; ');
    throw new Error(messages);
  }

  return validatedInstance;
};
