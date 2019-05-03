const path = require('path');

/**
 * Transform a path into a human readable operation name
 * `GET countries/{country}/assets` -> `countries-assets-index.json`
 * `GET countries` -> `countries-index.json`
 * `GET countries/{id}` -> `countries-show.json`
 * `POST countries` -> `countries-store.json`
 * @param apiPath
 * @param method
 */
export const getOperationName = (apiPath: string, method: string): string  => {
  const parameterEndsPath = /(\/?{.+}\/?$)/g;
  let isSingleResourceOperation = false;
  if (parameterEndsPath.test(apiPath) === true) {
    isSingleResourceOperation = true;
  }
  const base = apiPath
    .replace(/^\//, '')
    .replace(/(\/?{.+}(?:\/$)?)/g, '')
    .replace('/', '-');
  let suffix;
  switch (method) {
    case 'get':
      if (isSingleResourceOperation === true) {
        suffix = 'show';
      } else {
        suffix = 'index';
      }
      break;
    case 'post':
      suffix = 'store';
      break;
    case 'put':
    case 'patch':
      suffix = 'update';
      break;
    default:
      suffix = method;
  }

  return `${base}-${suffix}`;
};

/**
 * Transform any string into a slug:
 * `Find Pets TestCase` -> `find-pets-operation`
 * `filter[email]` -> `filter-email`
 * @param text
 */
export const slugify = (text: string): string => {
  return text
    .replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase() // camelCase to camel-case
    .toLowerCase()
    .replace(/[\s+_\[]/g, '-')      // Replace spaces, underscores and `[` with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Transform a string into camelCase:
 * `find-pets-operation` -> `findPetsOperation`
 * @param text
 * @param separator
 */
export const camelize = (text: string, separator: string = '-'): string => {
  const words: string[] = text.split(separator);
  const result: string[] = [words[0]];
  words.slice(1).forEach((word: string) => result.push(
    word.charAt(0).toUpperCase() + word.slice(1),
  ));
  return result.join('');
};

/**
 * Check whether a value (string) is a number.
 * @param str
 */
export const isNumber = (str: any): boolean => {
  return !isNaN(str) && !isNaN(parseFloat(str));
};
