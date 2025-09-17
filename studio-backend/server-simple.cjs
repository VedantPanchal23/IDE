const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fs = require('fs').promises
const path = require('path')
const CodeExecutionService = require('./src/services/CodeExecutionService.cjs')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

const codeExecutor = new CodeExecutionService()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// In-memory storage for demo (in production, use a real database)
let users = new Map()
let userWorkspaces = new Map()
let fileIdCounter = 1

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Create default workspace for new users
const createDefaultWorkspace = (userId) => {
  const defaultFiles = [
    {
      id: fileIdCounter++,
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
      lastModified: new Date().toISOString()
    },
    {
      id: fileIdCounter++,
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
      lastModified: new Date().toISOString()
    }
  ]

  return {
    fileTree: defaultFiles,
    openTabs: [defaultFiles[0].id],
    activeTabId: defaultFiles[0].id
  }
}

// Authentication Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = {
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    }

    users.set(email, user)

    // Create default workspace
    userWorkspaces.set(user.id, createDefaultWorkspace(user.id))

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = users.get(email)
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = users.get(req.user.email)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  })
})

// Workspace Routes

// Get user's workspace
app.get('/api/workspace', authenticateToken, (req, res) => {
  const workspace = userWorkspaces.get(req.user.userId)
  
  if (!workspace) {
    // Create default workspace if none exists
    const newWorkspace = createDefaultWorkspace(req.user.userId)
    userWorkspaces.set(req.user.userId, newWorkspace)
    return res.json(newWorkspace)
  }

  res.json(workspace)
})

// Save workspace
app.post('/api/workspace', authenticateToken, (req, res) => {
  const { fileTree, openTabs, activeTabId } = req.body
  
  userWorkspaces.set(req.user.userId, {
    fileTree: fileTree || [],
    openTabs: openTabs || [],
    activeTabId: activeTabId || null,
    lastModified: new Date().toISOString()
  })

  res.json({ success: true })
})

// File Management Routes

// Create file
app.post('/api/files', authenticateToken, (req, res) => {
  try {
    const { path, content = '', parentFolderId, type } = req.body
    const workspace = userWorkspaces.get(req.user.userId)
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    const newFile = {
      id: fileIdCounter++,
      name: path.split('/').pop(),
      type: 'file',
      content,
      language: getLanguageFromPath(path),
      parentId: parentFolderId,
      lastModified: new Date().toISOString()
    }

    workspace.fileTree.push(newFile)
    userWorkspaces.set(req.user.userId, workspace)

    res.json(newFile)
  } catch (error) {
    console.error('Error creating file:', error)
    res.status(500).json({ error: 'Failed to create file' })
  }
})

// Create folder
app.post('/api/folders', authenticateToken, (req, res) => {
  try {
    const { path, parentFolderId } = req.body
    const workspace = userWorkspaces.get(req.user.userId)
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    const newFolder = {
      id: fileIdCounter++,
      name: path.split('/').pop(),
      type: 'folder',
      parentId: parentFolderId,
      lastModified: new Date().toISOString()
    }

    workspace.fileTree.push(newFolder)
    userWorkspaces.set(req.user.userId, workspace)

    res.json(newFolder)
  } catch (error) {
    console.error('Error creating folder:', error)
    res.status(500).json({ error: 'Failed to create folder' })
  }
})

// Update file content
app.put('/api/files/:id', authenticateToken, (req, res) => {
  try {
    const { content } = req.body
    const fileId = parseInt(req.params.id)
    const workspace = userWorkspaces.get(req.user.userId)
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    const file = workspace.fileTree.find(item => item.id === fileId && item.type === 'file')
    if (!file) {
      return res.status(404).json({ error: 'File not found' })
    }

    file.content = content
    file.lastModified = new Date().toISOString()
    userWorkspaces.set(req.user.userId, workspace)

    res.json({ success: true })
  } catch (error) {
    console.error('Error updating file:', error)
    res.status(500).json({ error: 'Failed to update file' })
  }
})

// Delete file or folder
app.delete('/api/files/:id', authenticateToken, (req, res) => {
  try {
    const itemId = parseInt(req.params.id)
    const workspace = userWorkspaces.get(req.user.userId)
    
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' })
    }

    // Remove item and all its children
    const removeItem = (id) => {
      workspace.fileTree = workspace.fileTree.filter(item => {
        if (item.id === id) {
          return false
        }
        if (item.parentId === id) {
          removeItem(item.id)
          return false
        }
        return true
      })
    }

    removeItem(itemId)
    userWorkspaces.set(req.user.userId, workspace)

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

// Helper function to determine language from file path
const getLanguageFromPath = (filePath) => {
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
    txt: 'plaintext'
  }
  return languageMap[ext] || 'plaintext'
}

// Legacy API Routes (for backward compatibility, will be removed)

// Code execution endpoint
app.post('/api/code/execute', async (req, res) => {
  const { code, language, input = '' } = req.body
  
  try {
    const result = await codeExecutor.executeCode(code, language, input)
    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      output: '',
      error: error.message,
      executionTime: 0
    })
  }
})

// Project execution endpoint
app.post('/api/project/run', async (req, res) => {
  const { projectType, files } = req.body
  
  try {
    const result = await codeExecutor.executeProject(projectType, files)
    res.json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      output: '',
      error: error.message,
      executionTime: 0
    })
  }
})

// Get supported languages
app.get('/api/code/languages', (req, res) => {
  res.json({
    languages: codeExecutor.getSupportedLanguages()
  })
})

// Code formatting endpoint
app.post('/api/code/format', async (req, res) => {
  const { code, language } = req.body
  
  try {
    const formattedCode = await formatCode(code, language)
    res.json({
      success: true,
      code: formattedCode
    })
  } catch (error) {
    res.json({
      success: false,
      code: code,
      error: error.message
    })
  }
})

// AI Completion endpoint
app.post('/api/ai/complete', (req, res) => {
  const { code, language, cursor } = req.body
  
  // Simple AI completion simulation
  const completions = getAICompletions(code, language, cursor)
  
  res.json({ completions })
})

// AI Chat endpoint
app.post('/api/ai/chat', (req, res) => {
  const { message, context } = req.body
  
  // Simple AI chat simulation
  const response = getAIResponse(message, context)
  
  res.json({ response })
})

// Terminal command execution (simulated)
app.post('/api/terminal/execute', (req, res) => {
  const { command, cwd } = req.body
  
  // Simulate terminal command execution
  const result = executeTerminalCommand(command, cwd)
  
  res.json(result)
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('joinProject', (projectId) => {
    socket.join(projectId)
    console.log(`User ${socket.id} joined project ${projectId}`)
  })
  
  socket.on('codeEdit', (data) => {
    // Broadcast code changes to other users in the same project
    socket.to(data.projectId).emit('codeChange', data)
  })
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Helper functions

function getAICompletions(code, language, cursor) {
  // Simple AI completion simulation
  const completions = []
  
  if (language === 'javascript' || language === 'typescript') {
    if (code.includes('console.')) {
      completions.push('log()', 'error()', 'warn()', 'info()')
    }
    if (code.includes('useState')) {
      completions.push('const [state, setState] = useState()')
    }
    if (code.includes('useEffect')) {
      completions.push('useEffect(() => {}, [])')
    }
  }
  
  return completions
}

function getAIResponse(message, context) {
  // Simple AI chat simulation
  const responses = {
    'help': 'I can help you with coding, debugging, and answering questions about your project.',
    'debug': 'To debug your code, try adding console.log statements or using the browser debugger.',
    'optimize': 'Consider using React.memo for components that dont need frequent re-renders.',
    'default': 'Im here to help! Ask me about coding, debugging, or improving your project.'
  }
  
  const lowerMessage = message.toLowerCase()
  
  for (const key in responses) {
    if (lowerMessage.includes(key)) {
      return responses[key]
    }
  }
  
  return responses.default
}

function executeTerminalCommand(command, cwd) {
  // Simple terminal command simulation
  const cmd = command.toLowerCase().trim()
  
  if (cmd === 'ls' || cmd === 'dir') {
    return {
      success: true,
      output: 'node_modules  package.json  public  README.md  src  vite.config.js',
      exitCode: 0
    }
  } else if (cmd.startsWith('npm install')) {
    return {
      success: true,
      output: 'Packages installed successfully (simulated)',
      exitCode: 0
    }
  } else if (cmd.startsWith('git')) {
    return {
      success: true,
      output: 'Git command executed (simulated)',
      exitCode: 0
    }
  } else if (cmd === 'clear') {
    return {
      success: true,
      output: '',
      clear: true,
      exitCode: 0
    }
  } else {
    return {
      success: false,
      output: `'${command}' is not recognized as an internal or external command.`,
      exitCode: 1
    }
  }
}

async function formatCode(code, language) {
  // Basic code formatting (can be enhanced with prettier, eslint, etc.)
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
    case 'jsx':
    case 'tsx':
      return formatJavaScript(code)
    case 'json':
      return JSON.stringify(JSON.parse(code), null, 2)
    case 'css':
      return formatCSS(code)
    case 'html':
      return formatHTML(code)
    default:
      return code
  }
}

function formatJavaScript(code) {
  // Basic JavaScript formatting
  try {
    // Simple indentation fix
    const lines = code.split('\n')
    let indentLevel = 0
    const formatted = lines.map(line => {
      const trimmed = line.trim()
      if (trimmed.includes('}')) indentLevel--
      const indented = '  '.repeat(Math.max(0, indentLevel)) + trimmed
      if (trimmed.includes('{')) indentLevel++
      return indented
    })
    return formatted.join('\n')
  } catch (error) {
    return code
  }
}

function formatCSS(code) {
  // Basic CSS formatting
  return code
    .replace(/\{/g, ' {\n  ')
    .replace(/\}/g, '\n}\n')
    .replace(/;/g, ';\n  ')
    .replace(/,/g, ',\n  ')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('\n')
}

function formatHTML(code) {
  // Basic HTML formatting
  let indentLevel = 0
  const lines = code.split('\n')
  
  return lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('</')) indentLevel--
    const indented = '  '.repeat(Math.max(0, indentLevel)) + trimmed
    if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
      indentLevel++
    }
    return indented
  }).join('\n')
}

server.listen(PORT, () => {
  console.log(`VS Code Studio Server running on port ${PORT}`)
  console.log(`Frontend should connect to: http://localhost:${PORT}`)
})
