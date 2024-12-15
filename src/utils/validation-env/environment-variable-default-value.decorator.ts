import { DEFAULT_KEY } from './constants.js';

export function EnvironmentVariableDefaultValue(
  defaultValue: unknown,
): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    const defaults = Reflect.getMetadata(DEFAULT_KEY, target) || {};
    defaults[String(propertyKey)] = defaultValue;
    Reflect.defineMetadata(DEFAULT_KEY, defaults, target);
  };
}
