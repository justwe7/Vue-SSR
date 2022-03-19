const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const nodeExternals = require('webpack-node-externals')

const resolve = file => path.resolve(__dirname, file)
const IN_SERVER = process.env.WEBPACK_TARGET === 'server'
const webpackEntry = IN_SERVER ? 'server' : 'client'

const config = {
  // mode: process.env.NODE_ENV,
  //输入
  // entry: {
  //   bundle: resolve(`../src/entry-${webpackEntry}.js`)
  // },
  // node: IN_SERVER ? undefined : false, // mock数据 保证使用 node 中全局变量 是否要处理
  // target: IN_SERVER ? 'node' : 'web', // 允许 webpack 以 node 方式导入动态组件 告知 vue-loader 面向服务端编译
  // //输出
  // output: {
  //   libraryTarget: IN_SERVER ? 'commonjs2' : undefined, // 使用 node 模块化机制导出
  //   path: resolve('../dist'),
  //   filename: '[name].js'
  // },
  resolve: {
    extensions: ['*', '.js', '.json', '.vue'], // 方便我们引入依赖或者文件的时候可以省略后缀：
    alias: {
      // vue$: 'vue/dist/vue.esm.js', // 配置别名 确保webpack可以找到.vue文件
      '@': resolve('../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.(png|jpg|jepg|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 1024, //这里的单位是b
              name: 'images/[name]-[hash].[ext]' //打包后输出路径
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}

if (IN_SERVER) {
  // https://webpack.js.org/configuration/externals/#function
  // https://github.com/liady/webpack-node-externals
  // 外置化应用程序依赖模块。可以使服务器构建速度更快，
  // 并生成较小的 bundle 文件。
  config.externals = nodeExternals({
    // 不要外置化 webpack 需要处理的依赖模块。
    // 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
    // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
    whitelist: /\.css$/
  })
}

module.exports = config
