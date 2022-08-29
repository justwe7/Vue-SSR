const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const ESLintPlugin = require('eslint-webpack-plugin') // 优化编译时eslint展示
const StylelintPlugin = require('stylelint-webpack-plugin')
const WebpackBar = require('webpackbar')
const TerserPlugin = require('terser-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  cache: {
    type: 'filesystem', // 默认使用的是memory，空间换时间~使用磁盘缓存
    name: 'CacheBy-' + process.env.NODE_ENV
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
  },
  entry: {
    main: './src/index.ts',
  },
  output: {
    filename: 'js/[name]-[fullhash:8].js',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [
      /* css */
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isProd ?
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: (resourcePath, context) => {
                  return path.relative(path.dirname(resourcePath), context) + "/";
                },
              },
            } :
          'style-loader', // 打包css到style标签
          { loader: 'css-loader', options: { esModule: false } },
          {
            loader: 'postcss-loader',
          },
          /* {
            loader: 'thread-loader',
            options: {
              workerParallelJobs: 2,
            }
          }, */
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
        test: /\.(j|t)s$/,
        use: [
          {
            // babel处理完之后再交给ts处理，
            loader: 'ts-loader', /* https://github.com/TypeStrong/ts-loader */
            options: {
                // 指定特定的ts编译配置，为了区分脚本的ts配置
                // 注意这里的路径问题，按照自己项目来配置
                configFile: path.resolve(__dirname, '../tsconfig.json'),
                appendTsSuffixTo: [/\.vue$/],
                /* 只做语言转换，而不做类型检查, 这里如果不设置成TRUE，就会HMR 报错 */
                transpileOnly: true,
            }
          },
          /* {
            loader: 'thread-loader',
            // 有同样配置的 loader 会共享一个 worker 池
            options: {
              // 产生的 worker 的数量，默认是 (cpu 核心数 - 1)，或者，. 在 require('os').cpus() 是 undefined 时回退至 1
              workers: 2,
              // 一个 worker 进程中并行执行工作的数量.默认为 20
              workerParallelJobs: 50,
              // 额外的 node.js 参数
              workerNodeArgs: ['--max-old-space-size=2048'],
              // 允许重新生成一个僵死的 work 池。这个过程会降低整体编译速度.并且开发环境应该设置为 false
              poolRespawn: false,
              // 闲置时定时删除 worker 进程。默认为 500（ms）.可以设置为无穷大，这样在监视模式(--watch)下可以保持 worker 持续存在
              poolTimeout: 2000,
              // 池分配给 worker 的工作数量。默认为 200 降低这个数值会降低总体的效率，但是会提升工作分布更均一
              poolParallelJobs: 50,
              // 池的名称.可以修改名称来创建其余选项都一样的池
              name: 'ssr-pool'
            },
          }, */
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true // default cache directory in node_modules/.cache/babel-loader
            }
          },
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
      extensions: ['ts', 'js', 'vue'],
      failOnError: false,
      fix: true
    }),
    new StylelintPlugin({
      cache: true,
      fix: true,
      // failOnError: false,
      extensions: ['scss', 'vue', 'css']
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.spa.html')
    }),
    new WebpackBar()
  ],
  optimization: {
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
}
