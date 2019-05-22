import { Dict } from '@comet-cli/types';
import { EnhancedOperation } from './operations';

export interface NodeOptions {
  path: string;
  name?: string;
  description?: string;
  operations?: EnhancedOperation[];
  operationCount?: number;
  type?: 'item' | 'group';
}

export class Node implements NodeOptions {
  public path: string;
  public name?: string;
  public description?: string;
  public type: 'item' | 'group';
  public operations: EnhancedOperation[];
  public operationCount: number;
  public children: Dict<Node>;

  constructor(options: NodeOptions) {
    this.path = options.path || '/';
    this.name = options.name;
    this.description = options.description;
    this.type = options.type || 'group';
    this.operations = options.operations || [];
    this.operationCount = options.operationCount || 0;
    this.children = {};
  }

  addChildren(child: string, value: Node) {
    this.children[child] = value;
  }

  addOperation(operation: EnhancedOperation) {
    this.operations.push(operation);
  }
}

export class Trie {
  public root: Node;

  constructor(node: Node) {
    this.root = node;
  }
}
