const koaStatic = require('koa-static')
const path = require('path')
const serve = (path) => koaStatic(path, {
  maxAge: 1000 * 60 * 60 * 24 * 30
})
const ctxTag = require('./context-tag')

module.exports = (app, router) => {
  app.use(serve(
    path.join(__dirname, '../../dist')
  ))
  
  app.use(ctxTag())
}
