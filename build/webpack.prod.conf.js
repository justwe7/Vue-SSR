const path = require('path')
const base = require('./webpack.base.conf')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const resolve = file => path.resolve(__dirname, file)

module.exports = merge(base, {
  mode: 'production',
  target: 'node',
  node: undefined, // mock数据 保证使用 node 中全局变量 是否要处理
  entry: {
    bundle: resolve('../src/entry-server.js')
  },
  output: {
    path: resolve('../dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2' // 使用 node 模块化机制导出
  },
  plugins: [
    new VueSSRServerPlugin(),
  ],
  // output: {
  //   filename: 'js/[name]-[hash].js',
  //   chunkFilename: 'js/vendor-[id]-[hash].js'
  // },
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
