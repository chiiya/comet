module.exports = {
  default: {
    adapter: null,
  },
  commands: {
    make: {
      tests: {
        plugins: [
          '@comet-cli/decorator-tests',
          '@comet-cli/factory-tests-laravel',
        ],
        output: 'tests/Comet',
        base_url: '/api',
      },
      schemas: {
        plugins: [
          '@comet-cli/plugin-json-schemas',
        ],
        output: 'exports/schemas',
      },
      documentation: {
        plugins: [
        ],
        output: 'exports/documentation',
        ungroupRoot: true,
      },
    },
  },
};
