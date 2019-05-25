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
      },
      schemas: {
        plugins: [
          '@comet-cli/plugin-json-schemas',
        ],
      },
      documentation: {
        plugins: [
          '@comet-cli/plugin-documentation',
        ],
      },
      postman: {
        plugins: [
          '@comet-cli/plugin-postman',
        ],
      },
    },
  },
  adapters: {
    'api-blueprint': {
      ungroup_root: false,
    },
  },
  plugins: {
    postman: {
      output: './',
      group_by: undefined,
      flatten: false,
    },
    'json-schemas': {
      output: './',
    },
    'tests-laravel': {
      output: 'tests/Comet',
      base_url: '/api',
    },
    documentation: {
      output: './',
      theme: '@comet-cli/theme-nucleus',
      template: undefined,
      css: undefined,
      data: {
        title: 'API Reference',
        description: undefined,
        asset_src: '',
      },
    },
  },
};
