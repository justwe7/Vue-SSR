## vue-ssr学习

### 基本接入
1. 安装 `npm install vue vue-server-renderer`
   - vue-server-renderer 和 vue 必须匹配版本。
   - vue-server-renderer 依赖一些 Node.js 原生模块，因此只能在 Node.js 中使用。
2. 

### 一、初始
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

### 二、与服务器集成
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


### 三、加入页面模板
创建一个页面模板 `index.template.html`
```html
<!DOCTYPE html>
<html lang="en">
  <head><title>{{title}}</title></head>
  <body>
    {{{tag}}}
    <!--vue-ssr-outlet-->
  </body>
</html>

```
> 注意 <!--vue-ssr-outlet--> 注释 -- 这里将是应用程序 HTML 标记注入的地方。

`index.js`：我们可以读取和传输文件到 Vue renderer 中：
```js
const Vue = require('vue')
const server = require('express')()
const renderer = require('vue-server-renderer').createRenderer({
  template: require('fs').readFileSync('./index.template.html', 'utf-8')
})

server.get('*', (req, res) => {
  const context = { // 注入到页面中的上下文对象
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
```
> 也可以与 Vue 应用程序实例共享 context 对象，允许模板插值中的组件动态地注册数据。
> 此外，模板支持一些高级特性，例如：
>
> - 在使用 *.vue 组件时，自动注入「关键的 CSS(critical CSS)」；
> - 在使用 clientManifest 时，自动注入「资源链接(asset links)和资源预加载提示(resource hints)」；
> - 在嵌入 Vuex 状态进行客户端融合(client-side hydration)时，自动注入以及 XSS 防御。
> 在之后的指南中介绍相关概念时，我们将详细讨论这些。