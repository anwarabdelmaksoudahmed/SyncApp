import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW()
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  }
})

const app = createApp(App)
app.use(router)
app.mount('#app')
