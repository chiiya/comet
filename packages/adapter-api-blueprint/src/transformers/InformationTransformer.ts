import Specification from '../Specification';
import { Information } from '@comet-cli/types';
import ParsingException from '../ParsingException';
import * as get from 'lodash/get';

export default class InformationTransformer {
  /**
   * Parse basic information from AST and metadata.
   * @param spec
   */
  public static execute(spec: Specification): Information {
    const name = get(spec.ast, 'name');
    const host = spec.metadata['HOST'];
    const version = spec.metadata['VERSION'] || null;

    // Throw exception if required metadata is missing.
    if (name === undefined) {
      throw new ParsingException('No API name specified');
    }
    if (host === undefined) {
      throw new ParsingException('No host url specified');
    }

    const server = {
      uri: host,
    };

    return {
      version,
      name,
      description: get(spec.ast, 'description', null),
      servers: [server],
    };
  }
}
