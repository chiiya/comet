const merge = require("webpack-merge");
const webpack = require('webpack');
const baseConfig = require("./webpack.base.config");
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const path = require('path');

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: {
    app: path.resolve(__dirname, '../src/entry-client.ts'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new VueSSRClientPlugin()
  ]
});
