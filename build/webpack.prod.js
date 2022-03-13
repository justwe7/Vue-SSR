const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const baseConfig = require('./webpack.config.js')
// const config = new Config()
module.exports = merge(baseConfig, {
  mode: 'production',
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name]-[fullhash:8].css",
    })
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