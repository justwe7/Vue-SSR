const webpack = require('webpack')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const WebpackBar = require('webpackbar')
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const { resolve } = require('./utils')

const isProd = process.env.NODE_ENV === 'production'
const baseConfig = require('./webpack.config.js')

/* client-render编译缓存 */
baseConfig.cache = {
  name: 'clientCache-' + process.env.NODE_ENV,
  type: 'filesystem',
  // cacheDirectory: resolve('.temp_cache'),
  // buildDependencies: {
  //   // This makes all dependencies of this file - build dependencies
  //   config: [__filename],
  // },
}
if (isProd) {
  baseConfig.optimization.minimizer.push(new CssMinimizerPlugin({
    parallel: true,
  }))
  baseConfig.optimization.splitChunks = {
    // include all types of chunks
    chunks: 'all',
    automaticNameDelimiter: '-',
    minSize: 20000, // 拆分出的模块最小体积(≈ 20kb)，太小体积的代码块被分割，可能还会因为额外的请求，拖慢加载性能
    minChunks: 1, // 最少引用一次
    maxAsyncRequests: 5, // 同一个页同时最大按需请求的模块数量不超过5个
    maxInitialRequests: 6, // 入口同时请求同步模块数量
    cacheGroups: {
      default: false,
      wandUi: {
        name: "chunk-wandUi", // 单独将 wandUI 拆包
        priority: 20, // 权重要大于 libs 和 app 不然会被打包进 vendors
        test: /[\\/]node_modules[\\/]wand-ui[\\/]/,
        reuseExistingChunk: true
      },
      /* 创建一个 commons chunk，其中包括入口（entry points）之间所有共享的代码 */
      // commons: {
      //   name: 'commons',
      //   chunks: 'initial',
      //   minChunks: 2,
      // },
      /* 创建一个 vendors chunk，其中包括整个应用程序中 node_modules 的所有代码 */
      vendors: {
        // node_modules里的代码
        name: 'vendors',
        test: /[\\/]node_modules[\\/]/,
        chunks: 'all', // async 异步引入的库进行分离(默认) initial 同步引入的库进行分离 all 所有引入的库进行分离(推荐)
        priority: -1, // 优先级
        enforce: true // 创建chunk优先级高于：splitChunks.minSize、splitChunks.minChunks、splitChunks.maxAsyncRequests 和 splitChunks.maxInitialRequests
      }
    }
  }
}
/* optimization: {
  minimizer: [
    // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
    // `...`,
    new CssMinimizerPlugin(),
  ],
}, */

module.exports = merge(baseConfig, {
  // mode: process.env.NODE_ENV,
  entry: {
    app: resolve('../src/entry-client.js'),
  },
  output: {
    publicPath: '/',
    filename: 'js/[name]-[fullhash:8].js',
    path: resolve('../dist'),
  },
  /* devServer: {
    client: {
      logging: 'error',
    },
    host: '127.0.0.1',
    historyApiFallback: true,
    open: !true,
    compress: true,
    hot: true,
    port: 3000,
    proxy: {
    }
  }, */
  plugins: [
    /* new PrerenderSPAPlugin({
      // Required - The path to the webpack-outputted app to prerender.
      staticDir: resolve('../dist'),
      // Required - Routes to render.
      routes: ['/home'],
    }), */
    new webpack.DefinePlugin({
      'process.env.TARGET_ENV': '"client"',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[fullhash:8].css',
      // filename: '[name].css',
      // chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      filename: 'index.spa.html',
      template: resolve('../public/index.spa.html')
    }),
    new ErrorOverlayPlugin(),
    new VueSSRClientPlugin(),
    new WebpackBar({ name: 'client', color: 'green', profile: isProd, reporter: {
      // done(context) {
      //   console.log(context)
      // },
    } }),
    // new webpack.HotModuleReplacementPlugin(), // v4 [webpack-dev-server] "hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.
  ],
})
