interface Key {
  readonly [key: string]: Key | CommandConfig;
}

export interface CommandConfig {
  readonly adapter: string;
  readonly plugins: string[];
  readonly [key: string]: any;
}

export interface CometConfig {
  readonly default : CommandConfig;
  readonly commands: Key;
}

export type ConfigValue = string | string[];
