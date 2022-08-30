const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const baseConfig = require('./webpack.config.js')

module.exports = merge(baseConfig, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name]-[fullhash:8].css",
    })
  ],
  optimization: {
    runtimeChunk: true, // 为运行时代码创建一个额外的 chunk，减少 entry chunk 体积，提高性能
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true, // 开启“多线程”，提高压缩效率
        extractComments: false,
        terserOptions: {
          format: {
            comments: false
          }
        }
      })
    ],
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
      // 重复打包问题
      cacheGroups:{
        vendors:{ // node_modules里的代码
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          // name: 'vendors', 一定不要定义固定的name
          priority: 10, // 优先级
          enforce: true
        }
      }
    }
  }
})
