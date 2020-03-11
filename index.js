const Vue = require('vue')
const server = require('express')()
// const renderer = require('vue-server-renderer').createRenderer()
const renderer = require('vue-server-renderer').createRenderer({
  template: require('fs').readFileSync('./index.template.html', 'utf-8')
})

server.get('*', (req, res) => {
  const context = {
    title: '上下文title',
    tag: `<div>插入的上下文标签</div>`
  }
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>模板访问的 URL 是： {{ url }}</div>`
  })

  renderer.renderToString(app, context, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error')
      return
    }
    res.end(html)
  })
})

server.listen(8080)