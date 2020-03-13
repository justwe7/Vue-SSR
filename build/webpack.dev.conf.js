const path = require('path')
const base = require('./webpack.base.conf')
const merge = require('webpack-merge')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const resolve = file => path.resolve(__dirname, file)

module.exports = merge(base, {
  devServer: {
    port: 8080,
    host: '127.0.0.1',
    open: true,
    hot: true,
    overlay: { erros: true }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: resolve('../public/index.spa.html'),
      inject: 'body',
      minify: {
        removeComments: true
      }
    })
  ]
})
