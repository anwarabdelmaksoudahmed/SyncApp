import { openDB } from 'idb'

const DB_NAME = 'userSyncDB'
const DB_VERSION = 1
const USER_STORE = 'users'
const AUTH_STORE = 'auth'

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(USER_STORE)) {
      const userStore = db.createObjectStore(USER_STORE, { keyPath: 'id' })
      userStore.createIndex('username', 'username', { unique: true })
    }
    
    if (!db.objectStoreNames.contains(AUTH_STORE)) {
      db.createObjectStore(AUTH_STORE, { keyPath: 'id' })
    }
  }
})

export const dbService = {
  async addUser(user) {
    const db = await dbPromise
    return db.add(USER_STORE, user)
  },

  async updateUser(user) {
    const db = await dbPromise
    return db.put(USER_STORE, user)
  },

  async getUser(id) {
    const db = await dbPromise
    return db.get(USER_STORE, id)
  },

  async getUserByUsername(username) {
    const db = await dbPromise
    const tx = db.transaction(USER_STORE, 'readonly')
    const index = tx.store.index('username')
    return index.get(username)
  },

  async getAllUsers() {
    const db = await dbPromise
    return db.getAll(USER_STORE)
  },

  async deleteUser(id) {
    const db = await dbPromise
    return db.delete(USER_STORE, id)
  },

  async clearUsers() {
    const db = await dbPromise
    return db.clear(USER_STORE)
  },

  async saveAuthData(authData) {
    const db = await dbPromise
    return db.put(AUTH_STORE, { id: 'current', ...authData })
  },

  async getAuthData() {
    const db = await dbPromise
    return db.get(AUTH_STORE, 'current')
  },

  async clearAuthData() {
    const db = await dbPromise
    return db.delete(AUTH_STORE, 'current')
  }
} 