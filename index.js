const server = require('express')()
const renderer = require('vue-server-renderer').createRenderer({
  template: require('fs').readFileSync('./index.template.html', 'utf-8')
})
const createApp = require('./src/app')

server.get('*', (req, res) => {
  const context = {
    title: '上下文title',
    tag: `<div>插入的上下文标签</div>`
  }
  const app = createApp({ url: req.url })

  renderer.renderToString(app, context, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error')
      return
    }
    res.end(html)
  })
})

server.listen(8080)
