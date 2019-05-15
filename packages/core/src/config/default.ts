module.exports = {
  default: {
    adapter: null,
  },
  commands: {
    make: {
      tests: {
        plugins: [
          '@comet-cli/plugin-tests-laravel',
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
      postman: {
        plugins: [
          '@comet-cli/plugin-postman',
        ],
        output: 'exports',
        ungroupRoot: true,
      },
    },
  },
};
