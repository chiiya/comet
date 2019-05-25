interface Key {
  readonly [key: string]: Key | CommandConfig;
}

export interface Config {
  [key: string]: any;
}

export interface CommandConfig {
  readonly adapter: string;
  readonly plugins: string[];
}

export interface ApiBlueprintAdapterConfig {
  ungroup_root?: boolean;
}

export interface AdapterConfig {
  'api-blueprint': ApiBlueprintAdapterConfig;
  [key: string]: any;
}

export interface PostmanPluginConfig {
  output?: string;
  group_by?: 'resources' | 'tags' | 'trie';
  flatten?: boolean;
}

export interface JsonSchemaPluginConfig {
  output?: string;
}

export interface TestLaravelPluginConfig {
  output?: string;
  base_url?: string;
}

export interface DocumentationPluginConfig {
  output?: string;
  group_by?: 'resources' | 'tags' | 'trie';
  flatten?: boolean;
  template?: string;
  css?: string;
  data?: {
    title?: string;
    description?: string;
    asset_src?: string;
  };
}

export interface PluginConfig {
  'postman': PostmanPluginConfig;
  'json-schemas': JsonSchemaPluginConfig;
  'tests-laravel': TestLaravelPluginConfig;
  'documentation': DocumentationPluginConfig;
  [key: string]: any;
}

export interface CometConfig {
  readonly default : CommandConfig;
  readonly commands: Key;
  readonly adapters: AdapterConfig;
  readonly plugins: PluginConfig;
}

export type ConfigValue = string | string[];
