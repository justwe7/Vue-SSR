const koaStatic = require('koa-static')
const path = require('path')
const serve = path => koaStatic(path, {
  maxAge: 1000 * 60 * 60 * 24 * 30
})
const ctxTag = require('./context-tag')
const { cacheMiddleware } = require('./cache')
const httpProxy = require('./http-proxy')

module.exports = (app, router) => {
  app.use(serve(
    path.join(__dirname, '../../dist')
  ))
  app.use(httpProxy('/api', { target: 'https://api-puce-rho.vercel.app', changeOrigin: true }))
  app.use(ctxTag())
  app.use(cacheMiddleware)
}
