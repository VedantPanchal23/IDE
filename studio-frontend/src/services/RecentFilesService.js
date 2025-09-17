import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../config/firebase'

class RecentFilesService {
  constructor() {
    this.maxRecentFiles = 20
  }

  // Get user's recent files
  async getRecentFiles(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to getRecentFiles')
        return []
      }

      const recentFilesRef = doc(db, 'users', userId, 'metadata', 'recentFiles')
      const docSnap = await getDoc(recentFilesRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return data.files || []
      }
      
      // If document doesn't exist (new user), create it with empty structure
      await setDoc(recentFilesRef, {
        files: [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      })
      
      return []
    } catch (error) {
      console.error('Error getting recent files:', error)
      return []
    }
  }

  // Add a file to recent files
  async addRecentFile(userId, file) {
    try {
      if (!userId) {
        console.warn('No userId provided to addRecentFile')
        return []
      }

      const recentFilesRef = doc(db, 'users', userId, 'metadata', 'recentFiles')
      
      const recentFileEntry = {
        id: file.id,
        name: file.name,
        path: file.path || file.name,
        type: file.type,
        workspaceId: file.workspaceId,
        lastOpened: new Date().toISOString(),
        size: file.content?.length || 0
      }

      // Get existing recent files
      const docSnap = await getDoc(recentFilesRef)
      let recentFiles = []
      
      if (docSnap.exists()) {
        recentFiles = docSnap.data().files || []
      }

      // Remove if already exists (to update position)
      recentFiles = recentFiles.filter(rf => rf.id !== file.id)
      
      // Add to beginning
      recentFiles.unshift(recentFileEntry)
      
      // Limit to max recent files
      if (recentFiles.length > this.maxRecentFiles) {
        recentFiles = recentFiles.slice(0, this.maxRecentFiles)
      }

      // Save back to Firestore
      await setDoc(recentFilesRef, {
        files: recentFiles,
        lastUpdated: new Date().toISOString()
      })

      return recentFiles
    } catch (error) {
      console.error('Error adding recent file:', error)
      throw error
    }
  }

  // Remove a file from recent files
  async removeRecentFile(userId, fileId) {
    try {
      if (!userId) {
        console.warn('No userId provided to removeRecentFile')
        return []
      }

      const recentFilesRef = doc(db, 'users', userId, 'metadata', 'recentFiles')
      const docSnap = await getDoc(recentFilesRef)
      
      if (docSnap.exists()) {
        const recentFiles = docSnap.data().files || []
        const updatedFiles = recentFiles.filter(rf => rf.id !== fileId)
        
        await setDoc(recentFilesRef, {
          files: updatedFiles,
          lastUpdated: new Date().toISOString()
        })
        
        return updatedFiles
      }
      
      return []
    } catch (error) {
      console.error('Error removing recent file:', error)
      throw error
    }
  }

  // Clear all recent files
  async clearRecentFiles(userId) {
    try {
      const recentFilesRef = doc(db, 'users', userId, 'metadata', 'recentFiles')
      
      await setDoc(recentFilesRef, {
        files: [],
        lastUpdated: new Date().toISOString()
      })
      
      return []
    } catch (error) {
      console.error('Error clearing recent files:', error)
      throw error
    }
  }

  // Pin/unpin a recent file (pinned files stay at top)
  async togglePinRecentFile(userId, fileId) {
    try {
      const recentFilesRef = doc(db, 'users', userId, 'metadata', 'recentFiles')
      const docSnap = await getDoc(recentFilesRef)
      
      if (docSnap.exists()) {
        const recentFiles = docSnap.data().files || []
        const updatedFiles = recentFiles.map(rf => {
          if (rf.id === fileId) {
            return { ...rf, pinned: !rf.pinned }
          }
          return rf
        })
        
        // Sort: pinned files first, then by lastOpened
        updatedFiles.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1
          if (!a.pinned && b.pinned) return 1
          return new Date(b.lastOpened) - new Date(a.lastOpened)
        })
        
        await setDoc(recentFilesRef, {
          files: updatedFiles,
          lastUpdated: new Date().toISOString()
        })
        
        return updatedFiles
      }
      
      return []
    } catch (error) {
      console.error('Error toggling pin recent file:', error)
      throw error
    }
  }

  // Update file info in recent files (when file is renamed, moved, etc.)
  async updateRecentFile(userId, fileId, updates) {
    try {
      const recentFilesRef = doc(db, 'users', userId, 'metadata', 'recentFiles')
      const docSnap = await getDoc(recentFilesRef)
      
      if (docSnap.exists()) {
        const recentFiles = docSnap.data().files || []
        const updatedFiles = recentFiles.map(rf => {
          if (rf.id === fileId) {
            return { 
              ...rf, 
              ...updates,
              lastOpened: new Date().toISOString()
            }
          }
          return rf
        })
        
        await setDoc(recentFilesRef, {
          files: updatedFiles,
          lastUpdated: new Date().toISOString()
        })
        
        return updatedFiles
      }
      
      return []
    } catch (error) {
      console.error('Error updating recent file:', error)
      throw error
    }
  }

  // Get recent files for a specific workspace
  async getWorkspaceRecentFiles(userId, workspaceId) {
    try {
      const allRecentFiles = await this.getRecentFiles(userId)
      return allRecentFiles.filter(rf => rf.workspaceId === workspaceId)
    } catch (error) {
      console.error('Error getting workspace recent files:', error)
      return []
    }
  }

  // Clean up recent files (remove files that no longer exist)
  async cleanupRecentFiles(userId, existingFiles) {
    try {
      if (!userId) {
        console.warn('No userId provided to cleanupRecentFiles')
        return []
      }

      const recentFiles = await this.getRecentFiles(userId)
      const existingFileIds = new Set(existingFiles.map(f => f.id))
      
      const validRecentFiles = recentFiles.filter(rf => existingFileIds.has(rf.id))
      
      if (validRecentFiles.length !== recentFiles.length) {
        const recentFilesRef = doc(db, 'users', userId, 'metadata', 'recentFiles')
        await setDoc(recentFilesRef, {
          files: validRecentFiles,
          lastUpdated: new Date().toISOString()
        })
      }
      
      return validRecentFiles
    } catch (error) {
      console.error('Error cleaning up recent files:', error)
      return []
    }
  }

  // Get file type icon based on extension
  getFileTypeIcon(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    const iconMap = {
      // Programming languages
      'js': '📄',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '⚛️',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚡',
      'c': '⚡',
      'cs': '🔷',
      'php': '🐘',
      'rb': '💎',
      'go': '🐹',
      'rust': '🦀',
      'swift': '🦉',
      'kt': '📱',
      
      // Web technologies
      'html': '🌐',
      'htm': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'sass': '🎨',
      'less': '🎨',
      'vue': '💚',
      'svelte': '🧡',
      
      // Data formats
      'json': '📋',
      'xml': '📄',
      'yaml': '📄',
      'yml': '📄',
      'csv': '📊',
      'sql': '🗄️',
      
      // Documents
      'md': '📝',
      'txt': '📄',
      'pdf': '📕',
      'doc': '📘',
      'docx': '📘',
      
      // Images
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'svg': '🎨',
      'webp': '🖼️',
      
      // Config files
      'config': '⚙️',
      'conf': '⚙️',
      'ini': '⚙️',
      'env': '🔐',
      'gitignore': '🙈',
      'dockerfile': '🐳',
      'makefile': '🔨',
      'package': '📦',
      'lock': '🔒'
    }
    
    return iconMap[extension] || '📄'
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Format last opened time for display
  formatLastOpened(timestamp) {
    const now = new Date()
    const opened = new Date(timestamp)
    const diffInMinutes = Math.floor((now - opened) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return opened.toLocaleDateString()
  }

  // Initialize new user data
  async initializeNewUser(userId) {
    try {
      if (!userId) {
        console.warn('No userId provided to initializeNewUser')
        return false
      }

      const recentFilesRef = doc(db, 'users', userId, 'metadata', 'recentFiles')
      
      // Check if already initialized
      const docSnap = await getDoc(recentFilesRef)
      if (docSnap.exists()) {
        return true // Already initialized
      }

      // Create initial structure for new user
      await setDoc(recentFilesRef, {
        files: [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        version: '1.0'
      })

      console.log('Initialized recent files for new user:', userId)
      return true
    } catch (error) {
      console.error('Error initializing new user:', error)
      return false
    }
  }

  // Check if user data exists and initialize if needed
  async ensureUserInitialized(userId) {
    try {
      if (!userId) return false

      const recentFilesRef = doc(db, 'users', userId, 'metadata', 'recentFiles')
      const docSnap = await getDoc(recentFilesRef)
      
      if (!docSnap.exists()) {
        return await this.initializeNewUser(userId)
      }
      
      return true
    } catch (error) {
      console.error('Error checking user initialization:', error)
      return false
    }
  }
}

export default new RecentFilesService()
