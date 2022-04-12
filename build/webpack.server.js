const { merge } = require('webpack-merge')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const WebpackBar = require('webpackbar')
const nodeExternals = require('webpack-node-externals')
const { resolve } = require('./utils')

const isProd = process.env.NODE_ENV === 'production'
const baseConfig = require('./webpack.config.js')

// server
baseConfig.module.rules[0].use[0] = 'vue-style-loader'

/* server-render编译缓存 */
baseConfig.cache = {
  name: 'serverCache-' + process.env.NODE_ENV,
  type: 'filesystem',
  // cacheDirectory: resolve('.temp_cache'),
  // buildDependencies: {
  //   // This makes all dependencies of this file - build dependencies
  //   config: [__filename],
  // },
}

// const config = new Config()
module.exports = merge(baseConfig, {
  // mode: 'production',
  target: 'node',
  node: undefined, // mock数据 保证使用 node 中全局变量 是否要处理
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // 外部化依赖
  entry: {
    app: resolve('../src/entry-server.js')
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
    new webpack.DefinePlugin({
      'process.env.TARGET_ENV': '"server"',
    }),
    new VueSSRServerPlugin(),
    new HtmlWebpackPlugin({
      inject: 'body',
      // filename: 'index.html',
      template: resolve('../public/index.ssr.html')
    }),
    new WebpackBar({ name: 'server', color: 'orange', profile: isProd })
  ]
})
