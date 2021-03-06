import {
  AdapterInterface,
  ApiModel,
  Config,
  LoggerInterface,
} from '@comet-cli/types';
import Parser from './Parser';
import InformationTransformer from './transformers/InformationTransformer';
import Specification from './Specification';
import AuthenticationTransformer from './transformers/AuthenticationTransformer';
import ResourceTransformer from './transformers/ResourceTransformer';

export default class OpenApiAdapter implements AdapterInterface {
  async execute(path: string, config: Config, logger: LoggerInterface): Promise<ApiModel> {
    // Parse input file
    try {
      const result = await Parser.load(path);
      const specification = new Specification(result);
      return {
        info: InformationTransformer.execute(specification),
        auth: AuthenticationTransformer.execute(specification),
        groups: [],
        resources: ResourceTransformer.execute(specification),
        securedBy: specification.entity.security || [],
      };
    } catch (error) {
      // Provide a more helpful error message
      if (error.code === 'ENOENT') {
        error.message = `${path}: No such file or directory`;
      } else if (error.name !== 'ParsingException') {
        error.message = `${path} is not a valid OpenAPI schema. \n${error.message}`;
      }
      throw error;
    }
  }

  public name(): string {
    return 'openapi';
  }
}
