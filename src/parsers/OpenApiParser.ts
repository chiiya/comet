import { Parser } from '../types/Parser';
import { OpenAPISpec } from '../types/OpenApi';

const parser = require('swagger-parser');

export default class OpenApiParser implements Parser {
  async execute(path: string): Promise<OpenAPISpec> {
    return await parser.bundle(path);
  }
}
