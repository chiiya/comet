interface Key {
  readonly [key: string]: Key | CommandConfig;
}

interface CommandConfig {
  readonly parser: string;
  readonly decorators: string[];
  readonly factories: string[];
}

export interface CometConfig {
  readonly default : CommandConfig;
  readonly commands: Key | CommandConfig;
}

export type ConfigValue = string | string[];
