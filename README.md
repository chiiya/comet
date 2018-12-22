<p align="center"><img src="https://i.imgur.com/W61Wiyp.png" alt="Comet"></p>
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