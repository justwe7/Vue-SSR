// router.js
import Vue from 'vue'
import Router from 'vue-router'
// import Foo from '../views/Foo.vue'
// import Bar from '../views/Bar.vue'
Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    routes: [
      { path: '/', component: () => import('../views/Foo.vue') },
      { path: '/Bar', component: () => import('../views/Bar.vue') }
    ]
  })
}