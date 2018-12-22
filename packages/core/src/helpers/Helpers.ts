const { execSync } = require('child_process');
const parse = require('@iarna/toml/parse-string');

/**
 * Display the output of `comet ${command} --help`.
 * @param command
 */
export const displayHelp = (command: string | undefined): void => {
  execSync(`comet ${command} --help`, { stdio: [0, 1, 2] });
};

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
