// router.js
import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

// import Home from '../views/home.vue';
// import Detail from '../views/detail.vue';

export default new Router({
  mode: 'history',
  routes: [
    // { path: '/', component: Home },
    // { path: '/detail', component: Detail }
    { path: '/', component: () => import(/* webpackChunkName: "home" */ '../views/home.vue') },
    { path: '/detail', component: () => import(/* webpackChunkName: "detail" */ '../views/detail.vue') }
  ]
})
