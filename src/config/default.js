module.exports = {
  make: {
    tests: {
      parser: 'comet-parser-open-api',
      decorators: [
        'comet-tests-decorator-default',
      ],
      factories: [
        'comet-tests-factory-laravel',
      ],
    },
  },
};
