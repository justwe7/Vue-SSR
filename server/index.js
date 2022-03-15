const Koa = require('koa')
const app = new Koa()
const SSRRender = require('./ssr')

SSRRender(app)

app.listen(3000, '127.0.0.1', () => {
  console.log('server started')
})