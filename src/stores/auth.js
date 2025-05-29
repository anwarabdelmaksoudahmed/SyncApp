import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dbService } from '../services/db'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const setUser = async (userData) => {
    user.value = userData
    isAuthenticated.value = true
    // حفظ بيانات المستخدم في IndexedDB
    await dbService.saveAuthData(userData)
  }

  const clearUser = async () => {
    user.value = null
    isAuthenticated.value = false
    // حذف بيانات المصادقة من IndexedDB
    await dbService.clearAuthData()
  }

  const initAuth = async () => {
    try {
      // محاولة استرجاع بيانات المصادقة من IndexedDB
      const authData = await dbService.getAuthData()
      if (authData) {
        user.value = authData
        isAuthenticated.value = true
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
        const isValid = await verifyPassword(password, user.password)
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