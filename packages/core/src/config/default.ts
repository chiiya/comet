module.exports = {
  default: {
    adapter: '@comet-cli/adapter-open-api',
  },
  commands: {
    make: {
      tests: {
        decorators: [
          '@comet-cli/decorator-json-schemas',
          '@comet-cli/decorator-tests',
        ],
        factories: [
          '@comet-cli/factory-tests-laravel',
        ],
        output: 'tests/Comet',
        base_url: '/api',
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
      documentation: {
        decorators: [
          // '@comet-cli/decorator-json-schemas',
        ],
        factories: [
          // '@comet-cli/factory-json-schemas',
        ],
        output: 'exports/documentation',
        ungroupRoot: true,
      },
    },
  },
};
