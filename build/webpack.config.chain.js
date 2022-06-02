const path = require('path')
const Config = require('webpack-chain')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const FriendlyErrorsPlugin = require('@soda/friendly-errors-webpack-plugin')
const notifier = require('node-notifier')
const TerserPlugin = require('terser-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const ESLintPlugin = require('eslint-webpack-plugin') // 优化编译时eslint展示
const StylelintPlugin = require('stylelint-webpack-plugin')
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

const { resolve } = require('./utils')

const isProd = process.env.NODE_ENV === 'production'
const IN_SERVER = process.env.APP_RENDER === 'server'

const config = new Config()

config
  .mode(process.env.NODE_ENV)
  .devtool(isProd ? 'nosources-source-map' : 'eval-cheap-module-source-map')

/* resolve */
config.resolve
  .symlinks(false)
  .alias
    .set('@', resolve('../src'))
    .end()
  .extensions
    .add('.js')
    .add('.vue')
    .add('.scss')
    .add('.ts')

/* module -- loaders */
config.module
  .rule('compile-style')
    .test(/\.(sa|sc|c)ss$/)
    .use('MiniCssExtractPlugin')
      .loader(MiniCssExtractPlugin.loader)
      .options({
        publicPath: (resourcePath, context) => {
          return path.relative(path.dirname(resourcePath), context) + "/";
        }
      })
      .end()
    .use('css-loader')
      .loader('css-loader')
      .options({ esModule: false })
      .end()
    .use('postcss-loader')
      .loader('postcss-loader')
      .end()
    .use('sass-loader')
      .loader('sass-loader')
      .options({ sourceMap: true, })
      .end()
    .end()
  .rule('compile-js')
    .test(/\.js$/)
    .exclude
      .add(/node_modules/)
      .end()
    .use('thread-loader')
      .loader('thread-loader')
      .options({
        // 产生的 worker 的数量，默认是 (cpu 核心数 - 1)，或者 在 require('os').cpus() 是 undefined 时回退至 1
        workers: 2,
        // 一个 worker 进程中并行执行工作的数量 默认为 20
        workerParallelJobs: 50,
        // 额外的 node.js 参数
        workerNodeArgs: ['--max-old-space-size=2048'],
        // 允许重新生成一个僵死的 work 池 这个过程会降低整体编译速度 并且开发环境应该设置为 false
        poolRespawn: false,
        // 闲置时定时删除 worker 进程 默认为 500（ms） 可以设置为无穷大，这样在监视模式(--watch)下可以保持 worker 持续存在
        poolTimeout: 2000,
        // 池分配给 worker 的工作数量 默认为 200 降低这个数值会降低总体的效率，但是会提升工作分布更均一
        poolParallelJobs: 50,
        // 池的名称
        name: 'ssr-pool'
      })
      .end()
    .use('babel-loader')
      .loader('babel-loader')
      .options({
        cacheDirectory: true // default cache directory in node_modules/.cache/babel-loader
      })
      .end()
    .end()
  .rule('file')
    .test(/\.(jpe?g|png|gif)$/i)
    .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 1024, // 限制转base64的图片为1kb(1024b)，超过1k的输出文件, 设置此项需要安装依赖：file-loader
        name: 'images/[name]-[fullhash:8].[ext]',
      })
      .end()
    .end()
  .rule('font')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
    .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 10240, // 10k
        name: 'fonts/[name]-[fullhash:8].[ext]'
      })
      .end()
    .end()
  .rule('vue')
    .test(/\.vue$/)
    .use('vue')
      .loader('vue-loader')
      .end()


/* plugins */
config
  .plugin('VueLoaderPlugin')
  .use(VueLoaderPlugin)

config
  .plugin('ESLintPlugin')
  .use(ESLintPlugin, [{
    cache: true,
    emitWarning: true,
    extensions: ['js', 'vue'],
    failOnError: false,
    // formatter: require('eslint-friendly-formatter'),
    // eslint-friendly-formatter
    fix: true
  }])

config
  .plugin('StylelintPlugin')
  .use(StylelintPlugin, [{
    cache: true,
      fix: true,
      // failOnError: false,
      extensions: ['scss', 'vue', 'css']
  }])

/* optimization */
config
  .when(isProd,
    config => { // true
      config
        .optimization
          .minimize(true)
          .end()
        .minimizer('TerserPlugin')
          .use('TerserPlugin', [{
            parallel: true, // 开启“多线程”，提高压缩效率
            extractComments: false,
            terserOptions: {
              format: {
                comments: false
              }
            }
          }])
    },
    config => { // false
    }
  )

module.exports = config.toConfig()
