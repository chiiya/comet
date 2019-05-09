## `@comet-cli/core`

This package contains the comet cli application

### Installation
Install the CLI application:
```bash
npm install --dev @comet-cli/core
# or with yarn:
yarn add --dev @comet-cli/core
```

### Usage

```bash
# Version
$ comet --version

@comet-cli/core/0.0.0 linux-x64 node-v11.3.0

# Help
$ comet --help

Core comet cli application

VERSION
  @comet-cli/core/0.0.0 linux-x64 node-v11.3.0

USAGE
  $ comet [COMMAND]

COMMANDS
  help  display help for comet
  make  Operations for creating different artifacts

# Create tests:
$ comet make:tests api.yaml

# Create documentation
$ comet make:documentation api.yaml

# Create valid JSON Schemas:
$ comet make:schemas api.yaml
$ comet make:schemas api.yaml -o=schemas/
```
