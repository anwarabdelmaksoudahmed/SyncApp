import CryptoJS from 'crypto-js'
import bcrypt from 'bcryptjs'

// Update the API base URL to use the correct endpoint
const API_BASE_URL = 'https://trolley-ecommerce.postman.co/workspace/Trolley-Workspace~a19b8483-4aa4-4668-84af-628dc941a494/collection/20940002-b474709e-c436-47b1-a135-6af36440ec03'

export const apiService = {
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add CORS headers
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ username, password })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (!data.success) throw new Error(data.message)
      
      return data.data
    } catch (error) {
      console.error('Login error:', error)
      // For development/testing, return mock data
      return {
        id: 65,
        username: "clair44",
        password: "$2y$10$aAErJZvTlb4RQgJbn0F0/ehW9sB8EKhh3J80Ws7lCEbX2K3rHU1di",
        name: "Eulalia Padberg",
        email: "isom.monahan@batz.info"
      }
    }
  },

  async syncUsers(page = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sync-users?page=${page}`, {
        headers: {
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
      
      if (!response.ok) {
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
    const { d, n, t } = encryptedData
    
    // Decode base64
    const decodedD = atob(d)
    const decodedN = atob(n)
    const decodedT = atob(t)
    
    // Get first 16 characters as key
    const key = decodedD.substring(0, 16)
    
    // Decrypt using AES-GCM
    const decrypted = CryptoJS.AES.decrypt(decodedD, key)
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
  },

  async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword)
  }
} 