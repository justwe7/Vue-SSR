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

#### 2. webpack 引入基础的loader

##### babel-loader
`npm i babel-loader@7 babel-core babel-preset-env -D`
然后在 webpack.base.conf.js 的 module.rules 中新增如下对象：
```js
{
  test: /\.js$/,
  use: 'babel-loader',
  exclude: /node_modules/
}
```
我们还需要添加一个配置文件（.babelrc）在根目录下：
```js
{
  "presets": [
    ["env", {
      "modules": false,
      "targets": {
        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
      }
    }]
  ]
}
```

#####  vue-loader
`npm i vue-loader css-loader vue-style-loader vue-template-compiler -D`

然后我们配置 webpack.base.conf.js，写入以下代码到该文件的 module.rules 属性当中：
```
{
  test: /\.vue$/,
  loader: 'vue-loader'
},
{
  test: /\.css$/,
  use: ['vue-style-loader', 'css-loader']
}
```

只有这一处配置是不行的，根据 vue-loader 官网的说明，我们还需要配置一个插件，然后还需要配置 resolve.alias 别名，不然 Webpack 没法找到 Vue 模块。
配置插件，首先在文件头部引入：

`const VueLoaderPlugin = require('vue-loader/lib/plugin');`

然后在 plugins 数组中添加这个插件对象：

`new VueLoaderPlugin()`

随后我们还要配置别名，将 resolve.alias 配置为如下对象：

```js
{
  'vue$': 'vue/dist/vue.esm.js',
  '@': path.resolve(__dirname, '../src'),
}
```

这可以使得 Webpack 很方便的找到 Vue，我们在 JavaScript 文件中引入依赖的时候，也可以方便地使用 @ 来代替 src，省去了写文件路径的麻烦。


##### 验证是否可用
修改`src/index.js`： 
```js
import Vue from 'vue'
import App from './App'

new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
```
然后在同级目录下创建一个 App.vue 文件，内容如下：
```html
<template>
  <h1>Hello World!</h1>
</template>

<script>
  export default {
    name: 'App'
  }
</script>

<style>
  html, body {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    font-size: 16px;
  }
</style>
```

哦对了！`index.template.html` 也要加一个节点 `<div id="app"></div>`

然后执行 `npm run dev`

终于成功啦！

![hello](https://img.lihx.top/images/2020/03/12/image.png)

webpack配置暂时先到这里，目前的目标是能打包`.vue`即可。后续的优化照着[这里继续](https://juejin.im/post/5bc30d5fe51d450ea1328877)

### pre 五、避免状态单例
> 当编写纯客户端 (client-only) 代码时，我们习惯于每次在新的上下文中对代码进行取值。但是，Node.js 服务器是一个长期运行的进程。当我们的代码进入该进程时，它将进行一次取值并留存在内存中。这意味着如果创建一个单例对象，它将在每个传入的请求之间共享。

> 如基本示例所示，我们为每个请求创建一个新的根 Vue 实例。这与每个用户在自己的浏览器中使用新应用程序的实例类似。如果我们在多个请求之间使用一个共享的实例，很容易导致交叉请求状态污染 (cross-request state pollution)。

创建 `src/app.js`:
```js
// app.js
const Vue = require('vue')

module.exports = function createApp(context) {
  return new Vue({
    data: {
      url: context.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  })
}
```
修改 `index.js`，如下:
```js
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
```

### 五、SSR初步结合webpack源码

#### SSR项目要webpack打包出什么样的代码
首先明确概念，webpack仅用于打包开发的代码，生产环境并不用webpack-dev-server来运行。而是使用比如 `express/koa` 等服务来运行http服务，由 `vue-server-renderer` 来处理打包出的代码渲染出html，由 `express` 输出给用户。路由全部交由vue-router来控制，只需要 `express` 将 `request.url` 传给上下文， `router` 通过函数式来控制即可

webpack打包时会打出两个bundle
- vue-ssr-server-bundle.json 是用于服务端渲染的渲染数据
- vue-ssr-client-manifest.json 是用于客户端的渲染数据

在express服务中由 `vue-server-renderer` 模块处理以上两个 bundle，最终输出给用户html。**Vue-SSR还有客户端激活的过程**，指的是 Vue 在浏览器端接管由服务端发送的静态 HTML，使其变为由 Vue 管理的动态 DOM 的过程。这个是区分于传统多页应用的差别，即有首屏服务端的渲染快速响应，后续SPA体验，集两种模式的优点。

先做两个页面简版的SSR，目录结构和代码都有变更：
```
src
├── components
│   ├── Foo.vue
│   ├── Bar.vue
├── public
│   ├── index.spa.html      # 开发环境SPA的模板
│   └── index.template.html # 生产环境打包SSR的模板
├── App.vue
├── app.js # 通用 entry(universal entry)
├── entry-client.js # 仅运行于浏览器
└── entry-server.js # 仅运行于服务器
```

#### 先改改webpack打包vue的代码，工厂模式
**路由定义 src\router\index.js**
```js
// router.js
import Vue from 'vue'
import Router from 'vue-router'
import Foo from '../components/Foo.vue'
import Bar from '../components/Bar.vue'
Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    routes: [
      { path: '/', component: Foo },
      { path: '/Bar', component: Bar }
    ]
  })
}
```

**输出vue实例的工厂函数也要变 src\app.js**
```js
// app.js
import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'

export function createApp () {
  // 创建 router 实例
  const router = createRouter()

  const app = new Vue({
    // 注入 router 到根 Vue 实例
    router,
    render: h => h(App)
  })

  // 返回 app 和 router
  return { app, router }
}
```

**先试下是否可以正确运行 entry-client.js**
> 需要注意的是，你仍然需要在挂载 app 之前调用 router.onReady，因为路由器必须要提前解析路由配置中的异步组件，才能正确地调用组件中可能存在的路由钩子。
```js
// entry-client.js
import { createApp } from './app'

const { app, router } = createApp()

router.onReady(() => {
  app.$mount('#app')
})
```
然后改一下 `build/webpack.base.conf.js`，将 `entry` 改为 `entry-client.js` 文件，执行一下 `npm run dev`。项目还是可以正常运行的

说明客户端渲染没问题，vue代码也是可以正常运行的。接下来接入SSR打包

#### 打包双bundle-捡重要的记录

修改一下 `build/webpack.base.conf.js`：
```js
// 加入两个webpack plugin分别区分环境打双端的包
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const IN_SERVER = process.env.WEBPACK_TARGET === 'server' // 通过 cross-env 来控制环境变量
const webpackEntry = IN_SERVER ? 'server' : 'client'
// webpack的入口文件也要通过环境来动态区分
entry: {
  bundle: resolve(`../src/entry-${webpackEntry}.js`)
}
// 插件也是通过环境区分使用
plugins: [
  IN_SERVER ? new VueSSRServerPlugin() : new VueSSRClientPlugin()
]
```

中间遇到一个小插曲，添加如下webpack配置，也是官网建议要使用的：
```js
// https://webpack.js.org/configuration/externals/#function
// https://github.com/liady/webpack-node-externals
// 外置化应用程序依赖模块。可以使服务器构建速度更快，
// 并生成较小的 bundle 文件。
config.externals = nodeExternals({
  // 不要外置化 webpack 需要处理的依赖模块。
  // 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
  // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
  whitelist: /\.css$/
})
```
导致最终打包出的 `client-bundle` 模块化全是 `commonjs` 标准的，先暂时只在SSR打包时才有此配置。(:todo:)。

然后 `package.json` 也是要改的。直接看 `commit` 记录的相应代码即可

#### 打包&运行
1. 以上配置更改后，可以执行 `npm run publish`，`dist` 下应该会生成两个 json 文件，还有静态文件，html。
2. 此时服务端渲染的两个 bundle 已经准备好了

修改 `index.js`，即 `express` 运行的入口文件：
```js
const fs = require('fs')
const express = require('express')
const server = express()
const path = require('path')
const { createBundleRenderer } = require('vue-server-renderer')
const bundle = require('./dist/vue-ssr-server-bundle.json') // 用于服务端渲染的渲染数据
const clientManifest = require('./dist/vue-ssr-client-manifest.json') // 用于客户端的渲染数据

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
server.use('/css', express.static(resolve('./dist/css')))
server.use('/js', express.static(resolve('./dist/js')))

server.get('*', async (req, res) => {
  const context = {
    url: req.url,
    title: '上下文title',
    tag: `<div>SSR插入的标签</div>`
  }

  try {
    const html = await renderToString(context)
    res.send(html)
  } catch (error) {
    console.log(error)
    res.status(500).end('Internal Server Error')
  }
})

server.listen(8080)

```

然后启动 `express` 服务， `node ./index.js`，浏览器打开 `http://127.0.0.1:8080/`，切换页面效果

![ssr](https://img.lihx.top/images/2020/03/13/20200313_113958.gif)


查看源码可以看到直接输出了vue组件中的代码：

![source](https://img.lihx.top/images/2020/03/13/image.png)

万里长征终于迈出了第二步~
