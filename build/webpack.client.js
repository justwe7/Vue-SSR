const path = require('path')
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.config.js')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

const resolve = file => path.resolve(__dirname, file)

module.exports = merge(baseConfig, {
  mode: 'production',
  // mode: 'development',
  // devtool: 'inline-source-map',
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
    new VueSSRClientPlugin()
    // new webpack.HotModuleReplacementPlugin(), // v4 [webpack-dev-server] "hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.
  ],
})