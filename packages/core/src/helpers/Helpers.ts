const parse = require('@iarna/toml/parse-string');

/**
 * Parse a TOML file into a javascript object.
 * @param path
 * @param content
 */
export const parseToml = (path: string, content: string): object | null => {
  try {
    return parse(content);
  } catch (error) {
    // More readable error message
    error.message = `TOML Error in ${path}:\n${error.message}`;
    throw error;
  }
};
