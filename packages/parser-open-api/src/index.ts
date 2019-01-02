import { Parser, OpenApiSpec } from '@comet-cli/types';

const parser = require('swagger-parser');

export default class OpenApiParser implements Parser {
  async execute(path: string): Promise<OpenApiSpec> {
    try {
      const schema = await parser.dereference(path);
      schema.decorated = {};
      return schema;
    } catch (error) {
      error.message = `${path} is not a valid OpenAPI Schema. \n${error.message}`;
      throw error;
    }
  }
}
