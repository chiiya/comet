const merge = require("webpack-merge");
const webpack = require('webpack');
const baseConfig = require("./webpack.base.config");
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: {
    app: path.resolve(__dirname, '../src/entry-client.ts'),
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new VueSSRClientPlugin()
  ]
});
