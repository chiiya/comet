const { execSync } = require('child_process');

const displayHelp = (command: string | undefined) => {
  execSync(`comet ${command} --help`, { stdio: [0, 1, 2] });
};

export default displayHelp;
