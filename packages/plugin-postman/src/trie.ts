import { NodeOptions, PostmanItem } from '../types';
import { Dict } from '@comet-cli/types';

export class Node {
  public path: string;
  public name: string | undefined;
  public description: string | undefined;
  public type: string;
  public requests: PostmanItem[];
  public requestCount: number;
  public children: Dict<Node>;

  constructor(options: NodeOptions) {
    this.path = options.path || '/';
    this.name = options.name;
    this.description = options.description;
    this.type = options.type || 'folder';
    this.requests = options.requests || [];
    this.requestCount = options.requestCount || 0;
    this.children = {};
  }

  addChildren(child: string, value: Node) {
    this.children[child] = value;
  }

  addRequest(request: PostmanItem) {
    this.requests.push(request);
  }
}

export class Trie {
  public root: Node;

  constructor(node: Node) {
    this.root = node;
  }
}
