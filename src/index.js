import Vue from 'vue'
import App from './App'

const foo = 1
console.log(foo)

const bar = v => v * 2

const baz = bar(3)
console.log(baz)

new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
