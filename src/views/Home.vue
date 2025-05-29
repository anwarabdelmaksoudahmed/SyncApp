<template>
  <div class="home-container">
    <header class="header">
      <h1>User Management</h1>
      <button @click="handleLogout" class="logout-btn">Logout</button>
    </header>

    <div class="sync-status" v-if="syncStatus">
      <p :class="{ 'error': syncError }">{{ syncStatus }}</p>
    </div>

    <div class="users-container">
      <div v-for="user in users" :key="user.id" class="user-card">
        <h3>{{ user.firstName }} {{ user.lastName }}</h3>
        <p class="email">{{ maskEmail(user.email) }}</p>
        <p class="username">Username: {{ user.username }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Syncing users...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import { dbService } from '../services/db'

const router = useRouter()
const authStore = useAuthStore()

const users = ref([])
const loading = ref(false)
const syncStatus = ref('')
const syncError = ref(false)
let syncInterval = null

const adaptUserData = (user) => {
  const [firstName, lastName] = user.name.split(' ')
  return {
    ...user,
    firstName,
    lastName
  }
}

const maskEmail = (email) => {
  const [username, domain] = email.split('@')
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1)
  return `${maskedUsername}@${domain}`
}

const syncUsers = async () => {
  loading.value = true
  syncStatus.value = 'Syncing users...'
  syncError.value = false

  try {
    let page = 1
    let totalUsers = 0
    const maxPages = 10
    const maxUsers = 1000

    while (page <= maxPages && totalUsers < maxUsers) {
      const data = await apiService.syncUsers(page)
      const adaptedUsers = data.map(adaptUserData)
      
      // Save to IndexedDB
      for (const user of adaptedUsers) {
        await dbService.updateUser(user)
      }

      users.value = [...users.value, ...adaptedUsers]
      totalUsers += adaptedUsers.length

      if (adaptedUsers.length === 0) break
      page++
    }

    syncStatus.value = 'Sync completed successfully'
  } catch (error) {
    console.error('Sync error:', error)
    syncStatus.value = 'Sync failed. Please try again.'
    syncError.value = true
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  authStore.clearUser()
  router.push('/')
}

onMounted(async () => {
  // Initial sync
  await syncUsers()

  // Set up periodic sync
  syncInterval = setInterval(syncUsers, 60000) // Every minute

  // Set up online/offline sync
  window.addEventListener('online', syncUsers)
})

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval)
  window.removeEventListener('online', syncUsers)
})
</script>

<style scoped>
.home-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.sync-status {
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.sync-status .error {
  color: #dc3545;
}

.users-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.user-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.email, .username {
  color: #666;
  margin: 0.25rem 0;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 