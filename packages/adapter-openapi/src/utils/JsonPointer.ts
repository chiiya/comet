/**
 * Taken from https://github.com/Rebilly/ReDoc, license:

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

const jsonPointer = require('json-pointer');

const origParse = jsonPointer.parse;
const lib = jsonPointer;

/**
 * Wrapper for JsonPointer. Provides common operations
 */

export class JsonPointer {
  /**
   * returns last JsonPointer token
   * if level > 1 returns levels last (second last/third last)
   * @example
   * // returns subpath
   * JsonPointerHelper.baseName('/path/0/subpath')
   * // returns foo
   * JsonPointerHelper.baseName('/path/foo/subpath', 2)
   */
  static baseName(pointer: string, level = 1) {
    const tokens = JsonPointer.parse(pointer);
    return tokens[tokens.length - level];
  }

  /**
   * returns dirname of pointer
   * if level > 1 returns corresponding dirname in the hierarchy
   * @example
   * // returns /path/0
   * JsonPointerHelper.dirName('/path/0/subpath')
   * // returns /path
   * JsonPointerHelper.dirName('/path/foo/subpath', 2)
   */
  static dirName(pointer: string, level = 1) {
    const tokens = JsonPointer.parse(pointer);
    return jsonPointer.compile(tokens.slice(0, tokens.length - level));
  }

  /**
   * returns relative path tokens
   * @example
   * // returns ['subpath']
   * JsonPointerHelper.relative('/path/0', '/path/0/subpath')
   * // returns ['foo', 'subpath']
   * JsonPointerHelper.relative('/path', '/path/foo/subpath')
   */
  static relative(from: string, to: string): string[] {
    const fromTokens = JsonPointer.parse(from);
    const toTokens = JsonPointer.parse(to);
    return toTokens.slice(fromTokens.length);
  }

  /**
   * overridden JsonPointer original parse to take care of prefixing '#' symbol
   * that is not valid JsonPointer
   */
  static parse(pointer: string) {
    let ptr = pointer;
    if (ptr.charAt(0) === '#') {
      ptr = ptr.substring(1);
    }
    return origParse(ptr);
  }

  static get(object: object, pointer: string) {
    return jsonPointer.get(object, pointer);
  }
}
lib.parse = JsonPointer.parse;
Object.assign(JsonPointer, lib);
export default JsonPointer;
