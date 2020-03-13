const path = require('path')
const base = require('./webpack.base.conf')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const resolve = file => path.resolve(__dirname, file)

module.exports = merge(base, {
  output: {
    filename: 'js/[name]-[hash].js',
    chunkFilename: 'js/vendor-[id]-[hash].js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        },
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[hash].css' }),
    new HtmlWebpackPlugin({
      template: resolve('../public/index.template.html'),
      inject: 'body',
      minify: {
        removeComments: true
      }
    })
    // new CleanWebpackPlugin()
  ]
})
