import {
  ParserInterface,
  CommandConfig,
  LoggerInterface,
  ApiModel,
} from '@comet-cli/types';

const parser = require('swagger-parser');

export default class OpenApiParser implements ParserInterface {
  async execute(path: string, config: CommandConfig, logger: LoggerInterface): Promise<ApiModel> {
    try {
      const schema = await parser.dereference(path);
      schema.decorated = {};
      return schema;
    } catch (error) {
      // Provide a more helpful error message
      if (error.code === 'ENOENT') {
        error.message = `${path}: No such file or directory`;
      } else {
        error.message = `${path} is not a valid OpenAPI Schema. \n${error.message}`;
      }
      throw error;
    }
  }
}
