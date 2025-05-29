<template>
  <div class="login-container">
    <div class="login-box">
      <h2>تسجيل الدخول</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">اسم المستخدم</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="أدخل اسم المستخدم"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label for="password">كلمة المرور</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="أدخل كلمة المرور"
            autocomplete="current-password"
          />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول' }}
        </button>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="isOffline" class="offline-notice">
          أنت متصل حالياً دون إنترنت. سيتم استخدام البيانات المخزنة محلياً.
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import { dbService } from '../services/db'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isOffline = ref(!navigator.onLine)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    if (navigator.onLine) {
      console.log('Attempting online login...')
      // محاولة تسجيل الدخول عبر الإنترنت
      const user = await apiService.login(username.value, password.value)
      console.log('Login successful, user data:', user)
      
      // حفظ بيانات المستخدم في IndexedDB
      await dbService.updateUser(user)
      console.log('User data saved to IndexedDB')
      
      // تحديث حالة المصادقة
      await authStore.setUser(user)
      console.log('Auth state updated, isAuthenticated:', authStore.isAuthenticated)
      
      // الانتقال إلى الصفحة الرئيسية
      console.log('Attempting navigation to /home...')
      await router.push('/home')
      console.log('Navigation completed')
    } else {
      console.log('Attempting offline login...')
      // محاولة تسجيل الدخول دون اتصال
      const success = await authStore.checkOfflineAuth(username.value, password.value)
      if (success) {
        console.log('Offline login successful, navigating to /home...')
        await router.push('/home')
      } else {
        error.value = 'بيانات الدخول غير صحيحة'
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    error.value = error.message || 'فشل تسجيل الدخول. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'
  } finally {
    loading.value = false
  }
}

// مراقبة حالة الاتصال بالإنترنت
onMounted(async () => {
  // التحقق من وجود جلسة سابقة
  const token = localStorage.getItem('auth_token')
  if (token) {
    try {
      await authStore.initAuth()
      if (authStore.isAuthenticated) {
        await router.push('/home')
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      localStorage.removeItem('auth_token')
    }
  }

  window.addEventListener('online', () => {
    isOffline.value = false
  })
  window.addEventListener('offline', () => {
    isOffline.value = true
  })
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  direction: rtl;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

.error {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
}

.offline-notice {
  color: #856404;
  background-color: #fff3cd;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}
</style> 