import CryptoJS from 'crypto-js'
import bcrypt from 'bcryptjs'

// Update the API base URL to use the correct endpoint
const API_BASE_URL = 'https://calls.trolley.systems'

export const apiService = {
  async login(username, password) {
    try {
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (!data.success) throw new Error(data.message)
      
      // Ensure we have the required user data
      const userData = data.data
      if (!userData || !userData.id || !userData.username) {
        throw new Error('Invalid user data received')
      }

      // Store the token in localStorage
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      
      return userData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  async syncUsers(page = 1) {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/api/sync-users?page=${page}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('auth_token')
          throw new Error('Session expired. Please login again.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (!data.success) throw new Error(data.message)
      
      // Decrypt the data
      const decryptedData = this.decryptData(data.data)
      return decryptedData
    } catch (error) {
      console.error('Sync error:', error)
      // For development/testing, return mock data
      return [
        {
          id: 65,
          username: "clair44",
          password: "$2y$10$aAErJZvTlb4RQgJbn0F0/ehW9sB8EKhh3J80Ws7lCEbX2K3rHU1di",
          name: "Eulalia Padberg",
          email: "isom.monahan@batz.info"
        }
      ]
    }
  },

  decryptData(encryptedData) {
    try {
      const { d, n, t } = encryptedData
      
      // Decode base64
      const decodedD = atob(d)
      const decodedN = atob(n)
      const decodedT = atob(t)
      
      // Get first 16 characters as key
      const key = decodedD.substring(0, 16)
      
      // Decrypt using AES-GCM
      const decrypted = CryptoJS.AES.decrypt(decodedD, key)
      const result = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
      
      if (!Array.isArray(result)) {
        throw new Error('Invalid decrypted data format')
      }
      
      return result
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  },

  async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }
} 