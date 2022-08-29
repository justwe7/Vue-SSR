const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.config.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  infrastructureLogging: { level: 'error' }, // devserver log
  stats: 'minimal', // errors-warnings 精简编译后log
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
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: true,
    }),
    new MiniCssExtractPlugin({
      filename: "[name]-[fullhash:8].css",
      // filename: '[name].css',
      // chunkFilename: '[id].css',
    }),
  ],
})
