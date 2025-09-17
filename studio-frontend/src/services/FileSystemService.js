import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'

class FileSystemService {
  constructor() {
    this.autoSaveInterval = null
  }

  // Get current user ID
  getCurrentUserId() {
    return auth.currentUser?.uid
  }

  // Get user's workspace collection reference
  getUserWorkspaceRef(userId = null) {
    const uid = userId || this.getCurrentUserId()
    if (!uid) throw new Error('User not authenticated')
    return collection(db, 'workspaces', uid, 'files')
  }

  // Get user's workspace metadata reference
  getUserWorkspaceMetaRef(userId = null) {
    const uid = userId || this.getCurrentUserId()
    if (!uid) throw new Error('User not authenticated')
    return doc(db, 'workspaces', uid)
  }

  // Load user's workspace (files and folders)
  async loadUserWorkspace() {
    try {
      const userId = this.getCurrentUserId()
      if (!userId) {
        return { success: false, error: 'User not authenticated' }
      }

      // Load workspace metadata
      const metaRef = this.getUserWorkspaceMetaRef()
      const metaDoc = await getDoc(metaRef)
      
      // Load files
      const filesRef = this.getUserWorkspaceRef()
      const filesQuery = query(filesRef, orderBy('createdAt', 'asc'))
      const filesSnapshot = await getDocs(filesQuery)
      
      const fileTree = []
      filesSnapshot.forEach((doc) => {
        fileTree.push({
          id: doc.id,
          ...doc.data()
        })
      })

      // If no files exist, create default workspace
      if (fileTree.length === 0) {
        const defaultWorkspace = await this.createDefaultWorkspace()
        return defaultWorkspace
      }

      const workspaceMeta = metaDoc.exists() ? metaDoc.data() : {}
      
      return {
        success: true,
        fileTree,
        openTabs: workspaceMeta.openTabs || [],
        activeTabId: workspaceMeta.activeTabId || null
      }
    } catch (error) {
      console.error('Error loading workspace:', error)
      return { success: false, error: error.message }
    }
  }

  // Create default workspace for new users
  async createDefaultWorkspace() {
    try {
      const userId = this.getCurrentUserId()
      if (!userId) throw new Error('User not authenticated')

      const welcomeFile = {
        name: 'welcome.md',
        type: 'file',
        content: `# Welcome to AI-Powered IDE

Welcome to your personal development environment! 🚀

## Getting Started

1. **Create Files**: Right-click in the explorer to create new files
2. **Create Folders**: Organize your code with folders
3. **Code Execution**: Run your code with Ctrl+R
4. **Multi-Language Support**: JavaScript, Python, HTML, CSS, and more!

## Features

- ✨ AI-powered code completion
- 🎨 VS Code-like interface
- 💾 Auto-save functionality
- 🚀 Real-time code execution
- 📁 File management
- 🎯 Multi-language support

Happy coding! 💻
`,
        language: 'markdown',
        parentId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const sampleFile = {
        name: 'app.js',
        type: 'file',
        content: `// Welcome to your IDE!
console.log("Hello, World!");

// This is a sample JavaScript file
function greetUser(name) {
    return \`Hello, \${name}! Welcome to the AI-Powered IDE.\`;
}

const message = greetUser("Developer");
console.log(message);

// Try running this code with Ctrl+R
`,
        language: 'javascript',
        parentId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Create files in Firestore
      const filesRef = this.getUserWorkspaceRef()
      const welcomeRef = doc(filesRef)
      const sampleRef = doc(filesRef)
      
      await setDoc(welcomeRef, welcomeFile)
      await setDoc(sampleRef, sampleFile)

      // Create workspace metadata
      const metaRef = this.getUserWorkspaceMetaRef()
      await setDoc(metaRef, {
        openTabs: [welcomeRef.id],
        activeTabId: welcomeRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return {
        success: true,
        fileTree: [
          { id: welcomeRef.id, ...welcomeFile },
          { id: sampleRef.id, ...sampleFile }
        ],
        openTabs: [welcomeRef.id],
        activeTabId: welcomeRef.id
      }
    } catch (error) {
      console.error('Error creating default workspace:', error)
      return { success: false, error: error.message }
    }
  }

  // Save workspace metadata
  async saveUserWorkspace(workspaceData) {
    try {
      const metaRef = this.getUserWorkspaceMetaRef()
      await updateDoc(metaRef, {
        ...workspaceData,
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error saving workspace:', error)
      return false
    }
  }

  // Create a new file
  async createFile(fileName, content = '', parentFolderId = null) {
    try {
      const filesRef = this.getUserWorkspaceRef()
      const newFileRef = doc(filesRef)
      
      const fileData = {
        name: fileName,
        type: 'file',
        content,
        language: this.getLanguageFromPath(fileName),
        parentId: parentFolderId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(newFileRef, fileData)

      return { 
        success: true, 
        file: { 
          id: newFileRef.id, 
          ...fileData 
        } 
      }
    } catch (error) {
      console.error('Error creating file:', error)
      return { success: false, error: error.message }
    }
  }

  // Create a new folder
  async createFolder(folderName, parentFolderId = null) {
    try {
      const filesRef = this.getUserWorkspaceRef()
      const newFolderRef = doc(filesRef)
      
      const folderData = {
        name: folderName,
        type: 'folder',
        parentId: parentFolderId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(newFolderRef, folderData)

      return { 
        success: true, 
        folder: { 
          id: newFolderRef.id, 
          ...folderData 
        } 
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      return { success: false, error: error.message }
    }
  }

  // Save file content
  async saveFile(fileId, content) {
    try {
      const filesRef = this.getUserWorkspaceRef()
      const fileRef = doc(filesRef, fileId)
      
      await updateDoc(fileRef, {
        content,
        updatedAt: serverTimestamp()
      })

      return true
    } catch (error) {
      console.error('Error saving file:', error)
      return false
    }
  }

  // Delete file or folder
  async deleteItem(itemId, type) {
    try {
      const filesRef = this.getUserWorkspaceRef()
      
      if (type === 'folder') {
        // Delete all children first
        const childrenQuery = query(filesRef, where('parentId', '==', itemId))
        const childrenSnapshot = await getDocs(childrenQuery)
        
        const deletePromises = []
        childrenSnapshot.forEach((doc) => {
          deletePromises.push(deleteDoc(doc.ref))
        })
        
        await Promise.all(deletePromises)
      }
      
      // Delete the item itself
      const itemRef = doc(filesRef, itemId)
      await deleteDoc(itemRef)

      return true
    } catch (error) {
      console.error('Error deleting item:', error)
      return false
    }
  }

  // Rename file or folder
  async renameItem(itemId, newName, type) {
    try {
      const filesRef = this.getUserWorkspaceRef()
      const itemRef = doc(filesRef, itemId)
      
      const updateData = {
        name: newName,
        updatedAt: serverTimestamp()
      }

      if (type === 'file') {
        updateData.language = this.getLanguageFromPath(newName)
      }

      await updateDoc(itemRef, updateData)

      return { 
        success: true, 
        item: { 
          id: itemId, 
          name: newName,
          type,
          language: type === 'file' ? updateData.language : undefined
        } 
      }
    } catch (error) {
      console.error('Error renaming item:', error)
      return { success: false, error: error.message }
    }
  }

  // Helper function to determine language from file path
  getLanguageFromPath(filePath) {
    const ext = filePath.split('.').pop()
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      txt: 'plaintext',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin'
    }
    return languageMap[ext] || 'plaintext'
  }

  // Auto-save functionality
  setupAutoSave(callback, interval = 30000) {
    this.autoSaveInterval = setInterval(callback, interval)
    return this.autoSaveInterval
  }

  clearAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }
}

export default new FileSystemService()
