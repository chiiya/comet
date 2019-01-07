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
