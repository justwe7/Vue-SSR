import { createApp } from './app'
const isDev = process.env.NODE_ENV !== 'production'
import { applyAsyncData, promisify, sanitizeComponent } from './lib/server/server-render.js'

export default context => {
  // 因为有可能会是异步路由钩子函数或组件，所以我们将返回一个 Promise，
    // 以便服务器能够等待所有的内容在渲染前，
    // 就已经准备就绪。
  return new Promise((resolve, reject) => {
    const s = isDev && Date.now()
    const { app, router, store } = createApp()

    const { url } = context
    const { fullPath } = router.resolve(url).route

    if (fullPath !== url) {
      return reject({ url: fullPath })
    }

    // 设置服务器端 router 的位置
    router.push(context.url) // 根据url传进的 url 直接跳转至路由配置的地址

    // 等到 router 将可能的异步组件和钩子函数解析完
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // 匹配不到的路由，执行 reject 函数，并返回 404
      if (!matchedComponents.length) {
        return reject({ code: 404 })
      }

      // 上下文中定义 asyncData 对象，供applyAsyncData方法融合data和asyncData时使用
      context.asyncData = {}

      // Promise 应该 resolve 应用程序实例，以便它可以渲染
      Promise.all(matchedComponents.map(Component => {
        Component = sanitizeComponent(Component) // 净化组件options

        if (Component.options.asyncData && typeof Component.options.asyncData === 'function') {
          context.asyncDataHook = true
          /* return Component.options.asyncData({
            store,
            route: router.currentRoute,
            context,
            base: 1
          }) */
          /* 将组件定义的asyncData promise化 */
          return promisify(Component.options.asyncData, {
            store,
            route: router.currentRoute,
            context,
            base: 1
          }).then((asyncDataResult = {}) => {
            context.asyncData[Component.cid] = asyncDataResult
            applyAsyncData(Component)
            // applyAsyncData(Component)
            return asyncDataResult
          })
        } else {
          return null
        }
        /* const { asyncData } = Component
        return asyncData({
          store,
          route: router.currentRoute,
          context,
          base: 1
        }) */
      })).then(() => {
        isDev && console.log(`data pre-fetch: ${Date.now() - s}ms`)
        // After all preFetch hooks are resolved, our store is now
        // filled with the state needed to render the app.
        // Expose the state on the render context, and let the request handler
        // inline the state in the HTML response. This allows the client-side
        // store to pick-up the server-side state without having to duplicate
        // the initial data fetching on the client.
        // context.state = store.state
        resolve(app)
      }).catch(reject)
    }, reject)
  })
}