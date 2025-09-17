// API Service for communicating with backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('authToken')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    if (response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async logout() {
    const response = await this.request('/auth/logout', { method: 'POST' })
    this.removeToken()
    return response
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/users/profile')
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Project endpoints
  async getProjects() {
    return this.request('/projects')
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}`)
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, { method: 'DELETE' })
  }

  // File endpoints
  async getProjectFiles(projectId) {
    return this.request(`/files/${projectId}`)
  }

  async createFile(fileData) {
    return this.request('/files', {
      method: 'POST',
      body: JSON.stringify(fileData),
    })
  }

  async updateFile(fileId, fileData) {
    return this.request(`/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(fileData),
    })
  }

  async deleteFile(fileId) {
    return this.request(`/files/${fileId}`, { method: 'DELETE' })
  }

  async uploadFile(file, projectId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)

    return this.request('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
      },
    })
  }

  // Token management
  setToken(token) {
    this.token = token
    localStorage.setItem('authToken', token)
  }

  removeToken() {
    this.token = null
    localStorage.removeItem('authToken')
  }

  getToken() {
    return this.token
  }
}

export default new APIService()
