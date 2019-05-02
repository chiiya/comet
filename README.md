<p align="center"><img src="https://i.postimg.cc/1RYn00Tg/comet-logo.png" alt="Comet"></p>
<p align="center">Automated testing and documentation for RESTful APIs.</p>

## Usage
For usage, see the [core package](https://github.com/chiiya/comet/tree/master/packages/core).

## Setup
Comet is set up as a monorepo using lerna and yarn workspaces.

### Requirements
```bash
node # >=8.0.0
yarn # with workspaces enabled:
yarn config set workspaces-experimental true
```

### Installation
```bash
$ git clone https://github.com/chiiya/comet
$ cd comet
$ make bootstrap
```

### Configuration
Comet can be configured in many ways:
- `comet` key in your `package.json`
- `.cometrc` in JSON or YAML format
- `.cometrc.json`
- `.cometrc.yml`
- `.cometrc.toml`

The default configuration (in `.cometrc.toml`) looks like the following:

```toml
[default]
parser = "@comet-cli/parser-open-api"

[commands.make.schemas]
decorators = ["@comet-cli/decorator-json-schemas"]
factories = ["@comet-cli/factory-json-schemas"]
output = "exports/schemas"

[commands.make.tests]
decorators = ["@comet-cli/decorator-json-schemas", "@comet-cli/decorator-tests"]
factories = ["@comet-cli/factory-tests-laravel"]
output = "tests/Comet"
base_url = "/api" # Base url to which the endpoints get appended.
```

## Example
For an example laravel project check out [comet-demo](https://github.com/chiiya/comet-demo). You can find the generated
test cases in the `tests/Comet` folder.
