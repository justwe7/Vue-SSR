const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  resolve: {
    extensions: ['.js', '.vue'],
  },
  entry: {
    // 'main': ['@babel/polyfill', './src/index.js'],
    main: './src/index.js',
  },
  output: {
    // filename: 'js/[name].js',
    filename: 'js/[name]-[fullhash:8].js',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [
      /* css */
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // MiniCssExtractPlugin.loader, // 提取css文件,不与style-loader共存
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + "/";
              },
            },
          },
          // 'style-loader', // 打包css到style标签
          { loader: 'css-loader', options: { esModule: false } },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ]
      },
      /* js */
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules/
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        // type: 'asset/resource', // 'asset', 'javascript/auto', webpack5 Asset Modules模块
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024, // 限制转base64的图片为1kb(1024b)，超过1k的输出文件, 设置此项需要安装依赖：file-loader
              name: 'images/[name]-[fullhash:8].[ext]',
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240, // 10k
              name: 'fonts/[name]-[fullhash:8].[ext]'
            }
          }
        ]
      },
      /* vue */
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: 'body',
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.spa.html')
    }),
    new MiniCssExtractPlugin({
      filename: "[name]-[fullhash:8].css",
      // chunkFilename: "[id].css",
    })
  ]
}