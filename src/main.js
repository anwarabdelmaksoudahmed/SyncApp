import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

console.log('Application starting...')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

console.log('Mounting application...')
app.mount('#app')
console.log('Application mounted') 