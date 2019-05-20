let mix = require('laravel-mix');
const glob = require('glob-all');
const tailwind = require('tailwindcss');
const cssImport = require('postcss-import');
const cssPresetEnv = require('postcss-preset-env');
const cssNested = require('postcss-nested');
const purgeCss = require('@fullhuman/postcss-purgecss');


/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application, as well as bundling up your JS files.
 |
 */

mix.postCss('src/css/main.css', 'dist/css', [
  cssImport(),
  tailwind('./tailwind.config.js'),
  cssNested(),
  cssPresetEnv(),
  // purgeCss({
  //   content: glob.sync([
  //     path.join(__dirname, 'dist/index.html'),
  //     Add any other files that reference class names here
    // ]),
    // extractors: [{
    //   extractor: class {
    //     static extract (content) {
    //       return content.match(/[A-z0-9-:\/]+/g) || [];
    //     }
    //   },
    //   extensions: ['html', 'js', 'php'],
    // }]
  // }),
])
  .ts('src/js/index.ts', 'dist/js')
  .setPublicPath('dist');
