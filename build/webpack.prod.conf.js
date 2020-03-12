const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const baseConfig = require('./webpack.base.conf')
module.exports = merge(baseConfig, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: []
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CleanWebpackPlugin({
      verbose: true
    })
  ]
})
