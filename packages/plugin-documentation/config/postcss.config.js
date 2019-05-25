const autoprefixer = require('autoprefixer');
const tailwind = require('tailwindcss');
const cssImport = require('postcss-import');
const cssPresetEnv = require('postcss-preset-env');
const cssNested = require('postcss-nested');
const purgeCss = require('@fullhuman/postcss-purgecss');
const path = require("path");

function resolve(location) {
  return path.resolve(__dirname, location);
}

module.exports = {
  plugins: [
    cssImport(),
    tailwind(resolve('./tailwind.config.js')),
    cssNested(),
    cssPresetEnv(),
    purgeCss({
      content: [
        resolve('../src/**/*.html'),
        resolve('../src/**/*.vue'),
      ],
      defaultExtractor(content) {
        const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '');
        return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_/:]*[A-Za-z0-9-_/]+/g) || []
      },
      whitelist: [],
      whitelistPatterns: [/language-.+$/, /ml-\d/],
    }),
    autoprefixer(),
  ]
};
