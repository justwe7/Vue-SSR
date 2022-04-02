const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const FriendlyErrorsPlugin = require('@soda/friendly-errors-webpack-plugin')
const notifier = require('node-notifier')
const TerserPlugin = require('terser-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')

const isProd = process.env.NODE_ENV === 'production'
const IN_SERVER = process.env.APP_RENDER === 'server'

const config = {
  mode: process.env.NODE_ENV,
  // infrastructureLogging: {
  //   level: 'error',
  // },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  module: {
    rules: [
      /* css */
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // IN_SERVER ? 'vue-style-loader' :
          //   {
          //     loader: MiniCssExtractPlugin.loader,
          //     options: {
          //       publicPath: (resourcePath, context) => {
          //         return path.relative(path.dirname(resourcePath), context) + "/";
          //       },
          //     },
          //   },
          // MiniCssExtractPlugin.loader, // 提取css文件,不与style-loader共存
          // isProd ?
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + "/";
              },
            },
          },
          //   'style-loader', // 打包css到style标签
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
    // new CleanWebpackPlugin(),
    new FriendlyErrorsPlugin({
      onErrors: (severity, errors) => {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        notifier.notify({
          title: 'webpackError - ' + error.name,
          message: error.file,
          // message: error.message
        });
      }
      // compilationSuccessInfo: {
      //   messages: ['You application is running here http://localhost:3000'],
      //   notes: ['Some additional notes to be displayed upon successful compilation']
      // },
    }), // 输出美化
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
}

// !IN_SERVER && config.module.rules[0].use.unshift('vue-style-loader')
// SSR 渲染报错 -> MiniCssExtractPlugin@2.6.0 https://github.com/webpack-contrib/mini-css-extract-plugin/issues/500
// !IN_SERVER && config.module.rules[0].use.unshift({
//   loader: MiniCssExtractPlugin.loader,
//   options: {
//     // publicPath: (resourcePath, context) => {
//     //   return path.relative(path.dirname(resourcePath), context) + "/";
//     // },
//   },
// })

module.exports = config