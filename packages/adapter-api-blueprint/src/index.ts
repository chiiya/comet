import {
  AdapterInterface,
  ApiModel,
  LoggerInterface, SecurityRequirement,
} from '@comet-cli/types';
import Parser from './Parser';
import Specification from './Specification';
import AuthenticationTransformer from './transformers/AuthenticationTransformer';
import InformationTransformer from './transformers/InformationTransformer';
import ResourceGroupTransformer from './transformers/ResourceGroupTransformer';
import ResourceTransformer from './transformers/ResourceTransformer';
import { writeFile } from 'fs-extra';
import { ApiBlueprintAdapterConfig } from '@comet-cli/types/src/config/config';

export default class ApiBlueprintAdapter implements AdapterInterface {
  /**
   * Read an API Blueprint specification from `path`, and parse it into an api model.
   * @param path
   * @param config
   * @param logger
   */
  async execute(path: string, config: ApiBlueprintAdapterConfig, logger: LoggerInterface): Promise<ApiModel> {
    try {
      // Parse input file
      const result = await Parser.load(path, logger);
      await writeFile('./result-parsed.json', JSON.stringify(result, null, 2));
      const specification = new Specification(result);
      const auth = AuthenticationTransformer.execute(specification);
      const securedBy: SecurityRequirement[] = [];
      const spec = {
        info: InformationTransformer.execute(specification),
        auth: auth,
        groups: ResourceGroupTransformer.execute(specification, config, auth ? auth.default : undefined),
        resources: ResourceTransformer.transformFromDefaultGroup(
          specification,
          config,
          auth ? auth.default : undefined,
        ),
        securedBy: securedBy,
      };
      logger.succeed('API Blueprint model transformed');
      return spec;
    } catch (error) {
      // Provide a more helpful error message
      if (error.code === 'ENOENT') {
        error.message = `${path}: No such file or directory`;
      }
      throw error;
    }
  }

  public name(): string {
    return 'api-blueprint';
  }
}
