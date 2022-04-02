
const fs = require('fs')
const Router = require('koa-router')
const { createBundleRenderer } = require('vue-server-renderer')
const resolve = file => require('path').resolve(__dirname, file)

const router = new Router()
// const Router = require('@koa/router')
const isProd = process.env.NODE_ENV === 'production'

let templatePath // 渲染的html模板
let renderer // createBundleRenderer() 创建的实例
let readyPromise // 开发环境，等待服务启动的异步标识

/* 通用-用于创建 vue-server-renderer/createBundleRenderer 的实例 */
const createRenderer = (serverBundle, options) => {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return createBundleRenderer(serverBundle, Object.assign(options, {
    basedir: resolve('../../dist'),
    runInNewContext: false // 推荐
    // template: fs.readFileSync('./public/index.ssr.html', 'utf-8'), // 与require不同，fs模块取运行指令时目录的pwd
    // clientManifest // （可选）客户端构建 manifest
  }))
}

/* 生产环境 */
/* const serverBundle = require(resolve('../../dist/vue-ssr-server-bundle.json'))
const clientManifest = require(resolve('../../dist/vue-ssr-client-manifest.json'))
renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false, // 推荐
  template: fs.readFileSync('./public/index.ssr.html', 'utf-8'), // 与require不同，fs模块取运行指令时目录的pwd
  clientManifest // （可选）客户端构建 manifest
}) */

/* 使用 renderer 生成页面string */
const render = async (ctx) => {
  return new Promise((resolve, reject) => {
    ctx.tag = `<div>SSR插入: ${ctx.request.header.host}${ctx.request.url}</div>`
    // 使用 server-render 生成页面
    renderer.renderToString(ctx, (err, html) => {
      if (err) {
        reject(err)
        return
      }
      resolve(html)
    })
  })
}

module.exports = (app) => {
  if (isProd) {
    templatePath = resolve('../../public/index.ssr.html')
    const template = fs.readFileSync(templatePath, 'utf-8')
    const serverBundle = require(resolve('../../dist/vue-ssr-server-bundle.json'))
    const clientManifest = require(resolve('../../dist/vue-ssr-client-manifest.json'))
    // In production: create server renderer using template and built server bundle.
    // The server bundle is generated by vue-ssr-webpack-plugin.
    renderer = createRenderer(serverBundle, {
      template,
      clientManifest
      // inject: false
    })
  /* 开发 */
  } else {
    templatePath = resolve('../../public/index.ssr.html')
    const setupDevServer = require(resolve('../../build/setup-dev-server'))(
      app,
      templatePath,
      (bundle, options) => {
        // options.inject = false
        renderer = createRenderer(bundle, options)
      }
    )
    readyPromise = setupDevServer.readyPromise
    // devFs = setupDevServer.fs
  }

  router.get('*', async (ctx, next) => {
    try {
      if (!isProd) {
        await readyPromise
      }
      const html = await render(ctx)
      ctx.type = 'html'
      ctx.body = html
    } catch (err) {
      console.log('render-error:', err)
      // ctx.throw(500)
      ctx.status = 500
      ctx.body = 'Internal Server Error'
    }
  })

  app
    .use(router.routes())
    .use(router.allowedMethods())
}
