<p align="center"><img src="https://i.postimg.cc/1RYn00Tg/comet-logo.png" alt="Comet"></p>
<p align="center"><strong>Automated testing and documentation for RESTful APIs.</strong></p>

**Notice:** This package is still in early development and not intended for usage. Check out 
the [roadmap](https://changemap.co/chiiya/comet/) for more information.
To test parser functionality, call:
```bash
npx comet make:documentation examples/(blueprint.apib)|(openapi.yml)|(raml/api.raml)
```
This will create a `result.json` file with the resulting model tree.

## Index
<pre>
<a href="#usage"
>> Usage .....................................................................</a>
<a href="#configuration"
>> Configuration .............................................................</a>
<a href="#examples"
>> Examples ..................................................................</a>
<a href="#setup"
>> Setup .....................................................................</a>
</pre>

## Usage
Currently, the following commands are available:
#### Make Schemas
`comet make:schemas` will generate valid JSON-Schema definitions for all requests and responses.
#### Make Tests
`comet make:tests` will generate integration tests for all endpoints and parameter combinations for the Laravel framework.
#### Make Postman
`comet make:postman` will generate a Postman Collection for your API.
#### Make Documentation
`comet make:documentation` will generate an API documentation.

For usage, see the [core package](https://github.com/chiiya/comet/tree/master/packages/core).

## Configuration
Comet can be configured in many ways:
- `comet` key in your `package.json`
- `.cometrc` in JSON or YAML format
- `.cometrc.json`
- `.cometrc.yml`
- `.cometrc.toml`

The default configuration (in `.cometrc.toml`) looks like the following:

```toml
[default]
# No default adapter configured. Instead, we will try to auto-detect the input format.
# adapter = "@comet-cli/adapter-openapi"

[commands.make.schemas]
plugins = ["@comet-cli/plugin-json-schemas"]
output = "exports/schemas"

[commands.make.tests]
plugins = ["@comet-cli/decorator-tests", "@comet-cli/factory-tests-laravel"] # Order matters!
output = "tests/Comet"
base_url = "/api" # Base url to which the endpoints get appended.

[commands.make.documentation]
plguins = []
output = "exports/documentation"
ungroup_root = true # Will un-group resource groups in API Blueprint named `Root`
```

## Examples
Example specifications in OpenAPI, RAML and API Blueprint format with instructions for compilation can be found under the 
`examples` folder. For an example laravel project check out [comet-demo](https://github.com/chiiya/comet-demo). You can 
find the generated test cases in the `tests/Comet` folder.

## About
Comet takes an API specification in any input format, converts it to its own internal API model, and then executes a bunch of
tasks based on that model. The advantages are obvious: we have a model that is optimized for automated processing 
(information is always in exactly one place, everything is expanded, etc.), plus we can write code once and support all
input formats. All commands in **comet** have the same structure:

![architecture.png](https://i.postimg.cc/1zzJBsxV/architecture.png)

Every command resolves its adapter and plugins at runtime from the user configuration, executes the adapter to transform 
the input into our own model and then executes a list of plugins, in order.  
Type definitions for both the internal API model as well as the interfaces for adapters and plugins are available 
in the `@comet-cli/types` package.

## Setup
Comet is set up as a monorepo using lerna and yarn workspaces. 

### Requirements
```bash
node # >=8.0.0
yarn
```

### Installation
```bash
$ git clone https://github.com/chiiya/comet
$ cd comet
$ make bootstrap
```
