import { TestCase, TestSuite as ITestSuite } from '../types/tests';
import { CommandConfig, OpenApiSpec } from '@comet-cli/types';

export default class TestSuite implements ITestSuite {
  name: string;
  testCases: TestCase[];
  url: string;

  constructor(name: string, url: string) {
    this.name = name;
    this.testCases = [];
    this.url = url;
  }

  /**
   * Parse the API base URL from config or the specification.
   *
   * @param config
   * @param model
   *
   * @throws Error
   */
  public static parseUrl(config: CommandConfig, model: OpenApiSpec) {
    if (config.base_url) {
      return config.base_url;
    }
    if (model.servers && model.servers.length > 0) {
      return model.servers[0].url;
    }
    throw new Error(
      'No API base URL configuration found. Did you set a value for `base_url` in your config?',
    );
  }
}
