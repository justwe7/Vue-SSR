const webpackHotMiddleware = require('webpack-hot-middleware')

function middleware (doIt, req, res) {
  const { end: originalEnd } = res
  return new Promise(resolve => {
    res.end = function end () {
      originalEnd.apply(this, arguments)
      resolve(0)
    }
    doIt(req, res, () => {
      resolve(1)
    })
  })
}

module.exports = function (compiler, option) {
  const doIt = webpackHotMiddleware(compiler, option)
  return async function (ctx, next) {
    const { req, res } = ctx
    const runNext = await middleware(doIt, req, res)
    if (runNext) {
      await next()
    }
  }
}
