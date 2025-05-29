import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dbService } from '../services/db'
import { apiService } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const setUser = async (userData) => {
    console.log('Setting user data:', userData)
    user.value = userData
    isAuthenticated.value = true
    localStorage.setItem('user', JSON.stringify(userData))
    // حفظ بيانات المستخدم في IndexedDB
    await dbService.saveAuthData(userData)
    console.log('User data saved to localStorage and IndexedDB')
  }

  const clearUser = async () => {
    console.log('Clearing user data')
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('user')
    // حذف بيانات المصادقة من IndexedDB
    await dbService.clearAuthData()
    console.log('User data cleared from localStorage and IndexedDB')
  }

  const initAuth = async () => {
    try {
      console.log('Initializing auth state')
      // محاولة استرجاع بيانات المصادقة من localStorage
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        user.value = userData
        isAuthenticated.value = true
        console.log('Auth state initialized from localStorage:', { user: userData, isAuthenticated: true })
      } else {
        console.log('No stored user data found')
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    }
  }

  const checkOfflineAuth = async (username, password) => {
    try {
      // البحث عن المستخدم في IndexedDB
      const user = await dbService.getUserByUsername(username)
      if (user) {
        // التحقق من كلمة المرور
        const isValid = await apiService.verifyPassword(password, user.password)
        if (isValid) {
          await setUser(user)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error checking offline auth:', error)
      return false
    }
  }

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser,
    initAuth,
    checkOfflineAuth
  }
}) 