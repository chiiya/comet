## Comet Examples

This folder contains a complex example specification in each of the supported description languages.
All of the specifications describe the API implemented in [this repository](https://github.com/chiiya/comet-demo).

### API Blueprint
The API Blueprint specification can be found under `api-blueprint/comet-demo.apib` and is split into partials. For 
compiling the example specification, use [hercule](https://github.com/jamesramsay/hercule):
```bash
hercule api-blueprint/comet-demo.apib -o blueprint.apib
```
Then, run comet on the compiled file.
```bash
comet make:documentation blueprint.apib
```

