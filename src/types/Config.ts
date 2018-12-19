export interface CometConfig {
  readonly [key: string]: Key | CommandConfig;
}

interface Key {
  readonly [key: string]: Key | CommandConfig;
}

export type ConfigValue = string | string[];

interface CommandConfig {
  readonly parser: string;
  readonly decorators: string[];
  readonly factories: string[];
}
