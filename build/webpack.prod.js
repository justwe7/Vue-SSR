const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const path = require('path');
const baseConfig = require('./webpack.config.js')
const resolve = file => path.resolve(__dirname, file)

// const config = new Config()
module.exports = merge(baseConfig, {
  mode: 'production',
  target: 'node',
  output: {
    path: resolve('../dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2' // 使用 node 模块化机制导出
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name]-[fullhash:8].css",
    }),
    new VueSSRServerPlugin(),
    new HtmlWebpackPlugin({
      inject: 'body',
      filename: 'index.html',
      template: path.resolve(__dirname, '../public/index.ssr.html')
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false
          }
        }
      })
    ]
  }
})