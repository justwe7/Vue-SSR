const fs = require('fs')
const express = require('express')
const server = express()
const path = require('path')
// const renderer = require('vue-server-renderer').createRenderer({
//   template: require('fs').readFileSync('./index.template.html', 'utf-8')
// })
const { createBundleRenderer } = require('vue-server-renderer')
const bundle = require('../dist/vue-ssr-server-bundle.json') // 用于服务端渲染的渲染数据
const clientManifest = require('../dist/vue-ssr-client-manifest.json') // 用于客户端的渲染数据

// const createApp = require('./src/app')

const renderer = createBundleRenderer(bundle, {
  runInNewContext: false,
  template: fs.readFileSync('./public/index.template.html', 'utf-8'),
  clientManifest
})

function renderToString(context) {
  return new Promise((resolve, reject) => {
    renderer.renderToString(context, (err, html) => {
      if (err) {
        reject(err)
        return
      }
      resolve(html)
    })
  })
}

const resolve = file => path.resolve(__dirname, file)
const serve = (path, cache) =>
  express.static(resolve(path), {
    maxAge: cache ? 1000 * 60 * 60 * 24 * 30 : 0
  })

/* 定义静态目录，否则会导致所有文件都通过vue-router来查找 */
server.use('/css', express.static(resolve('../dist/css')))
server.use('/js', express.static(resolve('../dist/js')))

server.get('*', async (req, res) => {
  const context = {
    url: req.url,
    title: '上下文title',
    tag: `<div>SSR插入的标签</div>`
  }

  try {
    console.log(context)
    const html = await renderToString(context)
    res.send(html)
  } catch (error) {
    console.log(error)
    res.status(500).end('Internal Server Error')
  }
})

server.listen(3000)
