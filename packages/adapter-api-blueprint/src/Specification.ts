import { ApiBlueprintAst, ApiBlueprintSpec } from '../types/blueprint';
import { Dict } from '@comet-cli/types';
import MetadataResolver from './resolvers/MetadataResolver';

export default class Specification {
  public entity: ApiBlueprintSpec;
  public ast: ApiBlueprintAst;
  public metadata: Dict<string>;

  constructor(spec: ApiBlueprintSpec) {
    this.entity = spec;
    this.ast = this.entity.ast;
    this.metadata = MetadataResolver.execute(this);
  }
}
