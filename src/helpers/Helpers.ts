const { execSync } = require('child_process');

export const displayHelp = (command: string | undefined) => {
  execSync(`comet ${command} --help`, { stdio: [0, 1, 2] });
};
