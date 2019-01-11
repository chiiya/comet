module.exports = {
  default: {
    parser: '@comet-cli/parser-open-api',
  },
  commands: {
    make: {
      tests: {
        decorators: [
          '@comet-cli/decorator-json-schemas',
          '@comet-cli/decorator-tests',
        ],
        factories: [
          '@comet-cli/factory-json-schemas',
        ],
        output: 'exports/tests',
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
