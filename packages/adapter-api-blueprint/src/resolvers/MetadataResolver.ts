import Specification from '../Specification';
import { Dict } from '@comet-cli/types';

export default class MetadataResolver {
  /**
   * Parse metadata from an API Blueprint AST into a dictionary.
   * @param spec
   */
  public static execute(spec: Specification): Dict<string> {
    const metadata = {};
    for (const item of spec.ast.metadata) {
      metadata[item.name] = item.value;
    }
    return metadata;
  }
}
