import { createRouter, createWebHashHistory, createWebHistory, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  // history: createWebHashHistory(),
  routes: [
    { path: '/', component: async () => await import(/* webpackChunkName: "home" */ '../views/home.vue') },
    { path: '/detail', component: async () => await import(/* webpackChunkName: "detail" */ '../views/detail.vue') }
  ]
})

router.beforeEach((to, from) => {

})

export default router
