## Comet Examples

This folder contains a complex example specification in each of the supported description languages.
All of the specifications describe the API implemented in [this repository](https://github.com/chiiya/comet-demo).

### API Blueprint
The API Blueprint specification can be found under `api-blueprint/comet-demo.apib` and is split into partials. `blueprint.apib`
is the final, compiled version. For compiling the example specification, use [hercule](https://github.com/jamesramsay/hercule):
```bash
hercule examples/api-blueprint/comet-demo.apib -o examples/blueprint.apib
```

