/**
 * Identify api description language format
 * Taken with some modifications from https://github.com/apiaryio/deckardcain, license:

 The MIT License (MIT)

 Copyright (c) 2015 Apiary

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

export const API_BLUEPRINT_HEADER = /^[\uFEFF]?(((VERSION:( |\t)2)|(FORMAT:( |\t)(X-)?1A))\s*?([\n\r]{1,2}|$))/i;
export const API_BLUEPRINT_LISTITEM = /[-\*\+]\s+(response|request|attributes?)/i;
export const API_BLUEPRINT_DATA = /#+\s+data structures?\s*\n/i;

export const SWAGGER_JSON = /^[\uFEFF]?{[\s\S]*["']swagger["']\s*:\s*["']\d\.\d["'],?/i;
export const SWAGGER_YAML = /(?:^|\n)\s*swagger: ["']\d\.\d["']\n/i;

export const OPENAPI_JSON = /^[\uFEFF]?{[\s\S]*["']openapi["']\s*:\s*["']\d\.\d+.\d+["'],?/i;
export const OPENAPI_YAML = /^\s*(["']?)openapi\1\s*:\s*(["']?)\d\.\d+.\d+\2$/mi;

export const RAML_YAML = /(?:^|\n)\s*#%RAML \d\.\d\n/i;

/**
 * Identifies given source.
 * @param {string} source - The source code of API description file.
 * @returns {string|null} Media type of given file.
 */
export function identify(source: string): string {
  if (source.match(API_BLUEPRINT_HEADER)) {
    // There is 'FORMAT: 1A' present at the begining,
    // so we can say it is API Blueprint
    return 'text/vnd.apiblueprint';
  }

  if (source.match(SWAGGER_YAML)) {
    return 'application/swagger+yaml';
  }

  if (source.match(SWAGGER_JSON)) {
    return 'application/swagger+json';
  }

  if (source.match(RAML_YAML)) {
    return 'application/raml+yaml';
  }

  // see https://stackoverflow.com/questions/52541842/what-is-the-media-type-of-an-openapi-schema
  if (source.match(OPENAPI_YAML)) {
    return 'application/vnd.oai.openapi';
  }

  if (source.match(OPENAPI_JSON)) {
    return 'application/vnd.oai.openapi+json';
  }

  if (source.match(API_BLUEPRINT_LISTITEM) || source.match(API_BLUEPRINT_DATA)) {
    // There is something like '+ Response 200' in the document, which is
    // pretty distinctive for API Blueprint.
    return 'text/vnd.apiblueprint';
  }

  return null;
}

export default { identify };
