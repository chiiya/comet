/**
 * Transform a path into a human readable operation name
 * `GET countries/{country}/assets` -> `countries-assets-index.json`
 * `GET countries` -> `countries-index.json`
 * `GET countries/{id}` -> `countries-show.json`
 * `POST countries` -> `countries-store.json`
 * @param path
 * @param method
 */
export const getOperationName = (path: string, method: string): string  => {
  const parameterEndsPath = /(\/?{.+}\/?$)/g;
  let isSingleResourceOperation = false;
  if (parameterEndsPath.test(path)) {
    isSingleResourceOperation = true;
  }
  const base = getResourceName(path);
  let suffix;
  switch (method.toLowerCase()) {
    case 'get':
      if (isSingleResourceOperation) {
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
      suffix = method.toLowerCase();
  }

  return `${base}-${suffix}`;
};

export const getResourceName = (path: string): string => {
  const parameterEndsPath = /(\/?{.+}\/?$)/g;
  let isSingleResourceOperation = false;
  if (parameterEndsPath.test(path)) {
    isSingleResourceOperation = true;
  }
  let name = path
    .replace(/^\//, '')
    .replace(/(\/?{.+}(?:\/$)?)/g, '')
    .replace('/', '-');
  if (isSingleResourceOperation) {
    name += '-entity';
  }
  return name;
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
    .replace(/[\s+_\[/]/g, '-')      // Replace spaces, underscores, slashes and `[` with -
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

export const ucfirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Check whether a value (string) is a number.
 * @param str
 */
export const isNumber = (str: any): boolean => {
  return !isNaN(str) && !isNaN(parseFloat(str));
};

/**
 * Get a prettified operation name:
 * countries-index -> Countries - Index
 * @param path
 * @param method
 */
export const prettifyOperationName = (path: string, method: string): string => {
  const operationName = getOperationName(path, method);
  return operationName.split('-').map((part: string) => ucfirst(part)).join(' - ');
};
