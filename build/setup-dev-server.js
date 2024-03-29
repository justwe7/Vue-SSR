const Webpack = require('webpack')
const fs = require('fs')
const MFS = require('memory-fs') // 从内存读取文件
const chokidar = require('chokidar')
const { readFile, resolve } = require('./utils')

const webpackDevMiddleware = require('./koa-webpack-dev-middleware')
const webpackHotMiddleware = require('./koa-webpack-hot-middleware')
const serverConfig = require('./webpack.server')
const clientConfig = require('./webpack.client')
// const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')

module.exports = function setupDevServer (app, templatePath, cb) {
  let bundle
  let template
  let clientManifest

  let ready
  const readyPromise = new Promise(r => { ready = r })
  const update = () => {
    if (bundle && clientManifest) {
      ready()
      cb(bundle, {
        template,
        clientManifest
      })
    }
  }

  // read template from disk and watch
  template = fs.readFileSync(templatePath, 'utf-8')
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    console.log('index.html template updated.')
    update()
  })

  // modify client config to work with hot middleware 客户端注入热更新模块
  // https://github.com/webpack-contrib/webpack-hot-middleware/tree/master/example
  clientConfig.entry.app = [
    'webpack-hot-middleware/client',
    clientConfig.entry.app
  ]
  clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin(),
    // new ErrorOverlayPlugin()
  )

  // dev middleware
  const clientCompiler = Webpack(clientConfig)
  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    // logLevel: 'silent',
    // noInfo: true,
    // clientLogLevel: 'silent',
    stats: 'errors-only'
    // stats: {
    //   colors: true,
    //   hash: false,
    //   version: false,
    //   timings: false,
    //   assets: false,
    //   chunks: false,
    //   modules: false,
    //   reasons: false,
    //   children: false,
    //   source: false,
    //   errors: true,
    //   errorDetails: true,
    //   warnings: true,
    //   publicPath: false
    // }
  })
  app.use(devMiddleware)
  clientCompiler.hooks.done.tap('done', stats => {
    stats = stats.toJson()
    if (stats.errors.length) {
      // stats.errors.forEach(err => console.error(err))
      // stats.warnings.forEach(err => console.warn(err))
      return
    }

    clientManifest = JSON.parse(readFile(
      devMiddleware.fileSystem,
      'vue-ssr-client-manifest.json',
      clientConfig.output.path
    ))
    update()
  })

  // hot middleware
  app.use(webpackHotMiddleware(clientCompiler, { heartbeat: 5000/* , log: false */ }))

  // watch and update server renderer
  const serverCompiler = Webpack(serverConfig)
  const mfs = new MFS()
  serverCompiler.outputFileSystem = mfs
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    stats = stats.toJson()
    // stats为编译过的文件
    if (stats.errors.length) return
    // read bundle generated by vue-ssr-webpack-plugin
    bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json', clientConfig.output.path))
    update()
  })

  return { readyPromise, fs: devMiddleware.fileSystem }
}
