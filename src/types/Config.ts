export default interface Config {
  readonly [key: string]: Key | CommandConfig;
}

interface Key {
  readonly [key: string]: Key | CommandConfig;
}

interface CommandConfig {
  readonly parser: string;
  readonly decorators: string[];
  readonly factories: string[];
}
