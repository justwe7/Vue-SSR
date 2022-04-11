const webpack = require('webpack')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const WebpackBar = require('webpackbar')
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const { resolve } = require('./utils')

const isProd = process.env.NODE_ENV === 'production'
const baseConfig = require('./webpack.config.js')

module.exports = merge(baseConfig, {
  // mode: process.env.NODE_ENV,
  entry: {
    bundle: resolve('../src/entry-client.js'),
  },
  output: {
    publicPath: '/',
    filename: 'js/[name]-[fullhash:8].js',
    path: resolve('../dist'),
  },
  /* devServer: {
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
  }, */
  plugins: [
    new webpack.DefinePlugin({
      'process.env.TARGET_ENV': '"client"',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[fullhash:8].css',
      // filename: '[name].css',
      // chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      filename: 'index.spa.html',
      template: resolve('../public/index.spa.html')
    }),
    new ErrorOverlayPlugin(),
    new VueSSRClientPlugin(),
    new WebpackBar({ name: 'client', color: 'green', profile: isProd, reporter: {
      // done(context) {
      //   console.log(context)
      // },
    } }),
    // new webpack.HotModuleReplacementPlugin(), // v4 [webpack-dev-server] "hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.
  ],
})
