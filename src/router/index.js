import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import { useAuthStore } from '../stores/auth'

console.log('Router configuration starting...')

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

console.log('Router created with routes:', routes)

// Navigation guard
router.beforeEach(async (to, from, next) => {
  console.log('Navigation guard triggered:', { to: to.path, from: from.path })
  const authStore = useAuthStore()
  console.log('Initial auth state:', { isAuthenticated: authStore.isAuthenticated })
  
  await authStore.initAuth()
  console.log('After initAuth:', { isAuthenticated: authStore.isAuthenticated })
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Auth required but not authenticated, redirecting to login')
    next('/')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('Guest required but authenticated, redirecting to home')
    next('/home')
  } else {
    console.log('Navigation allowed')
    next()
  }
})

console.log('Router configuration completed')

export default router 