## vue-ssr学习

### 一、基本接入
1. 安装 `npm install vue vue-server-renderer`
   - vue-server-renderer 和 vue 必须匹配版本。
   - vue-server-renderer 依赖一些 Node.js 原生模块，因此只能在 Node.js 中使用。
2. 

### 二、初始
- 创建一个index.js

```js
// 第 1 步：创建一个 Vue 实例
const Vue = require('vue')
const app = new Vue({
  template: `<div>Hello World</div>`
})

// 第 2 步：创建一个 renderer
const renderer = require('vue-server-renderer').createRenderer()

// 第 3 步：将 Vue 实例渲染为 HTML
renderer.renderToString(app, (err, html) => {
  if (err) throw err
  console.log(html)
  // => <div data-server-rendered="true">Hello World</div>
})

// 在 2.5.0+，如果没有传入回调函数，则会返回 Promise：
renderer.renderToString(app).then(html => {
  console.log(html)
}).catch(err => {
  console.error(err)
})
```

- 执行 `node ./index.js` 可以在控制台看到输出
```html
<div data-server-rendered="true">Hello World</div>
```

### 三、与服务器集成
更改 `index.js`
```js
const Vue = require('vue')
const server = require('express')()
const renderer = require('vue-server-renderer').createRenderer()

server.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  })

  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end('Internal Server Error')
      return
    }
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>${html}</body>
      </html>
    `)
  })
})

server.listen(8080)
```
执行 `node ./index.js`，打开浏览器查看页面 `http://localhost:8080/vuessr`

页面展示：

![页面展示](https://img.lihx.top/images/2020/03/11/image.png)

查看源码：

![查看源码](https://img.lihx.top/images/2020/03/11/image09713.png)