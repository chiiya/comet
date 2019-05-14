/**
 * Taken with some modifications from https://github.com/Rebilly/ReDoc, license:

 The MIT License (MIT)

 Copyright (c) 2015-present, Rebilly, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import { OpenAPIRef, OpenApiSpec, Referenced } from '../types/open-api';
import JsonPointer from './utils/JsonPointer';
import { MergedOpenAPISchema } from './transformers/SchemaTransformer';

/**
 * Helper class to keep track of visited references to avoid
 * endless recursion because of circular refs
 */
class RefCounter {
  protected counter: {[key:string]: number} = {};

  visit(ref: string): void {
    this.counter[ref] = this.counter[ref] ? this.counter[ref] + 1 : 1;
  }

  exit(ref: string): void {
    this.counter[ref] = this.counter[ref] && this.counter[ref] - 1;
  }

  visited(ref: string): boolean {
    return !!this.counter[ref];
  }
}

export default class Specification {
  private refCounter: RefCounter;
  public entity: OpenApiSpec;

  constructor(spec: OpenApiSpec) {
    this.refCounter = new RefCounter();
    this.entity = spec;
  }

  /**
   * Resolve given reference object or return as is if it is not a reference
   * @param obj object to dereference
   * @param forceCircular whether to dereference even if it is circular ref
   */
  public deref<T extends object>(obj: OpenAPIRef | T, forceCircular: boolean = false): T {
    if (this.isRef(obj)) {
      const resolved = this.byRef<T>(obj.$ref)!;
      const visited = this.refCounter.visited(obj.$ref);
      this.refCounter.visit(obj.$ref);
      if (visited && !forceCircular) {
        // circular reference detected
        // tslint:disable-next-line
        return Object.assign({}, resolved, { 'x-circular-ref': true });
      }
      // Dereference again in case one more $ref is here
      if (this.isRef(resolved)) {
        const res = this.deref(resolved);
        this.exitRef(resolved);
        return res;
      }
      return resolved;
    }
    return obj;
  }

  /**
   * Checks whether an object is an OpenAPI reference (contains $ref property)
   */
  isRef(obj: any): obj is OpenAPIRef {
    if (!obj) {
      return false;
    }
    return obj.$ref !== undefined && obj.$ref !== null;
  }

  /**
   * Get spec part by JsonPointer ($ref)
   */
  byRef<T extends any = any>(ref: string): T | undefined {
    let res;
    let reference = ref;
    if (!this.entity) {
      return;
    }
    if (reference.charAt(0) !== '#') {
      reference = `#${reference}`;
    }
    reference = decodeURIComponent(reference);
    try {
      res = JsonPointer.get(this.entity, reference);
    } catch (e) {
      // do nothing
    }
    return res || {};
  }

  exitRef<T>(ref: Referenced<T>) {
    if (!this.isRef(ref)) {
      return;
    }
    this.refCounter.exit(ref.$ref);
  }

  exitParents(schema: MergedOpenAPISchema) {
    for (const parent$ref of schema.parentRefs || []) {
      this.exitRef({ $ref: parent$ref });
    }
  }
}
