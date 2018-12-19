const { execSync } = require('child_process');
const parse = require('@iarna/toml/parse-string');

export const displayHelp = (command: string | undefined) => {
  execSync(`comet ${command} --help`, { stdio: [0, 1, 2] });
};

export const parseToml = (path: string, content: string) => {
  try {
    return parse(content);
  } catch (error) {
    // More readable error message
    error.message = `TOML Error in ${path}:\n${error.message}`;
    throw error;
  }
};
