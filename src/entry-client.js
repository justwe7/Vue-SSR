import Vue from 'vue'
import { createApp } from './app'
import {
  applyAsyncData,
  hotReloadAPI,
  sanitizeComponent,
  getLocation,
  asyncComponents
} from './lib/server/server-render.js'
import { urlRedirect, errorHandler } from './lib/ssr-utils.js'

const isDev = process.env.NODE_ENV !== 'production'

const { app, router, store } = createApp()

Vue.mixin({
  beforeRouteUpdate (to, from, next) {
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to,
        urlRedirect: urlRedirect(),
        errorHandler
      })
        .then(next)
        .catch(next)
    } else {
      next()
    }
  }
})

// 当使用 template 时，context.state 将作为 window.__INITIAL_STATE__ 状态，自动嵌入到最终的 HTML 中。而在客户端，在挂载到应用程序之前，store 就应该获取到状态：
if (window.__SSR__) {
  // 通过renderState方法将__INITIAL_STATE__替换为了__SSR__
  // store.replaceState(window.__SSR__)
  const { state } = window.__SSR__
  state && store.replaceState(state)
  // state.route = store.state.route // hack实现，否则在replaceState时候会进行pushState操作从而丢弃掉hash值
}

router.onReady(async () => {
  /* SPA与SSR数据融合操作 */
  if (window.__SSR__ && window.__SSR__.ssr) {
    const path = getLocation(router.options.base, router.options.mode)
    const Components = router.getMatchedComponents(router.match(path))
    Components.forEach((c, index) => {
      const asyncDataResult =
        window.__SSR__.asyncDataList && window.__SSR__.asyncDataList[index]
      applyAsyncData(sanitizeComponent(c), asyncDataResult)
    })
    /* 如果是客户端渲染 */
  } else {
    console.warn('客户端渲染')
    const path = getLocation(router.options.base, router.options.mode)
    const Components = router.getMatchedComponents(router.match(path))
    await asyncComponents({
      Components,
      store,
      myAddData: 'client-add-downgrade',
      urlRedirect: urlRedirect(),
      route: router.currentRoute,
      errorHandler
    })
      .then((e) => {
        console.log(e)
      })
      .catch((e) => {})
  }

  // 添加路由钩子函数，用于处理 asyncData.
  // 在初始路由 resolve 后执行，
  // 以便我们不会二次预取(double-fetch)已有的数据。
  // 使用 `router.beforeResolve()`，以便确保所有异步组件都 resolve。
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)

    // 我们只关心非预渲染的组件
    // 所以我们对比它们，找出两个匹配列表的差异组件
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = prevMatched[i] !== c)
    })

    if (!activated.length) {
      return next()
    }

    // 如果是页面参数变化，则activated匹配为空数组，该情况下移步beforeRouterUpdate钩子处理混合
    // 客户端接管状态下asyncData混合
    asyncComponents({
      Components: activated,
      store,
      route: to,
      myAddData: 'client-add',
      urlRedirect: urlRedirect(),
      errorHandler
    })
      .then(() => {
        next()
      })
      .catch((e) => {
        console.error(e)
        next(e)
      })

    // 这里如果有加载指示器 (loading indicator)，就触发
    /* Promise.all(activated.map(c => {
      if (c.asyncData) {
        return c.asyncData({ store, route: to })
      }
    })).then(() => {
      // 停止加载指示器(loading indicator)
      next()
    }).catch(next) */
  })

  app.$mount('#app')

  // 重写含有asyncData函数的父组件的$forceupdate方法，支持开发环境热更新
  if (isDev) {
    Vue.nextTick(() => {
      hotReloadAPI(app, router, store, errorHandler)
    })
  }
})
