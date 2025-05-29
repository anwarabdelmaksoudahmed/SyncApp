import { openDB } from 'idb'

const DB_NAME = 'userSyncDB'
const DB_VERSION = 1
const STORES = {
  USERS: 'users',
  AUTH: 'auth'
}

class DBService {
  constructor() {
    this.db = null
    this.init()
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create users store
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' })
          userStore.createIndex('username', 'username', { unique: true })
        }

        // Create auth store
        if (!db.objectStoreNames.contains(STORES.AUTH)) {
          db.createObjectStore(STORES.AUTH, { keyPath: 'id' })
        }
      }
    })
  }

  async saveAuthData(userData) {
    return this.save(STORES.AUTH, { id: 'current', ...userData })
  }

  async getAuthData() {
    return this.get(STORES.AUTH, 'current')
  }

  async clearAuthData() {
    return this.delete(STORES.AUTH, 'current')
  }

  async updateUser(user) {
    return this.save(STORES.USERS, user)
  }

  async getUserByUsername(username) {
    const store = this.getStore(STORES.USERS, 'readonly')
    const index = store.index('username')
    return new Promise((resolve, reject) => {
      const request = index.get(username)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllUsers() {
    return this.getAll(STORES.USERS)
  }

  async save(storeName, data) {
    const store = this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(data)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async get(storeName, key) {
    const store = this.getStore(storeName, 'readonly')
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName) {
    const store = this.getStore(storeName, 'readonly')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName, key) {
    const store = this.getStore(storeName, 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  getStore(storeName, mode) {
    return this.db.transaction(storeName, mode).objectStore(storeName)
  }
}

export const dbService = new DBService() 