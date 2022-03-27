const koaConnect = require('koa2-connect')
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function(path, options) {
  if (typeof options == 'string') {
    options = { target: options }
  }

  const proxy = createProxyMiddleware(path, options)

  return async function(ctx, next) {
    await koaConnect(proxy)(ctx, next)
  }
}
