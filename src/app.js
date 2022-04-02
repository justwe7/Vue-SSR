import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import App from './app.vue'
import { createRouter } from './router'
import { createStore } from './store'

export function createApp () {
  const router = createRouter()
  const store = createStore()

  // 同步路由状态(route state)到 store
  sync(store, router)
  const app = new Vue({
    router,
    store,
    // 根实例简单的渲染应用程序组件。
    render: h => h(App)
  })
  return { app, router, store }
}
