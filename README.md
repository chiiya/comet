☄️ Comet
=====

Automated testing and documentation for RESTful APIs.

# Usage
<!-- usage -->
```sh-session
$ npm install -g @chiiya/comet
$ comet COMMAND
running command...
$ comet (-v|--version|version)
comet/0.1.0 linux-x64 node-v11.3.0
$ comet --help [COMMAND]
USAGE
  $ comet COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`comet help [COMMAND]`](#comet-help-command)
* [`comet make [FILE]`](#comet-make-file)
* [`comet make:tests INPUT`](#comet-maketests-input)

## `comet help [COMMAND]`

display help for comet

```
USAGE
  $ comet help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.1.4/src/commands/help.ts)_

## `comet make [FILE]`

describe the command here

```
USAGE
  $ comet make

OPTIONS
  -h, --help
```

_See code: [src/commands/make.ts](https://github.com/chiiya/comet/blob/v0.1.0/src/commands/make.ts)_

## `comet make:tests INPUT`

Parse an API specification, and automatically generate integration tests

```
USAGE
  $ comet make:tests INPUT

ARGUMENTS
  INPUT  relative or absolute path to the input file (your API specification)

OPTIONS
  -h, --help  show CLI help

EXAMPLE
  $ comet make:tests api.json
```

_See code: [src/commands/make/tests.ts](https://github.com/chiiya/comet/blob/v0.1.0/src/commands/make/tests.ts)_
<!-- commandsstop -->