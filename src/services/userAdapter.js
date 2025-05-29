class UserAdapter {
  constructor(config = {}) {
    this.config = {
      nameSplitter: ' ',
      firstNameIndex: 0,
      lastNameIndex: -1,
      ...config
    }
  }

  adapt(user) {
    const nameParts = user.name.split(this.config.nameSplitter)
    const firstName = nameParts[this.config.firstNameIndex]
    const lastName = nameParts.slice(this.config.lastNameIndex).join(this.config.nameSplitter)

    return {
      ...user,
      firstName,
      lastName
    }
  }

  adaptBatch(users) {
    return users.map(user => this.adapt(user))
  }
}

// Create default adapter instance
export const defaultAdapter = new UserAdapter()

// Export the class for custom configurations
export { UserAdapter } 