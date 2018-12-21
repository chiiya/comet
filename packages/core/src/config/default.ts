module.exports = {
  commands: {
    make: {
      tests: {
        parser: '@comet-cli/parser-openapi',
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
