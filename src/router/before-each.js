
const isServer = process.env.TARGET_ENV === 'server'
let isFirstLoad = true // 是否首次访问系统执行钩子方法

export default function ({ context, router, store }) {
  async function routerBeforeEach (to, from, next) {
    if (isServer) {
      await store.dispatch('fetchUserInfo')
    } else {
      /* 首屏为ssr且成功即跳过客户端定义的钩子避免两端重复执行 */
      if (isFirstLoad && window.__SSR__?.ssr) {
        next()
        return
      }
      await store.dispatch('fetchUserInfo')
    }
    next()
    isFirstLoad = false
  }

  router.beforeEach((to, from, next) => routerBeforeEach(to, from, next).catch(next))
}
