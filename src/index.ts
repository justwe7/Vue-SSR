import { createApp } from 'vue' // Vue 3.x 引入 vue 的形式
import App from './app.vue'
import './style.scss'
import router from './router'
// import a from './assets/img/avatar.jpg'
// console.log(a)
// console.log(111)

// document.addEventListener('click', () => {
//   console.log(12580)
// })

// const waitTime = (delay = 300) => new Promise((resolve) => setTimeout(resolve, delay))

// waitTime(4396).then(async () => {
//   await waitTime(7777)
//   console.log(9527)
// })


const app = createApp(App) // 通过 createApp 初始化 app
app.use(router)
app.mount('#app') // 将页面挂载到 root 节点
