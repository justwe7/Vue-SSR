const fs = require('fs')
const Router = require('koa-router')
const { createBundleRenderer } = require('vue-server-renderer')
const Koa = require('koa')
const resolve = file => require('path').resolve(__dirname, file)

const app = new Koa()
const router = new Router()
// const SSRRender = require('./ssr')
const isProd = process.env.NODE_ENV === 'production'
const middleware = require('./middleware')

/* 中间件 */
middleware(app)

/* --- SSR --- */
let templatePath // 渲染的html模板
let renderer // createBundleRenderer() 创建的实例
let readyPromise // 开发环境，等待服务启动的异步标识
let devFs // 开发环境，虚拟内存系统
const HTML_404 = fs.readFileSync(resolve('../public/404.html'), 'utf-8') // 404页面模板
// const HTML_ERROR = fs.readFileSync(resolve('../public/error.html'), 'utf-8') // 服务端异常模板

/* 通用-用于创建 vue-server-renderer/createBundleRenderer 的实例 */
const createRenderer = (serverBundle, options) => {
  // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
  return createBundleRenderer(serverBundle, Object.assign(options, {
    basedir: resolve('../dist'),
    runInNewContext: false
  }))
}

/* 使用 renderer 生成页面string */
const renderHandler = async (ctx) => {
  ctx.tag = `<div>SSR插入: ${ctx.request.header.host}${ctx.request.url}</div>`
  // ctx.foo = 111 // 可以将变量挂载至ctx上下文供vue相关代码获取
  const siteConfig = {
    enableCache: !true // 启用SSR缓存（期望将静态页缓存直接返回）
  }
  ctx.siteConfig = siteConfig
  // 使用 server-render 生成页面
  return renderer.renderToString(ctx)
  /* return new Promise((resolveHtml, reject) => {
    renderer.renderToString(ctx, (err, html) => {
      if (err) {
        reject(err)
        return
      }
      resolveHtml(html)
    })
  }) */
}

/* ssr渲染错误处理 */
const errorHandler = async (err, ctx) => {
  // renderCSRHtml(ctx, devFs)
  const code = err && err.code
  switch (code) {
    // 处理页面返回的重定向
    case 301:
    case 302:
      if (!err.url) {
        ctx.status = 404
        ctx.type = 'html'
        ctx.body = HTML_404
      } else {
        ctx.status = code || 302
        ctx.redirect(err.url)
      }
      break
    case 304:
      ctx.status = 200 // entry-server.js 返回的http状态码304，仅用来标识用于处理LRU缓存，并非真实的缓存
      ctx.set({
        'ssr-cache': '1'
      })
      ctx.type = 'html'
      if (err.body) {
        ctx.body = err.body
      } else {
        renderCSRHtml(ctx, devFs)
      }
      break
    case 404:
      ctx.status = 404
      ctx.type = 'html'
      ctx.body = HTML_404
      break
    default:
      // TODO 渲染异常返回客户端spa模板
      // ctx.status = code || 500
      // ctx.body = HTML_ERROR
      renderCSRHtml(ctx, devFs)
      break
  }
}

/* 输出spa页面模板（区分开发/生产） */
const renderCSRHtml = (ctx, devFs) => {
  ctx.type = 'html'
  if (isProd) {
    ctx.body = fs.readFileSync(resolve('../dist/index.spa.html'), 'utf-8')
  } else {
    const spaHtmlBuffer = devFs.readFileSync(resolve('../dist/index.spa.html'))
    ctx.body = spaHtmlBuffer
    // ctx.body = fs.readFileSync(resolve('../public/index.spa.html'), 'utf-8')
  }
}

if (isProd) {
  templatePath = resolve('../public/index.ssr.html')
  const template = fs.readFileSync(templatePath, 'utf-8')
  const serverBundle = require(resolve('../dist/vue-ssr-server-bundle.json'))
  const clientManifest = require(resolve('../dist/vue-ssr-client-manifest.json'))
  // In production: create server renderer using template and built server bundle.
  // The server bundle is generated by vue-ssr-webpack-plugin.
  renderer = createRenderer(serverBundle, {
    template,
    clientManifest,
    inject: false // 手动资源注入(css、js..) https://ssr.vuejs.org/zh/guide/build-config.html#%E5%AE%A2%E6%88%B7%E7%AB%AF%E9%85%8D%E7%BD%AE-client-config
  })
/* 开发 */
} else {
  templatePath = resolve('../public/index.ssr.html')
  const setupDevServer = require(resolve('../build/setup-dev-server'))(
    app,
    templatePath,
    (bundle, options) => {
      options.inject = false
      renderer = createRenderer(bundle, options)
    }
  )
  readyPromise = setupDevServer.readyPromise
  devFs = setupDevServer.fs
}

router.get('*', async (ctx, next) => {
  try {
    /* 主动降级为SPA渲染 */
    if (ctx._downgrade) {
      ctx.status = 200
      renderCSRHtml(ctx, devFs)
      return
    }
    if (!isProd) {
      await readyPromise
    }
    const html = await renderHandler(ctx)
    ctx.type = 'html'
    ctx.body = html
  } catch (err) {
    console.log('render-error:', err)
    errorHandler(err, ctx)
  }
})

// 加载路由中间件
app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000, '127.0.0.1', () => {
  // console.log('server started')
})
