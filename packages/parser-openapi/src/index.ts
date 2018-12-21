import { Parser, OpenApiSpec } from '@comet-cli/types';

const parser = require('swagger-parser');

export default class OpenApiParser implements Parser {
  async execute(path: string): Promise<OpenApiSpec> {
    return await parser.bundle(path);
  }
}
