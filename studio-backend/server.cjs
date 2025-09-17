const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const fs = require('fs').promises

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// In-memory file system for demo
let fileSystem = {
  '/src/App.jsx': {
    content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Hello World</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  )
}

export default App`,
    language: 'javascript',
    lastModified: new Date().toISOString()
  },
  '/src/main.jsx': {
    content: `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,
    language: 'javascript',
    lastModified: new Date().toISOString()
  },
  '/package.json': {
    content: `{
  "name": "vscode-studio",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
    language: 'json',
    lastModified: new Date().toISOString()
  },
  '/README.md': {
    content: `# VS Code Studio

A web-based AI-powered IDE that replicates VS Code's UI/UX.

## Features

- Monaco Editor
- File Explorer
- Multiple Tabs
- Resizable Panels
- VS Code Theme
- AI Integration

## Getting Started

1. Start the development server
2. Open your browser to http://localhost:5173
3. Start coding!

## AI Features

- Code completion
- Error detection
- Smart suggestions
- Automated refactoring`,
    language: 'markdown',
    lastModified: new Date().toISOString()
  }
}

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'VS Code Studio API',
    version: '1.0.0',
    status: 'operational',
    message: 'Backend server is running successfully!',
    endpoints: {
      files: '/api/files',
      execute: '/api/execute',
      health: '/health'
    },
    frontend: 'http://localhost:5173',
    timestamp: new Date().toISOString()
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.version
  })
})

// API Routes

// Get file system structure
app.get('/api/files', (req, res) => {
  const structure = buildFileTree()
  res.json(structure)
})

// Get file content
app.get('/api/files/*', (req, res) => {
  const filePath = '/' + req.params[0]
  const file = fileSystem[filePath]
  
  if (!file) {
    return res.status(404).json({ error: 'File not found' })
  }
  
  res.json(file)
})

// Save file content
app.post('/api/files/*', (req, res) => {
  const filePath = '/' + req.params[0]
  const { content, language } = req.body
  
  fileSystem[filePath] = {
    content,
    language: language || 'plaintext',
    lastModified: new Date().toISOString()
  }
  
  // Emit file change to all connected clients
  io.emit('fileChanged', { path: filePath, file: fileSystem[filePath] })
  
  res.json({ success: true, file: fileSystem[filePath] })
})

// Create new file
app.post('/api/files', (req, res) => {
  const { path: filePath, content = '', language = 'plaintext' } = req.body
  
  if (fileSystem[filePath]) {
    return res.status(409).json({ error: 'File already exists' })
  }
  
  fileSystem[filePath] = {
    content,
    language,
    lastModified: new Date().toISOString()
  }
  
  io.emit('fileCreated', { path: filePath, file: fileSystem[filePath] })
  
  res.json({ success: true, file: fileSystem[filePath] })
})

// Delete file
app.delete('/api/files/*', (req, res) => {
  const filePath = '/' + req.params[0]
  
  if (!fileSystem[filePath]) {
    return res.status(404).json({ error: 'File not found' })
  }
  
  delete fileSystem[filePath]
  
  io.emit('fileDeleted', { path: filePath })
  
  res.json({ success: true })
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

// Code Execution API
app.post('/api/execute', async (req, res) => {
  try {
    const { language, code, input = '', options = {} } = req.body
    
    // Validate request
    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: 'Language and code are required'
      })
    }
    
    // Basic JavaScript execution simulation
    if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'js') {
      try {
        // Capture console output
        let output = '';
        const originalLog = console.log;
        console.log = (...args) => {
          output += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n';
          originalLog(...args); // Also log to server console
        };
        
        // Simple eval for demo - in production, use VM2 or similar
        const result = eval(code);
        
        // Restore console.log
        console.log = originalLog;
        
        // Format output properly
        let finalOutput = output.trim();
        if (result !== undefined) {
          const resultStr = typeof result === 'object' ? 
            JSON.stringify(result, null, 2) : String(result);
          finalOutput += (finalOutput ? '\n' : '') + resultStr;
        }
        
        res.json({
          success: true,
          output: finalOutput || '(No output)',
          error: null,
          executionTime: '10ms',
          language: language,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.json({
          success: false,
          output: '',
          error: error.message,
          executionTime: '5ms',
          language: language,
          timestamp: new Date().toISOString()
        })
      }
    } else {
      // For other languages, suggest client-side execution
      res.json({
        success: true,
        output: '',
        error: null,
        executionTime: '0ms',
        language: language,
        executeOnClient: true,
        clientEngine: language === 'python' ? 'pyodide' : 'browser',
        timestamp: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('Code execution error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error during code execution',
      details: error.message
    })
  }
})

// Get supported languages
app.get('/api/execute/languages', (req, res) => {
  res.json({
    success: true,
    languages: [
      { id: 'javascript', name: 'JavaScript', executionMode: 'server' },
      { id: 'typescript', name: 'TypeScript', executionMode: 'server' },
      { id: 'python', name: 'Python', executionMode: 'client' },
      { id: 'html', name: 'HTML', executionMode: 'client' },
      { id: 'css', name: 'CSS', executionMode: 'client' }
    ]
  })
})

// Validate code without executing
app.post('/api/execute/validate', (req, res) => {
  try {
    const { language, code } = req.body
    
    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: 'Language and code are required'
      })
    }
    
    // Basic validation
    if (code.length > 50000) {
      return res.json({
        success: true,
        valid: false,
        error: 'Code too long. Maximum 50000 characters allowed'
      })
    }
    
    res.json({
      success: true,
      valid: true,
      message: 'Code validation passed'
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error during validation'
    })
  }
})

// Get execution service status
app.get('/api/execute/status', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    supportedLanguages: 5,
    languages: ['javascript', 'typescript', 'python', 'html', 'css'],
    timestamp: new Date().toISOString()
  })
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
function buildFileTree() {
  const tree = []
  const folders = new Map()
  
  Object.keys(fileSystem).forEach(path => {
    const parts = path.split('/').filter(Boolean)
    let currentTree = tree
    
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i]
      const folderPath = '/' + parts.slice(0, i + 1).join('/')
      
      let folder = currentTree.find(item => item.name === folderName && item.type === 'folder')
      if (!folder) {
        folder = {
          id: folderPath,
          name: folderName,
          type: 'folder',
          expanded: true,
          children: [],
          path: folderPath
        }
        currentTree.push(folder)
      }
      currentTree = folder.children
    }
    
    const fileName = parts[parts.length - 1]
    currentTree.push({
      id: path,
      name: fileName,
      type: 'file',
      path: path
    })
  })
  
  return tree
}

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

server.listen(PORT, () => {
  console.log(`VS Code Studio Server running on port ${PORT}`)
  console.log(`Frontend should connect to: http://localhost:${PORT}`)
})
