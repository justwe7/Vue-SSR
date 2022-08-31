const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const ESLintPlugin = require('eslint-webpack-plugin') // 优化编译时eslint展示
const StylelintPlugin = require('stylelint-webpack-plugin')
const WebpackBar = require('webpackbar')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  cache: {
    type: 'filesystem', // 默认使用的是memory，使用磁盘缓存
    name: 'CacheBy-' + process.env.NODE_ENV || 'development'
  },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  entry: {
    main: './src/index.js',
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
              name: 'images/[name]-[contenthash:8].[ext]',
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
              name: 'fonts/[name]-[contenthash:8].[ext]'
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
    new WebpackBar(),
    new VueLoaderPlugin(),
    new ESLintPlugin({
      cache: true,
      emitWarning: true,
      extensions: ['js', 'vue'],
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
      template: path.resolve(__dirname, '../src/index.html')
    }),
    // new FriendlyErrorsWebpackPlugin({
    //   // compilationSuccessInfo: {
    //   //   messages: ['You application is running here http://localhost:3000'],
    //   //   notes: ['Some additional notes to be displayed upon successful compilation']
    //   // },
    // }), // 输出美化
  ]
}
