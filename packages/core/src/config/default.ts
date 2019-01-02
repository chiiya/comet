module.exports = {
  default: {
    parser: '@comet-cli/parser-open-api',
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
      schemas: {
        decorators: [
          '@comet-cli/decorator-json-schemas',
        ],
        factories: [
          '@comet-cli/factory-json-schemas',
        ],
        output: 'exports/schemas',
      },
    },
  },
};
