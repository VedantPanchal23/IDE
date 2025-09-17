import FileSystemService from './FileSystemService'

class AutoSaveService {
  constructor() {
    this.autoSaveEnabled = true
    this.autoSaveInterval = 5000 // 5 seconds default
    this.pendingSaves = new Map() // fileId -> timeout
    this.saveQueue = new Map() // fileId -> file data
    this.callbacks = new Map() // fileId -> callback functions
    this.lastSavedContent = new Map() // fileId -> content hash
  }

  // Enable/disable auto-save
  setAutoSaveEnabled(enabled) {
    this.autoSaveEnabled = enabled
    
    if (!enabled) {
      // Clear all pending saves
      this.pendingSaves.forEach(timeout => clearTimeout(timeout))
      this.pendingSaves.clear()
    }
    
    // Notify callbacks about setting change
    this.notifySettingChange('enabled', enabled)
  }

  // Set auto-save interval (in milliseconds)
  setAutoSaveInterval(interval) {
    this.autoSaveInterval = Math.max(1000, interval) // Minimum 1 second
    this.notifySettingChange('interval', this.autoSaveInterval)
  }

  // Schedule auto-save for a file
  scheduleAutoSave(userId, file, onSaveStart, onSaveComplete, onSaveError) {
    if (!this.autoSaveEnabled || !file.id) return

    // Store callbacks
    this.callbacks.set(file.id, {
      onSaveStart,
      onSaveComplete,
      onSaveError
    })

    // Clear existing timeout for this file
    if (this.pendingSaves.has(file.id)) {
      clearTimeout(this.pendingSaves.get(file.id))
    }

    // Check if content has actually changed
    const contentHash = this.hashContent(file.content || '')
    const lastHash = this.lastSavedContent.get(file.id)
    
    if (lastHash === contentHash) {
      // Content hasn't changed, no need to save
      return
    }

    // Store the file in save queue
    this.saveQueue.set(file.id, { userId, file })

    // Schedule the save
    const timeout = setTimeout(() => {
      this.performAutoSave(file.id)
    }, this.autoSaveInterval)

    this.pendingSaves.set(file.id, timeout)
  }

  // Cancel auto-save for a file
  cancelAutoSave(fileId) {
    if (this.pendingSaves.has(fileId)) {
      clearTimeout(this.pendingSaves.get(fileId))
      this.pendingSaves.delete(fileId)
    }
    
    this.saveQueue.delete(fileId)
    this.callbacks.delete(fileId)
  }

  // Force immediate save for a file
  async forceSave(userId, file) {
    if (!file.id) return false

    try {
      const callbacks = this.callbacks.get(file.id)
      
      if (callbacks?.onSaveStart) {
        callbacks.onSaveStart(file)
      }

      await FileSystemService.updateFile(userId, file.id, {
        content: file.content,
        lastModified: new Date().toISOString()
      })

      // Update saved content hash
      this.lastSavedContent.set(file.id, this.hashContent(file.content || ''))

      // Clear pending save
      this.cancelAutoSave(file.id)

      if (callbacks?.onSaveComplete) {
        callbacks.onSaveComplete(file)
      }

      return true
    } catch (error) {
      console.error('Force save error:', error)
      
      const callbacks = this.callbacks.get(file.id)
      if (callbacks?.onSaveError) {
        callbacks.onSaveError(file, error)
      }
      
      return false
    }
  }

  // Perform the actual auto-save
  async performAutoSave(fileId) {
    const saveData = this.saveQueue.get(fileId)
    if (!saveData) return

    const { userId, file } = saveData
    const callbacks = this.callbacks.get(fileId)

    try {
      if (callbacks?.onSaveStart) {
        callbacks.onSaveStart(file)
      }

      await FileSystemService.updateFile(userId, file.id, {
        content: file.content,
        lastModified: new Date().toISOString()
      })

      // Update saved content hash
      this.lastSavedContent.set(fileId, this.hashContent(file.content || ''))

      // Clean up
      this.pendingSaves.delete(fileId)
      this.saveQueue.delete(fileId)

      if (callbacks?.onSaveComplete) {
        callbacks.onSaveComplete(file)
      }

    } catch (error) {
      console.error('Auto-save error:', error)
      
      // Clean up
      this.pendingSaves.delete(fileId)
      this.saveQueue.delete(fileId)

      if (callbacks?.onSaveError) {
        callbacks.onSaveError(file, error)
      }
    }
  }

  // Save all pending files immediately
  async saveAll(userId) {
    const savePromises = []
    
    for (const [fileId, saveData] of this.saveQueue) {
      if (saveData.userId === userId) {
        savePromises.push(this.forceSave(userId, saveData.file))
      }
    }

    const results = await Promise.allSettled(savePromises)
    
    return {
      successful: results.filter(r => r.status === 'fulfilled' && r.value).length,
      failed: results.filter(r => r.status === 'rejected' || !r.value).length,
      total: results.length
    }
  }

  // Check if a file has unsaved changes
  hasUnsavedChanges(fileId) {
    return this.pendingSaves.has(fileId) || this.saveQueue.has(fileId)
  }

  // Get list of files with unsaved changes
  getUnsavedFiles() {
    const unsavedFiles = []
    
    for (const [fileId, saveData] of this.saveQueue) {
      unsavedFiles.push({
        id: fileId,
        name: saveData.file.name,
        path: saveData.file.path || saveData.file.name
      })
    }
    
    return unsavedFiles
  }

  // Get auto-save status for a file
  getAutoSaveStatus(fileId) {
    return {
      enabled: this.autoSaveEnabled,
      pending: this.pendingSaves.has(fileId),
      queued: this.saveQueue.has(fileId),
      interval: this.autoSaveInterval
    }
  }

  // Hash content to detect changes
  hashContent(content) {
    let hash = 0
    if (content.length === 0) return hash
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return hash
  }

  // Get auto-save settings
  getSettings() {
    return {
      enabled: this.autoSaveEnabled,
      interval: this.autoSaveInterval,
      pendingCount: this.pendingSaves.size,
      queuedCount: this.saveQueue.size
    }
  }

  // Update settings
  updateSettings(settings) {
    if (settings.enabled !== undefined) {
      this.setAutoSaveEnabled(settings.enabled)
    }
    
    if (settings.interval !== undefined) {
      this.setAutoSaveInterval(settings.interval)
    }
  }

  // Subscribe to setting changes
  onSettingChange(callback) {
    if (!this.settingChangeCallbacks) {
      this.settingChangeCallbacks = []
    }
    
    this.settingChangeCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.settingChangeCallbacks.indexOf(callback)
      if (index > -1) {
        this.settingChangeCallbacks.splice(index, 1)
      }
    }
  }

  // Notify setting change callbacks
  notifySettingChange(setting, value) {
    if (this.settingChangeCallbacks) {
      this.settingChangeCallbacks.forEach(callback => {
        try {
          callback(setting, value)
        } catch (error) {
          console.error('Setting change callback error:', error)
        }
      })
    }
  }

  // Handle page unload - try to save pending changes
  handlePageUnload() {
    if (this.saveQueue.size > 0) {
      // Show browser warning about unsaved changes
      return 'You have unsaved changes. Are you sure you want to leave?'
    }
  }

  // Cleanup when service is destroyed
  destroy() {
    // Clear all timeouts
    this.pendingSaves.forEach(timeout => clearTimeout(timeout))
    this.pendingSaves.clear()
    
    // Clear all data
    this.saveQueue.clear()
    this.callbacks.clear()
    this.lastSavedContent.clear()
    
    // Clear callbacks
    if (this.settingChangeCallbacks) {
      this.settingChangeCallbacks.length = 0
    }
  }

  // Initialize auto-save service
  init() {
    // Handle page unload
    window.addEventListener('beforeunload', (e) => {
      const message = this.handlePageUnload()
      if (message) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    })

    // Handle visibility change (save when tab becomes hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.saveQueue.size > 0) {
        // Try to save all pending changes when tab becomes hidden
        const userIds = new Set()
        this.saveQueue.forEach(saveData => userIds.add(saveData.userId))
        
        userIds.forEach(userId => {
          this.saveAll(userId).catch(error => {
            console.error('Auto-save on visibility change failed:', error)
          })
        })
      }
    })
  }
}

export default new AutoSaveService()
