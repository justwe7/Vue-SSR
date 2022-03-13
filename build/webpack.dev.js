const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.config.js')

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: '127.0.0.1',
    historyApiFallback: true,
    open: true,
    compress: true,
    hot: true,
    port: 3000,
    proxy: {
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
})