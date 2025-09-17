import { BrowserEventEmitter } from '../events/BrowserEventEmitter.js';

/**
 * File Service - Manages file operations and file system interactions
 * Provides file CRUD operations, file watching, and workspace management
 */
export class FileService extends BrowserEventEmitter {
  constructor() {
    super();
    this.files = new Map(); // filename -> file content
    this.fileTree = [];
    this.workspace = null;
    this.openFiles = new Set();
    this.isInitialized = false;
  }

  async initialize(workspacePath = null) {
    if (this.isInitialized) return;
    
    this.workspace = workspacePath || 'default-workspace';
    
    // Load default sample files
    await this.loadSampleWorkspace();
    
    this.isInitialized = true;
    this.emit('initialized');
  }

  async loadSampleWorkspace() {
    // Create sample JavaScript project
    const sampleFiles = {
      'package.json': JSON.stringify({
        "name": "sample-project",
        "version": "1.0.0",
        "main": "index.js",
        "scripts": {
          "start": "node index.js",
          "dev": "nodemon index.js"
        },
        "dependencies": {
          "express": "^4.18.0"
        }
      }, null, 2),
      
      'index.js': `const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello World!', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  res.json(users);
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`,

      'README.md': `# Sample Project

A simple Express.js application for testing the IDE.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

## Features

- Express.js server
- JSON API endpoints
- Static file serving
- Error handling

## API Endpoints

- \`GET /\` - Hello World message
- \`GET /api/users\` - List of users
`,

      'src/utils.js': `// Utility functions

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};`,

      'src/config.js': `// Application configuration

const config = {
  development: {
    port: 3000,
    database: 'mongodb://localhost:27017/dev-db',
    logLevel: 'debug'
  },
  
  production: {
    port: process.env.PORT || 8080,
    database: process.env.DATABASE_URL,
    logLevel: 'error'
  },
  
  test: {
    port: 3001,
    database: 'mongodb://localhost:27017/test-db',
    logLevel: 'silent'
  }
};

const env = process.env.NODE_ENV || 'development';

export default config[env];`,

      'public/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Sample App</h1>
        <p>This is a sample application built with Express.js</p>
        <button onclick="fetchUsers()">Load Users</button>
        <div id="users"></div>
    </div>

    <script>
        async function fetchUsers() {
            try {
                const response = await fetch('/api/users');
                const users = await response.json();
                const usersList = document.getElementById('users');
                usersList.innerHTML = users.map(user => 
                    \`<p>\${user.name} - \${user.email}</p>\`
                ).join('');
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }
    </script>
</body>
</html>`,

      '.gitignore': `node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
dist/
build/
coverage/
.nyc_output/
.DS_Store
Thumbs.db`,

      'src/middleware/auth.js': `// Authentication middleware

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // In a real app, verify the JWT token here
  console.log('Token verification would happen here');
  next();
};

export const authorize = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};`
    };

    // Store files in memory
    for (const [filename, content] of Object.entries(sampleFiles)) {
      this.files.set(filename, content);
    }

    // Create file tree structure
    this.fileTree = this.buildFileTree(Object.keys(sampleFiles));
    
    this.emit('workspaceLoaded', { files: this.files, fileTree: this.fileTree });
  }

  buildFileTree(filePaths) {
    const tree = [];
    const pathMap = new Map();

    for (const filePath of filePaths) {
      const parts = filePath.split('/');
      let currentLevel = tree;
      let currentPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        let existingNode = currentLevel.find(node => node.name === part);
        
        if (!existingNode) {
          const isFile = i === parts.length - 1;
          existingNode = {
            id: currentPath,
            name: part,
            type: isFile ? 'file' : 'folder',
            path: currentPath,
            children: isFile ? undefined : [],
            expanded: false
          };
          currentLevel.push(existingNode);
          pathMap.set(currentPath, existingNode);
        }
        
        if (!existingNode.children) continue;
        currentLevel = existingNode.children;
      }
    }

    return tree;
  }

  getFileContent(filePath) {
    return this.files.get(filePath) || '';
  }

  async readFile(filePath) {
    return this.files.get(filePath) || '';
  }

  saveFile(filePath, content) {
    this.files.set(filePath, content);
    this.emit('fileChanged', { filePath, content });
    return true;
  }

  createFile(filePath, content = '') {
    if (this.files.has(filePath)) {
      throw new Error(`File ${filePath} already exists`);
    }
    
    this.files.set(filePath, content);
    this.updateFileTree();
    this.emit('fileCreated', { filePath, content });
    return true;
  }

  deleteFile(filePath) {
    if (!this.files.has(filePath)) {
      throw new Error(`File ${filePath} does not exist`);
    }
    
    this.files.delete(filePath);
    this.updateFileTree();
    this.emit('fileDeleted', { filePath });
    return true;
  }

  renameFile(oldPath, newPath) {
    if (!this.files.has(oldPath)) {
      throw new Error(`File ${oldPath} does not exist`);
    }
    
    if (this.files.has(newPath)) {
      throw new Error(`File ${newPath} already exists`);
    }
    
    const content = this.files.get(oldPath);
    this.files.delete(oldPath);
    this.files.set(newPath, content);
    this.updateFileTree();
    this.emit('fileRenamed', { oldPath, newPath });
    return true;
  }

  updateFileTree() {
    this.fileTree = this.buildFileTree(Array.from(this.files.keys()));
    this.emit('fileTreeUpdated', this.fileTree);
  }

  getFileTree() {
    return this.fileTree;
  }

  getAllFiles() {
    return Array.from(this.files.entries()).map(([path, content]) => ({
      path,
      content,
      language: this.getLanguageFromPath(path)
    }));
  }

  getLanguageFromPath(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'txt': 'plaintext',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'php': 'php',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'go': 'go',
      'rs': 'rust',
      'sql': 'sql'
    };
    return languageMap[ext] || 'plaintext';
  }

  searchInFiles(query, options = {}) {
    const { caseSensitive = false, regex = false, fileFilter = null } = options;
    const results = [];
    
    for (const [filePath, content] of this.files.entries()) {
      if (fileFilter && !fileFilter(filePath)) continue;
      
      let searchContent = content;
      let searchQuery = query;
      
      if (!caseSensitive && !regex) {
        searchContent = content.toLowerCase();
        searchQuery = query.toLowerCase();
      }
      
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let searchLine = caseSensitive ? line : line.toLowerCase();
        
        let matches;
        if (regex) {
          try {
            const regexPattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
            matches = [...line.matchAll(regexPattern)];
          } catch (e) {
            continue;
          }
        } else {
          matches = [];
          let index = searchLine.indexOf(searchQuery);
          while (index !== -1) {
            matches.push({
              index,
              '0': line.substr(index, query.length)
            });
            index = searchLine.indexOf(searchQuery, index + 1);
          }
        }
        
        for (const match of matches) {
          results.push({
            filePath,
            line: i + 1,
            column: match.index + 1,
            text: line.trim(),
            match: match[0]
          });
        }
      }
    }
    
    return results;
  }

  dispose() {
    this.files.clear();
    this.fileTree = [];
    this.openFiles.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export default new FileService();
