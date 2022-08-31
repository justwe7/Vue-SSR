import Vue from 'vue'
import App from './app.vue'
import router from './router'
import store from './store'
import './style.scss'

Vue.prototype.$store = store

window.$vvm = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
