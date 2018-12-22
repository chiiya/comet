interface Key {
  readonly [key: string]: Key | CommandConfig;
}

interface CommandConfig {
  readonly parser: string;
  readonly decorators: string[];
  readonly factories: string[];
}

export interface CometConfig {
  readonly [key: string]: Key | CommandConfig;
}

export type ConfigValue = string | string[];
