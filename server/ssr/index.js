const fs = require('fs')
const path = require('path')
const Vue = require('vue')
const Router = require('koa-router')
const renderer = require('vue-server-renderer').createRenderer()
const router = new Router()

module.exports = app => {
  router.get('*', async (ctx, next) => {
    const render = async (ctx) => {
      const vm = new Vue({
        data: {
          url: ctx.req.url
        },
        template: `<div>访问的 URL 是： {{ url }}</div>`
      })
      return new Promise((resolve, reject) => {
        renderer.renderToString(vm, (err, html) => {
          console.log(html)
          if (err) {
            reject(err)
            return
          }
          resolve(`
            <!DOCTYPE html>
            <html lang="en">
              <head><title>Hello</title></head>
              <body>${html}</body>
            </html>
          `)
        })
      })
    }

    try {
      const html = await render(ctx)
      ctx.type = 'html'
      ctx.body = html
    } catch (err) {
      ctx.status = 500
      ctx.body = 'Internal Server Error'
    }
  })

  app
    .use(router.routes())
    .use(router.allowedMethods())
}
