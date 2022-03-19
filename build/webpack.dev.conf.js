const path = require('path')
const base = require('./webpack.base.conf')
const merge = require('webpack-merge')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const resolve = file => path.resolve(__dirname, file)

module.exports = merge(base, {
  entry: {
    bundle: resolve(`../src/entry-client.js`)
  },
  output: {
    filename: 'js/[name]-[contenthash:8].js',
    path: resolve('../dist'),
  },
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
    new VueSSRClientPlugin(),
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
