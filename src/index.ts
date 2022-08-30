import { createApp } from 'vue'
import App from './app.vue'
import './style.scss'
import router from './router'

const app = createApp(App) // 通过 createApp 初始化 app
app.use(router)
app.mount('#app')
