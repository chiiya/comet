const WebpackMd5Hash = require("webpack-md5-hash");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const path = require("path");

function resolve(location) {
  return path.resolve(__dirname, location);
}

module.exports = {
  mode: 'production',
  entry: { main: resolve("../src/assets/src/index.js") },
  output: {
    path: resolve('../src/assets/dist'),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          { loader: "postcss-loader", options: { config: { path: resolve('./postcss.config.js') } } }
        ]
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "style.css"
    }),
    new WebpackMd5Hash()
  ]
};
