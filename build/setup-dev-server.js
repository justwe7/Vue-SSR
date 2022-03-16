const Webpack = require('webpack')
const fs = require('fs')
const path = require('path')
const MFS = require('memory-fs') // 从内存读取文件
const chokidar = require('chokidar')
const clientConfig = require('./webpack.client')
const serverConfig = require('./webpack.server')
const cp = require('child_process')
const resolve = file => path.resolve(__dirname, file)

const webpackDevMiddleware = require('./koa-webpack-dev-middleware')
const webpackHotMiddleware = require('./koa-webpack-hot-middleware')

// const mfs = new MFS()
// mfs.mkdirpSync("/Users/debugger/bugfolder/www/github/Vue-SSR/dist")
// console.log(path.join(clientConfig.output.path, 'vue-ssr-server-bundle.json'))
// console.log(mfs.readFileSync(path.join(clientConfig.output.path, 'vue-ssr-server-bundle.json')))
// console.log(mfs.readFileSync('/Users/debugger/bugfolder/www/github/Vue-SSR/dist/vue-ssr-server-bundle.json'))
// return false
// console.log(fs.readFileSync(path.join(clientConfig.output.path, 'vue-ssr-server-bundle.json')))
// readFile(mfs, 'vue-ssr-server-bundle.json')

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  } catch (e) {}
}

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

  // modify client config to work with hot middleware
  // clientConfig.entry.app = [
  //   // resolveCli('./node_modules/webpack-hot-middleware/client'),
  //   'webpack-hot-middleware/client',
  //   ...clientConfig.entry.bundle
  // ]
  // clientConfig.output.filename = '[name].js'
  clientConfig.plugins.push(
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin()
  )

  // dev middleware
  const clientCompiler = Webpack(clientConfig)
  const devMiddleware = webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    stats: {
      colors: true,
      assets: false,
      chunks: false,
      modules: false
    }
  })
  app.use(devMiddleware)
  clientCompiler.hooks.done.tap('done', stats => {
    stats = stats.toJson()
    if (stats.errors.length) return
    clientManifest = JSON.parse(readFile(
      devMiddleware.fileSystem,
      'vue-ssr-client-manifest.json'
    ))
    update()
  })

  // hot middleware
  app.use(webpackHotMiddleware(clientCompiler, { heartbeat: 5000, log: false }))

  // watch and update server renderer
  // fork了一个子进程
  const child = cp.fork(path.join(__dirname, './server-compiler.js'), {
    cwd: resolve('./')
  })

  child.on('message', res => {
    switch (res.type) {
      case 'bundle':
        // res.data即为bundle信息
        bundle = res.data
        update()
        break
      case 'log':
        console.log(res.data)
        break
      default:
        if (res.data) {
          if (res.data.length) {
            console.log('----- 💣 server compiler error 💣 -----')
            console.log('\x1B[31m' + '%s' + '\x1B[39m', ...res.data)
          } else {
            console.error(res.data)
          }
        } else {
          console.error(res)
        }
    }
  })
  child.on('error', err => {
    console.log('server build error:', err)
  })

  return { readyPromise, fs: devMiddleware.fileSystem }
}
