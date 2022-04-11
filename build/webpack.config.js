const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const FriendlyErrorsPlugin = require('@soda/friendly-errors-webpack-plugin')
const notifier = require('node-notifier')
const TerserPlugin = require('terser-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const ESLintPlugin = require('eslint-webpack-plugin') // 优化编译时eslint展示
const StylelintPlugin = require('stylelint-webpack-plugin')
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')

const { resolve } = require('./utils')

const isProd = process.env.NODE_ENV === 'production'
const IN_SERVER = process.env.APP_RENDER === 'server'

const config = {
  mode: process.env.NODE_ENV,
  // infrastructureLogging: {
  //   level: 'error',
  // },
  resolve: {
    alias: {
      '@': resolve('../src')
    },
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
        use: [
          {
            loader: 'thread-loader',
            // 有同样配置的 loader 会共享一个 worker 池
            options: {
              // 产生的 worker 的数量，默认是 (cpu 核心数 - 1)，或者，
              // 在 require('os').cpus() 是 undefined 时回退至 1
              workers: 2,
              // 一个 worker 进程中并行执行工作的数量
              // 默认为 20
              workerParallelJobs: 50,

              // 额外的 node.js 参数
              workerNodeArgs: ['--max-old-space-size=2048'],

              // 允许重新生成一个僵死的 work 池
              // 这个过程会降低整体编译速度
              // 并且开发环境应该设置为 false
              poolRespawn: false,

              // 闲置时定时删除 worker 进程
              // 默认为 500（ms）
              // 可以设置为无穷大，这样在监视模式(--watch)下可以保持 worker 持续存在
              poolTimeout: 2000,

              // 池分配给 worker 的工作数量
              // 默认为 200
              // 降低这个数值会降低总体的效率，但是会提升工作分布更均一
              poolParallelJobs: 50,

              // 池的名称
              // 可以修改名称来创建其余选项都一样的池
              name: 'ssr-pool'
            },
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true // default cache directory in node_modules/.cache/babel-loader
            }
          }
        ],
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
    new ESLintPlugin({
      cache: true,
      emitWarning: true,
      extensions: ['js', 'vue'],
      failOnError: false,
      // formatter: require('eslint-friendly-formatter'),
      // eslint-friendly-formatter
      fix: true
    }),
    new StylelintPlugin({
      cache: true,
      fix: true,
      // failOnError: false,
      extensions: ['scss', 'vue', 'css']
    }),
    // new CleanWebpackPlugin(),
    // new ErrorOverlayPlugin(),
    // new FriendlyErrorsPlugin({
    //   onErrors: (severity, errors) => {
    //     if (severity !== 'error') {
    //       return;
    //     }
    //     const error = errors[0];
    //     notifier.notify({
    //       title: 'webpackError - ' + error.name,
    //       message: error.file,
    //       // message: error.message
    //     });
    //   }
    //   // compilationSuccessInfo: {
    //   //   messages: ['You application is running here http://localhost:3000'],
    //   //   notes: ['Some additional notes to be displayed upon successful compilation']
    //   // },
    // }), // 输出美化
  ],
  optimization: {
    // minimize: true,
    // minimizer: [
    //   new TerserPlugin({
    //     extractComments: false,
    //     terserOptions: {
    //       format: {
    //         comments: false
    //       }
    //     }
    //   })
    // ]
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
if (isProd) {
  // config.cache = {
  //   type: 'filesystem',
  //   // cacheDirectory: resolve('.temp_cache'),
  //   // buildDependencies: {
  //   //   // This makes all dependencies of this file - build dependencies
  //   //   config: [__filename],
  //   // },
  // }
  config.devtool = 'nosources-source-map'
  config.optimization = {
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
    ]
  }
} else {
  config.devtool = 'eval-cheap-module-source-map'
  // config.cache = {
  //   type: 'filesystem',
  //   cacheDirectory: resolve('.temp_cache'),
  //   buildDependencies: {
  //     // This makes all dependencies of this file - build dependencies
  //     config: [__filename],
  //   },
  // }
}

module.exports = config
