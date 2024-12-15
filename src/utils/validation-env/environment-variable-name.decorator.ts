import 'reflect-metadata';

import { ENV_KEY } from './constants.js';

export function EnvironmentVariableName(envName: string): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const envs = Reflect.getMetadata(ENV_KEY, target) || {};

    envs[propertyKey] = envName;
    Reflect.defineMetadata(ENV_KEY, envs, target);
  };
}
