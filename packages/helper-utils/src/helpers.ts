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
    .replace(/(\/?{[^\/]+}(?:\/$)?)/g, '')
    .replace(/\//g, '-');
  if (isSingleResourceOperation) {
    name += '-entity';
  }
  return name;
};

/**
 * Join url partials
 * Based on https://github.com/jfromaniello/url-join
 * @param partials
 */
export const joinUrls = (partials: string[]): string => {
  const result: string[] = [];

  // If the first part is a plain protocol, we combine it with the next part.
  if (partials[0].match(/^[^/:]+:\/*$/) && partials.length > 1) {
    const first = partials.shift();
    partials[0] = first + partials[0];
  }

  // There must be two or three slashes in the file protocol, two slashes in anything else.
  if (partials[0].match(/^file:\/\/\//)) {
    partials[0] = partials[0].replace(/^([^/:]+):\/*/, '$1:///');
  } else {
    partials[0] = partials[0].replace(/^([^/:]+):\/*/, '$1://');
  }

  for (let i = 0; i < partials.length; i += 1) {
    let partial = partials[i];
    if (partial === '') {
      continue;
    }
    if (i > 0) {
      // Removing the starting slashes for each component but the first.
      partial = partial.replace(/^[\/]+/, '');
    }

    if (i < partials.length - 1) {
      // Removing the ending slashes for each component but the last.
      partial = partial.replace(/[\/]+$/, '');
    } else {
      // For the last component we will combine multiple slashes to a single one.
      partial = partial.replace(/[\/]+$/, '/');
    }

    result.push(partial);
  }

  let url = result.join('/');
  // Each input component is now separated by a single slash except the possible first plain protocol part.
  // remove trailing slash before parameters or hash
  url = url.replace(/\/(\?|&|#[^!])/g, '$1');
  // replace ? in parameters with &
  const parts = url.split('?');
  url = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');

  return url;
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
