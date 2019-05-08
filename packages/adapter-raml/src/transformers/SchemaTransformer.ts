/* tslint:disable:no-parameter-reassignment */
import {
  ArrayTypeDeclaration,
  BooleanTypeDeclaration,
  NumberTypeDeclaration,
  ObjectTypeDeclaration,
  StringTypeDeclaration,
  TypeDeclaration,
  DateTimeTypeDeclaration,
  FileTypeDeclaration,
} from 'raml-1-parser/dist/parser/artifacts/raml10parserapi';
import { Schema } from '@comet-cli/types';
import * as constants from 'ramldt2jsonschema/src/constants';
const raml2json = require('ramldt2jsonschema');
const utils = require('ramldt2jsonschema/src/utils');

export type MergedTypeDeclaration = TypeDeclaration
  & ArrayTypeDeclaration
  & ObjectTypeDeclaration
  & StringTypeDeclaration
  & BooleanTypeDeclaration
  & NumberTypeDeclaration
  & DateTimeTypeDeclaration
  & FileTypeDeclaration;

export default class SchemaTransformer {
  public static execute(type: MergedTypeDeclaration): Schema {
    const schema: Schema = {};
    schema.title = type.displayName();
    schema.default = type.default();
    if (type.hasOwnProperty('enum')) {
      schema.enum = type.enum();
    }
    this.transformType(schema, type.type(), type.format());
    console.log(schema);
    return schema;
  }

  protected static transformType(schema: Schema, type: string[], format: string): void {
    const transformed = [];
    for (const item of type) {
      switch (item) {
        case 'date-only':
          transformed.push('string');
          schema.pattern = constants.dateOnlyPattern;
          break;
        case 'time-only':
          transformed.push('string');
          schema.pattern = constants.timeOnlyPattern;
          break;
        case 'datetime-only':
          transformed.push('string');
          schema.pattern = constants.dateTimeOnlyPattern;
          break;
        case 'datetime':
          transformed.push('string');
          if (format === undefined || format.toLowerCase() === constants.RFC3339) {
            schema.pattern = constants.RFC3339DatetimePattern;
          } else if (format.toLowerCase() === constants.RFC2616) {
            schema.pattern = constants.RFC2616DatetimePattern;
          }
          break;
        case 'union':
          // If union of arrays
          // if (Array.isArray(data.anyOf) && data.anyOf[0].type === 'array') {
          //   const items = data.anyOf.map(e => e.items);
          //   data.items = { anyOf: [] };
          //   data.items.anyOf = items;
          //   data['type'] = 'array';
          //   delete data.anyOf;
          // } else {
          //   data['type'] = 'object';
          // }
          transformed.push('object');
          break;
        case 'nil':
          transformed.push('null');
          break;
        case 'file':
          transformed.push('string');
          break;
        default:
          transformed.push(item);
      }
    }
    // console.log(transformed);
    schema.type = [...new Set(transformed)];
  }

  // /**
  //  * Call `schemaForm` for each element of array.
  //  *
  //  * @param  {Array} arr
  //  * @param  {Array} reqStack - Stack of required properties.
  //  * @returns  {Array}
  //  */
  // protected static processArray(arr, reqStack) {
  //   const accum = [];
  //   arr.forEach((el) => {
  //     accum.push(this.schemaForm(el, reqStack, undefined));
  //   });
  //   return accum;
  // }
  //
  // /**
  //  * Change RAML pattern properties to JSON patternProperties.
  //  *
  //  * @param  {Object} data - the library fragment to convert
  //  * @returns  {Object}
  //  */
  // protected static convertPatternProperties (data) {
  //   Object.keys(data.properties).map((key) => {
  //     if (/^\/.*\/$/.test(key)) {
  //       data.patternProperties = data.patternProperties || {};
  //       const stringRegex = key.slice(1, -1);
  //       data.patternProperties[stringRegex] = data.properties[key];
  //       delete data.properties[key];
  //     }
  //   });
  //   return data;
  // }
  //
  // /**
  //  * Call `schemaForm` for all nested objects.
  //  *
  //  * @param  {Object} data
  //  * @param  {Array} reqStack - Stack of required properties.
  //  * @returns  {Object}
  //  */
  // protected static processNested (data, reqStack) {
  //   const updateWith = {};
  //   for (const key in data) {
  //     const val = data[key];
  //
  //     if (val instanceof Array) {
  //       updateWith[key] = this.processArray(val, reqStack);
  //       continue;
  //     }
  //
  //     if (val instanceof Object) {
  //       updateWith[key] = this.schemaForm(val, reqStack, key);
  //       continue;
  //     }
  //   }
  //   return updateWith;
  // }
  //
  // /**
  //  * Convert canonical form of RAML type to valid JSON schema.
  //  *
  //  * @param  {Object} data - Data to be converted.
  //  * @param  {Array} reqStack - Stack of required properties.
  //  * @param  {string} [prop] - Property name nested objects of which are processed.
  //  * @returns  {Object}
  //  */
  // protected static schemaForm (data, reqStack = [], prop = undefined) {
  //   if (!(data instanceof Object)) {
  //     return data;
  //   }
  //   const lastEl = reqStack[reqStack.length - 1];
  //   if (data.type && data.required !== false && lastEl && prop) {
  //     if (lastEl.props.indexOf(prop) > -1 && (prop[0] + prop[prop.length - 1]) !== '//') {
  //       lastEl.reqs.push(prop);
  //     }
  //   }
  //   delete data.required;
  //   const isObj = data.type === 'object';
  //   if (isObj) {
  //     reqStack.push({
  //       reqs: [],
  //       props: Object.keys(data.properties || {}),
  //     });
  //   }
  //
  //   const updateWith = this.processNested(data, reqStack);
  //
  //   data = utils.updateObjWith(data, updateWith);
  //   if (isObj) {
  //     let reqs = reqStack.pop().reqs;
  //     // Strip duplicates from reqs
  //     reqs = reqs.filter((value, index, self) => {
  //       return self.indexOf(value) === index;
  //     });
  //     if (reqs.length > 0) {
  //       data.required = reqs;
  //     }
  //   }
  //
  //   if (data.type) {
  //     data = this.convertType(data);
  //     data = this.convertDateType(data);
  //   }
  //   if (data.displayName) {
  //     data = this.convertDisplayName(data);
  //   }
  //   if (data.properties) {
  //     this.convertPatternProperties(data);
  //   }
  //   return data;
  // }
}
