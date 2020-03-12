## vue-ssr学习
一步一步从0开始敲一个vue-ssr项目

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

### 编写通用代码
**总结：**

- 将数据进行响应式的过程在服务器上是多余的，所以默认情况下禁用。禁用响应式数据，还可以避免将「数据」转换为「响应式对象」的性能开销。
- 只有 beforeCreate 和 created 会在服务器端渲染 (SSR) 过程中被调用。这就是说任何其他生命周期钩子函数中的代码只会在客户端执行。
- 通用代码不可接受特定平台的 API。像 window 或 document，这种仅浏览器可用的全局变量
- 大多数自定义指令直接操作 DOM，因此会在服务器端渲染 (SSR) 过程中导致错误

[文档指出需要关注的点](https://ssr.vuejs.org/zh/guide/universal.html)

> 请将副作用代码移动到 beforeMount 或 mounted 生命周期中。例如在其中使用 setInterval 设置 timer

**Vue代码优化的点，在mounted钩子中`this.xxx = 1`不会加入到响应式对象**

### 四、开始接入webpack打包vue

#### 1. 先加webpack打包，不加`vue-loader`

1. 安装webpack `npm i webpack webpack-cli -D`
2. 创建webpack配置文件：
   - 创建 build 目录
   - `touch webpack.base.conf.js webpack.dev.conf.js webpack.prod.conf.js build.js`
   - >webpack.base.conf.js 是最基础的打包配置，是开发环境和生产环境都要用到的配置。webpack.dev.conf.js 就是在开发环境要使用的配置。webpack.prod.conf.js 就是在生产环境要使用的配置了。build.js 是通过 Node 接口进行打包的脚本

`build/build.js`代码：
```js
webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    // 在这里处理错误
    console.error(err)
    return
  }
  // 处理完成
  console.log(
    stats.toString({
      chunks: false, // 使构建过程更静默无输出
      colors: true // 在控制台展示颜色
    })
  )
})
```

`build/webpack.base.conf.js`代码：
```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  entry: {
    bundle: path.resolve(__dirname, '../src/index.js')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].[hash].js'
  },
  module: {
    rules: []
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../index.template.html')
    })
  ]
}

```

`build/webpack.dev.conf.js`代码：
```js
const merge = require('webpack-merge')
const path = require('path')
const baseConfig = require('./webpack.base.conf')
module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.resolve(__dirname, '../dist'),
    open: true
  }
})
```

`build/webpack.prod.conf.js`代码：

[clean-webpack-plugin V2有改动](https://github.com/johnagan/clean-webpack-plugin/issues/106)
```js
const merge = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const path = require('path')
const baseConfig = require('./webpack.base.conf')
module.exports = merge(baseConfig, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: []
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
})
```

创建 `src/index.js`,内容就: `console.log(1)` 好了

`npm run dev` 可以看到浏览器控制台有打印 1。

`npm run build` 可以看到dist目录打包代码成功