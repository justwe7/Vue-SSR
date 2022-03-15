const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.config.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    client: {
      logging: 'error',
    },
    host: '127.0.0.1',
    historyApiFallback: true,
    open: !true,
    compress: true,
    hot: true,
    port: 3000,
    proxy: {
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name]-[fullhash:8].css",
      // filename: '[name].css',
      // chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      filename: 'index.html',
      template: path.resolve(__dirname, '../public/index.spa.html')
    }),
    // new webpack.HotModuleReplacementPlugin(), // v4 [webpack-dev-server] "hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.
  ],
})