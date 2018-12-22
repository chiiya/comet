module.exports = {
  default: {
    parser: '@comet-cli/parser-openapi',
  },
  commands: {
    make: {
      tests: {
        decorators: [
          '@comet-cli/decorator-tests-default',
        ],
        factories: [
          '@comet-cli/factory-tests-laravel',
        ],
      },
    },
  },
};
