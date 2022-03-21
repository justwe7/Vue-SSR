const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const path = require('path');
const baseConfig = require('./webpack.config.js')
const resolve = file => path.resolve(__dirname, file)

// server
baseConfig.module.rules[0].use[0] = 'vue-style-loader'

// const config = new Config()
module.exports = merge(baseConfig, {
  mode: 'production',
  target: 'node',
  node: undefined, // mock数据 保证使用 node 中全局变量 是否要处理
  entry: {
    bundle: resolve('../src/entry-server.js')
  },
  output: {
    path: resolve('../dist'),
    filename: 'server-bundle.js',
    libraryTarget: 'commonjs2' // 使用 node 模块化机制导出
  },
  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: "[name]-[fullhash:8].css",
    // }),
    new VueSSRServerPlugin(),
    new HtmlWebpackPlugin({
      inject: 'body',
      // filename: 'index.html',
      template: resolve('../public/index.ssr.html')
    }),
  ]
})