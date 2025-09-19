import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useUser } from '../contexts/UserContext'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import TitleBar from '../components/UI/TitleBar'
import ActivityBar from '../components/UI/ActivityBar'
import SideBar from '../components/UI/SideBar'
import EditorGroup from '../components/Editor/EditorGroup'
import StatusBar from '../components/UI/StatusBar'
import Terminal from '../components/Terminal/Terminal'
import CommandPalette from '../components/UI/CommandPalette'
import Breadcrumb from '../components/UI/Breadcrumb'
import DebugToolbar from '../components/UI/DebugToolbar'
import QuickFilePicker from '../components/UI/QuickFilePicker'
import AIService from '../platform/ai/AIService'
import CommandService from '../platform/commands/CommandService'
import { LayoutService, Parts } from '../platform/layout/LayoutService'
import { InstantiationService, ServiceIdentifiers, ServiceCollection } from '../platform/instantiation/InstantiationService'
import { NotificationService } from '../platform/notification/NotificationService'
import { EditorGroupModel } from '../platform/editor/EditorGroupModel'
import * as driveApi from '../services/DriveAPIService';
import JavaScriptExecutionService from '../platform/execution/JavaScriptExecutionService';
import path from 'path-browserify';
import './Workbench.css'

/**
 * Main Workbench Component - Industry-level IDE Architecture
 * Follows VS Code's workbench pattern with professional service-oriented design
 */
const Workbench = () => {
  const { user, token } = useUser();
  // Core IDE State
  const [activeView, setActiveView] = useState('explorer')
  const [openTabs, setOpenTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(null)
  const [fileTree, setFileTree] = useState([])
  const [fileTreeKey, setFileTreeKey] = useState(0) // Add this to force re-renders
  
  // Layout State
  const [zenMode, setZenMode] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [terminalVisible, setTerminalVisible] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [quickFilePickerOpen, setQuickFilePickerOpen] = useState(false)
  const [recentFiles, setRecentFiles] = useState([])
  
  // Debug Session State
  const [isDebugging, setIsDebugging] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [debugSessionId, setDebugSessionId] = useState(null)
  
  // Debug State with sample data for testing
  const [debugVariables, setDebugVariables] = useState({
    counter: 5,
    message: "Hello World",
    isActive: true,
    user: {
      name: "John Doe",
      age: 30,
      settings: {
        theme: "dark",
        language: "en"
      }
    },
    items: [1, 2, 3, 4, 5]
  })
  const [debugCallStack, setDebugCallStack] = useState([
    {
      functionName: "handleClick",
      url: "/src/App.jsx",
      lineNumber: 42,
      columnNumber: 10,
      lineContent: "  const handleClick = () => {"
    },
    {
      functionName: "onClick",
      url: "/src/components/Button.jsx", 
      lineNumber: 15,
      columnNumber: 5,
      lineContent: "    onClick?.();"
    }
  ])
  const [debugWatchExpressions, setDebugWatchExpressions] = useState([
    { expression: "counter", value: 5, error: null },
    { expression: "user.name", value: "John Doe", error: null },
    { expression: "invalidVar", value: undefined, error: "ReferenceError: invalidVar is not defined" }
  ])
  const [debugBreakpoints, setDebugBreakpoints] = useState([
    {
      fileName: "App.jsx",
      lineNumber: 42,
      columnNumber: 10,
      enabled: true,
      lineContent: "  const handleClick = () => {",
      condition: null
    },
    {
      fileName: "Button.jsx",
      lineNumber: 15,
      columnNumber: 5,
      enabled: false,
      lineContent: "    onClick?.();",
      condition: "counter > 3"
    }
  ])
  
  // AI State
  const [aiChatOpen, setAiChatOpen] = useState(false)
  
  // Terminal State
  const [activeTerminalTab, setActiveTerminalTab] = useState('terminal') // 'terminal' or 'execution'
  const [triggerExecution, setTriggerExecution] = useState(false)
  
  // Service References
  const instantiationServiceRef = useRef(null)
  const layoutServiceRef = useRef(null)
  const notificationServiceRef = useRef(null)
  const editorGroupModelRef = useRef(null)
  const executionServiceRef = useRef(null)
  
  // Initialize services
  useEffect(() => {
    if (user && token) {
      initializeWorkbench()
      setupKeyboardShortcuts()
    }
    
    return () => {
      if (user && token) {
        cleanup()
      }
    }
  }, [user, token])

  const initializeWorkbench = async () => {
    try {
      // Initialize Service Collection
      const services = new ServiceCollection()
      
      // Create and register core services
      const instantiationService = new InstantiationService(services)
      instantiationServiceRef.current = instantiationService
      
      const layoutService = new LayoutService()
      layoutServiceRef.current = layoutService
      
      const notificationService = new NotificationService()
      notificationServiceRef.current = notificationService
      
      const editorGroupModel = new EditorGroupModel()
      editorGroupModelRef.current = editorGroupModel
      
      // Initialize JavaScript Execution Service
      await JavaScriptExecutionService.initialize()
      executionServiceRef.current = JavaScriptExecutionService
      
      // Register services
      instantiationService.registerService(ServiceIdentifiers.LAYOUT_SERVICE, layoutService)
      instantiationService.registerService(ServiceIdentifiers.NOTIFICATION_SERVICE, notificationService)
      instantiationService.registerService(ServiceIdentifiers.EDITOR_SERVICE, editorGroupModel)
      instantiationService.registerService(ServiceIdentifiers.EXECUTION_SERVICE, JavaScriptExecutionService)
      
      // Initialize AI Service
      await AIService.initialize()
      instantiationService.registerService(ServiceIdentifiers.AI_SERVICE, AIService)
      
      // Initialize Command Service
      await CommandService.initialize()
      instantiationService.registerService(ServiceIdentifiers.COMMAND_SERVICE, CommandService)
      
      // Setup service event listeners
      setupServiceEventListeners()
      
      // Initialize layout
      layoutService.applyLayout('default')
      
      // Register enhanced commands
      registerEnhancedCommands()
      
      // Load workspace from Google Drive
      loadWorkspaceFromDrive();
      
      // Show success notification
      notificationService.success('Connected to Google Drive', { timeout: 2000 })
      
      console.log('[Workbench] Professional services initialized')
      
    } catch (error) {
      console.error('[Workbench] Initialization failed:', error)
    }
  }

  const loadWorkspaceFromDrive = async () => {
    try {
      console.log('[Workbench] Loading workspace from Google Drive...');
      const driveFiles = await driveApi.listFiles('/');
      const formattedTree = driveFiles.map(file => ({
        ...file,
        path: `/${file.name}`, // Construct a path
        children: file.type === 'folder' ? [] : undefined,
      }));
      setFileTree(formattedTree);
      setFileTreeKey(prev => prev + 1); // Force re-render
      console.log('[Workbench] Workspace loaded from Google Drive');
    } catch (error) {
      console.error('[Workbench] Failed to load workspace from Drive:', error);
      
      // Check if we're in demo mode or backend is unavailable
      const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || window.location.search.includes('demo=true');
      const isConnectionError = error.message.includes('Failed to fetch') || error.name === 'TypeError';
      
      if (isDemoMode || isConnectionError) {
        console.log('[Workbench] Using demo/fallback data instead of Google Drive');
        
        // Provide sample file tree for demo/offline mode
        const sampleFileTree = [
          {
            name: 'Welcome.md',
            type: 'file',
            path: '/Welcome.md',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'src',
            type: 'folder',
            path: '/src',
            children: [
              {
                name: 'App.js',
                type: 'file',
                path: '/src/App.js',
                size: 512,
                lastModified: new Date().toISOString(),
              },
              {
                name: 'index.js',
                type: 'file',
                path: '/src/index.js',
                size: 256,
                lastModified: new Date().toISOString(),
              },
              {
                name: 'components',
                type: 'folder',
                path: '/src/components',
                children: []
              }
            ]
          },
          {
            name: 'package.json',
            type: 'file',
            path: '/package.json',
            size: 1024,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'README.md',
            type: 'file',
            path: '/README.md',
            size: 2048,
            lastModified: new Date().toISOString(),
          }
        ];
        
        setFileTree(sampleFileTree);
        setFileTreeKey(prev => prev + 1);
        console.log('[Workbench] Demo workspace loaded successfully');
        
        notificationServiceRef.current?.info('Running in demo mode - using sample workspace');
      } else {
        notificationServiceRef.current?.error('Failed to load workspace from Google Drive.');
      }
    }
  };

  // Force refresh the entire workspace from root
  const forceRefreshWorkspace = useCallback(async () => {
    try {
      notificationServiceRef.current?.info('Refreshing workspace...');
      await loadWorkspaceFromDrive();
      notificationServiceRef.current?.success('Workspace refreshed successfully');
    } catch (error) {
      console.error('Force refresh failed:', error);
      notificationServiceRef.current?.error('Failed to refresh workspace');
    }
  }, []);

  const openFile = async (file) => {
    try {
      let fileContent = '';
      
      try {
        // Try to read from Google Drive API first
        fileContent = await driveApi.readFile(file.path);
      } catch (apiError) {
        console.log('[Workbench] Google Drive API unavailable, using demo content for:', file.name);
        
        // Provide demo content based on file type
        const extension = file.name.split('.').pop()?.toLowerCase();
        fileContent = getDemoFileContent(file.name, extension);
      }
      
      const tab = {
        id: file.path,
        name: file.name, // Ensure name is passed
        content: fileContent,
        language: getLanguageFromExtension(file.name),
        isDirty: false,
        path: file.path
      };
      
      // Add tab if not already open
      setOpenTabs(prev => {
        const exists = prev.find(t => t.id === tab.id);
        if (exists) {
          setActiveTabId(tab.id);
          return prev;
        }
        return [...prev, tab];
      });
      
      setActiveTabId(tab.id);
      console.log('[Workbench] File opened successfully:', file.name);
    } catch (error) {
      console.error('[Workbench] Failed to open file:', error);
      notificationServiceRef.current?.error(`Failed to open file: ${file.name}`);
    }
  };

  const getDemoFileContent = (fileName, extension) => {
    const fileContents = {
      'Welcome.md': `# Welcome to Your IDE! 🚀

This is a demo workspace running offline. You can:

- ✅ Create and edit files
- ✅ Navigate the file explorer  
- ✅ Use syntax highlighting
- ✅ Test the Monaco editor features

## Demo Files Available:
- **App.js** - React component example
- **index.js** - Application entry point  
- **package.json** - Project configuration
- **README.md** - Project documentation

> **Note**: In demo mode, changes are stored in browser memory and will be lost on refresh.
> To persist files, start the backend server to enable Google Drive integration.`,

      'App.js': `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Welcome to React!');
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Demo App - Count: \${count}\`;
  }, [count]);

  const handleClick = () => {
    setCount(prev => prev + 1);
    setMessage(\`Button clicked \${count + 1} times!\`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>{message}</h1>
        <p>This is a demo React application.</p>
        <button onClick={handleClick}>
          Click me! (Count: {count})
        </button>
        <p>
          Edit this file to see hot reloading in action!
        </p>
      </header>
    </div>
  );
}

export default App;`,

      'index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot module replacement for development
if (module.hot) {
  module.hot.accept();
}

console.log('Demo application started!');`,

      'package.json': `{
  "name": "demo-ide-project",
  "version": "1.0.0",
  "description": "A sample project for the IDE demo",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "keywords": [
    "react",
    "demo",
    "ide",
    "javascript"
  ],
  "author": "Demo User",
  "license": "MIT",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "^5.0.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.16.4",
    "@testing-library/react": "^13.3.0",
    "@testing-library/user-event": "^13.5.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,

      'README.md': `# Demo IDE Project

This is a sample project created in the demo IDE workspace.

## Features

- 📝 **File Editor**: Monaco editor with syntax highlighting
- 🗂️ **File Explorer**: Browse and manage your project files  
- ⚡ **Live Preview**: See changes in real-time
- 🎨 **Themes**: Multiple editor themes available
- 🔍 **Search**: Find and replace functionality

## Getting Started

1. Open any file from the explorer
2. Start editing code with full IntelliSense
3. Use keyboard shortcuts for productivity
4. Create new files and folders as needed

## Demo Mode

You're currently running in demo mode. Features available:

- ✅ File editing and syntax highlighting
- ✅ File creation and management  
- ✅ Monaco editor features
- ❌ File persistence (lost on refresh)
- ❌ Real-time collaboration

## Technology Stack

- **Frontend**: React + Vite
- **Editor**: Monaco Editor (VS Code engine)
- **Styling**: CSS + Custom properties
- **Storage**: Google Drive API (when connected)

Happy coding! 🚀`,

      'main.py': `#!/usr/bin/env python3
"""
Demo Python file for the IDE
A simple example showcasing Python syntax highlighting and features.
"""

import os
import sys
from datetime import datetime
from typing import List, Dict, Optional

class DemoApplication:
    """
    A sample Python class to demonstrate IDE features.
    """
    
    def __init__(self, name: str = "Demo App"):
        self.name = name
        self.start_time = datetime.now()
        self.tasks: List[Dict] = []
        
    def add_task(self, title: str, priority: str = "medium") -> int:
        """Add a new task to the task list."""
        task = {
            "id": len(self.tasks) + 1,
            "title": title,
            "priority": priority,
            "created_at": datetime.now(),
            "completed": False
        }
        self.tasks.append(task)
        return task["id"]
    
    def complete_task(self, task_id: int) -> bool:
        """Mark a task as completed."""
        for task in self.tasks:
            if task["id"] == task_id:
                task["completed"] = True
                return True
        return False
    
    def get_stats(self) -> Dict:
        """Get application statistics."""
        total_tasks = len(self.tasks)
        completed = sum(1 for task in self.tasks if task["completed"])
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed,
            "pending_tasks": total_tasks - completed,
            "completion_rate": (completed / total_tasks * 100) if total_tasks > 0 else 0
        }
    
    def display_info(self) -> None:
        """Display application information."""
        print(f"🚀 {self.name}")
        print(f"⏰ Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📊 Stats: {self.get_stats()}")
        print("-" * 40)

def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

def main():
    """Main application entry point."""
    print("🐍 Python Demo Application")
    print("=" * 40)
    
    # Create demo app instance
    app = DemoApplication("IDE Demo")
    app.display_info()
    
    # Add sample tasks
    app.add_task("Learn Python", "high")
    app.add_task("Build awesome projects", "medium")
    app.add_task("Master the IDE", "high")
    
    # Complete a task
    app.complete_task(1)
    
    # Show updated stats
    print("📋 Updated Stats:")
    stats = app.get_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # Calculate some Fibonacci numbers
    print("\\n🔢 Fibonacci Sequence (first 10):")
    fib_numbers = [fibonacci(i) for i in range(10)]
    print("  " + ", ".join(map(str, fib_numbers)))
    
    print("\\n✨ Demo completed successfully!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\\n👋 Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)`
    };
    
    // Return specific content if available, otherwise generate generic content
    if (fileContents[fileName]) {
      return fileContents[fileName];
    }
    
    // Generate content based on file extension
    switch (extension) {
      case 'js':
      case 'jsx':
        return `// ${fileName}
// Demo JavaScript file

console.log('Hello from ${fileName}!');

function demoFunction() {
  return {
    message: 'This is a demo file created in the IDE',
    timestamp: new Date().toISOString(),
    filename: '${fileName}'
  };
}

// Export for use in other modules
export default demoFunction;`;
      
      case 'py':
        return `# ${fileName}
# Demo Python file

def main():
    """Main function for ${fileName}"""
    print(f"Hello from {fileName}!")
    print("This is a demo file created in the IDE")
    
    # Demo functionality
    numbers = [1, 2, 3, 4, 5]
    squares = [x**2 for x in numbers]
    
    print(f"Numbers: {numbers}")
    print(f"Squares: {squares}")

if __name__ == "__main__":
    main()`;
    
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .demo { color: #0066cc; }
    </style>
</head>
<body>
    <h1 class="demo">Demo HTML File</h1>
    <p>This is <strong>${fileName}</strong> - a demo file created in the IDE.</p>
    <p>You can edit this file and see syntax highlighting in action!</p>
</body>
</html>`;
    
      case 'css':
        return `/* ${fileName} */
/* Demo CSS file */

.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.demo-title {
  color: #333;
  font-size: 2em;
  margin-bottom: 20px;
  text-align: center;
}

.demo-content {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #0066cc;
}

.demo-button {
  background-color: #0066cc;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.demo-button:hover {
  background-color: #0052a3;
}`;
    
      case 'md':
        return `# ${fileName}

This is a demo Markdown file created in the IDE.

## Features

- ✅ **Syntax Highlighting**: Full Markdown support
- ✅ **Live Editing**: See changes as you type
- ✅ **File Management**: Create, edit, and organize files

## Sample Content

Here's some sample content to demonstrate Markdown formatting:

### Code Block

\`\`\`javascript
function greetUser(name) {
  return \`Hello, \${name}! Welcome to the IDE.\`;
}

console.log(greetUser('Developer'));
\`\`\`

### List Example

1. First item
2. Second item
3. Third item

### Links and Emphasis

Visit [our documentation](https://example.com) for more information.

**Bold text** and *italic text* are supported.

> This is a blockquote to highlight important information.

---

*File created in demo mode*`;
    
      case 'json':
        return `{
  "name": "${fileName}",
  "version": "1.0.0",
  "description": "Demo JSON file created in the IDE",
  "type": "demo",
  "created": "${new Date().toISOString()}",
  "features": [
    "Syntax highlighting",
    "Auto-formatting", 
    "Error detection",
    "IntelliSense support"
  ],
  "settings": {
    "theme": "vs-dark",
    "fontSize": 14,
    "wordWrap": true,
    "minimap": {
      "enabled": true
    }
  },
  "demo": true
}`;
    
      default:
        return `// ${fileName}
// Demo file created in the IDE

This is a sample file with basic content.
You can edit this file and add your own content.

File type: ${extension || 'unknown'}
Created: ${new Date().toISOString()}

Feel free to modify this content and explore the IDE features!`;
    }
  };

  const getLanguageFromExtension = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'md': 'markdown',
      'py': 'python'
    }
    return languageMap[ext] || 'plaintext'
  }

  const getCurrentFile = () => {
    return openTabs.find(tab => tab.id === activeTabId)
  }

  const hasUnsavedChanges = () => {
    const currentFile = getCurrentFile()
    return currentFile?.isDirty || false
  }

  // Handle code execution from editor
  const handleRunCodeFromEditor = useCallback(() => {
    const currentFile = getCurrentFile()
    console.log('Workbench: handleRunCodeFromEditor called, currentFile:', currentFile?.name);
    
    if (!currentFile) {
      console.log('Workbench: No current file available');
      return;
    }

    console.log('Workbench: Current file content length:', currentFile.content?.length);

    // Open terminal panel if not visible
    if (!terminalVisible) {
      console.log('Workbench: Opening terminal panel');
      setTerminalVisible(true)
    }
    
    // Switch to execution tab
    console.log('Workbench: Switching to execution tab');
    setActiveTerminalTab('execution')
    
    // Set a flag to trigger execution when the panel loads
    console.log('Workbench: Setting trigger execution flag');
    setTriggerExecution(true)
    
    console.log('Workbench: Code execution setup complete for:', currentFile.name)
  }, [terminalVisible, openTabs, activeTabId])

  const loadSampleFileTree = () => {
    const sampleTree = [
      {
        name: 'src',
        type: 'folder',
        path: 'src',
        children: [
          {
            name: 'components',
            type: 'folder',
            path: 'src/components',
            children: [
              { 
                name: 'App.jsx', 
                type: 'file', 
                path: 'src/components/App.jsx', 
                content: 'import React from "react";\n\nfunction App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;' 
              }
            ]
          },
          { 
            name: 'index.js', 
            type: 'file', 
            path: 'src/index.js', 
            content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./components/App";\n\nReactDOM.render(<App />, document.getElementById("root"));' 
          }
        ]
      },
      { 
        name: 'package.json', 
        type: 'file', 
        path: 'package.json', 
        content: '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}' 
      }
    ]
    
    setFileTree(sampleTree)
  }

  const setupServiceEventListeners = () => {
    const layoutService = layoutServiceRef.current
    const notificationService = notificationServiceRef.current
    const executionService = executionServiceRef.current
    
    if (layoutService) {
      layoutService.on('layout', (newLayout) => {
        setSidebarVisible(newLayout.parts[Parts.SIDEBAR]?.visible ?? true)
        setTerminalVisible(newLayout.parts[Parts.PANEL]?.visible ?? false)
      })
      
      layoutService.on('zenModeChanged', (isZenMode) => {
        setZenMode(isZenMode)
        notificationService?.info(isZenMode ? 'Zen mode enabled' : 'Zen mode disabled')
      })
    }
    
    // Enhanced debug event listeners
    if (executionService) {
      // Real-time execution state events
      executionService.on('executionStateChanged', (state) => {
        setIsDebugging(state.isDebugging)
        setIsPaused(state.isPaused)
        setDebugVariables(state.variables)
        setDebugCallStack(state.callStack)
        
        // Update watch expressions
        if (state.watchExpressions) {
          setDebugWatchExpressions(state.watchExpressions.map(item => ({
            expression: item.expression,
            value: item.value,
            error: item.error
          })))
        }
        
        // Update breakpoints
        if (state.breakpoints) {
          setDebugBreakpoints(state.breakpoints)
        }
      })
      
      // Debug session events
      executionService.on('debugStarted', (info) => {
        setIsDebugging(true)
        setIsPaused(false)
        console.log('Debug session started:', info)
      })
      
      executionService.on('debugPaused', (info) => {
        setIsPaused(true)
        setDebugVariables(info.variables)
        setDebugCallStack(info.callStack)
        console.log('Debug paused:', info)
      })
      
      executionService.on('debugResumed', () => {
        setIsPaused(false)
        console.log('Debug resumed')
      })
      
      executionService.on('debugCompleted', (info) => {
        setIsDebugging(false)
        setIsPaused(false)
        console.log('Debug completed:', info)
      })
      
      executionService.on('debugError', (error) => {
        setIsDebugging(false)
        setIsPaused(false)
        console.error('Debug error:', error)
      })
      
      // Execution line changes
      executionService.on('executionLineChanged', (location) => {
        // Update call stack with current line
        setDebugCallStack(prev => {
          if (prev.length > 0) {
            const updated = [...prev]
            updated[0] = {
              ...updated[0],
              lineNumber: location.lineNumber,
              fileName: location.fileName
            }
            return updated
          }
          return prev
        })
      })
      
      // Variable updates
      executionService.on('variablesChanged', (variables) => {
        setDebugVariables(variables)
      })
      
      // Breakpoint events
      executionService.on('breakpointAdded', (breakpoint) => {
        setDebugBreakpoints(prev => [...prev, {
          fileName: breakpoint.fileName,
          lineNumber: breakpoint.lineNumber,
          enabled: breakpoint.enabled,
          condition: breakpoint.condition,
          lineContent: '' // Would be filled from source
        }])
      })
      
      executionService.on('breakpointRemoved', (breakpoint) => {
        setDebugBreakpoints(prev => prev.filter(bp => 
          !(bp.fileName === breakpoint.fileName && bp.lineNumber === breakpoint.lineNumber)
        ))
      })
      
      executionService.on('breakpointToggled', (breakpoint) => {
        setDebugBreakpoints(prev => prev.map(bp => 
          bp.fileName === breakpoint.fileName && bp.lineNumber === breakpoint.lineNumber
            ? { ...bp, enabled: breakpoint.enabled }
            : bp
        ))
      })
      
      executionService.on('allBreakpointsCleared', () => {
        setDebugBreakpoints([])
      })
      
      // Debug session events
      executionService.on('debugSessionStarted', (session) => {
        console.log('Debug session started:', session)
        notificationService?.info('Debug session started')
      })
      
      executionService.on('debugSessionStopped', (session) => {
        console.log('Debug session stopped:', session)
        setDebugVariables({})
        setDebugCallStack([])
        notificationService?.info('Debug session stopped')
      })
      
      // Breakpoint hit events
      executionService.on('breakpointHit', (data) => {
        console.log('Breakpoint hit:', data)
        setDebugVariables(data.variables)
        setDebugCallStack(data.callStack)
        notificationService?.warning('Breakpoint hit at line ' + data.breakpoint.lineNumber)
      })
      
      // Call stack events
      executionService.on('callStackUpdated', (callStack) => {
        setDebugCallStack(callStack)
      })
      
      executionService.on('callStackFrameSelected', (data) => {
        console.log('Call stack frame selected:', data)
        // Update variables for the selected frame
        setDebugVariables(executionService.getAllVariables())
      })
      
      // Watch expression events
      executionService.on('watchExpressionAdded', (watchItem) => {
        setDebugWatchExpressions(prev => [...prev, {
          expression: watchItem.expression,
          value: watchItem.value,
          error: watchItem.error
        }])
      })
      
      executionService.on('watchExpressionRemoved', (watchItem) => {
        setDebugWatchExpressions(prev => prev.filter(item => 
          item.expression !== watchItem.expression
        ))
      })
      
      executionService.on('watchExpressionUpdated', (watchItem) => {
        setDebugWatchExpressions(prev => prev.map(item => 
          item.expression === watchItem.expression ? {
            expression: watchItem.expression,
            value: watchItem.value,
            error: watchItem.error
          } : item
        ))
      })
      
      executionService.on('watchExpressionsRefreshed', (watchItems) => {
        setDebugWatchExpressions(watchItems.map(item => ({
          expression: item.expression,
          value: item.value,
          error: item.error
        })))
      })
      
      // Step debugging events
      executionService.on('stepOver', () => {
        console.log('Step over')
      })
      
      executionService.on('stepInto', () => {
        console.log('Step into')
      })
      
      executionService.on('stepOut', () => {
        console.log('Step out')
      })
      
      executionService.on('continue', () => {
        console.log('Continue execution')
      })
      
      executionService.on('paused', (data) => {
        console.log('Execution paused:', data)
        setDebugVariables(data.variables)
        setDebugCallStack(data.callStack)
      })
    }
  }

  const registerEnhancedCommands = () => {
    const layoutService = layoutServiceRef.current
    const notificationService = notificationServiceRef.current
    
    if (!CommandService || !layoutService) return
    
    CommandService.register('workbench.action.toggleZenMode', 'Toggle Zen Mode', () => {
      layoutService.toggleZenMode()
    })
    
    CommandService.register('workbench.action.toggleSidebar', 'Toggle Sidebar', () => {
      layoutService.togglePartVisibility(Parts.SIDEBAR)
    })
    
    CommandService.register('workbench.action.togglePanel', 'Toggle Panel', () => {
      layoutService.togglePartVisibility(Parts.PANEL)
    })
    
    CommandService.register('notifications.showTest', 'Show Test Notification', () => {
      notificationService?.info('Test notification', {
        actions: [{ label: 'OK', run: () => console.log('OK clicked') }]
      })
    })

    // File commands
    CommandService.on('file.new', handleNewFile)
    CommandService.on('file.open', handleOpenFile)
    CommandService.on('file.save', handleSaveFile)
    CommandService.on('file.saveAll', handleSaveAll)
    
    // View commands
    CommandService.on('view.commandPalette', () => setCommandPaletteOpen(true))
    CommandService.on('view.toggleSidebar', () => setSidebarVisible(!sidebarVisible))
    CommandService.on('view.toggleTerminal', () => setTerminalVisible(!terminalVisible))
    
    // AI commands
    CommandService.on('ai.chat.start', () => setAiChatOpen(true))
    CommandService.on('ai.completion.show', handleAICompletion)
    CommandService.on('ai.chat.response', handleAIChatResponse)
    
    console.log('[Workbench] Enhanced commands registered')
  }

  const setupKeyboardShortcuts = () => {
    const handleKeyDown = (e) => {
      const { ctrlKey, shiftKey, key } = e
      
      // Command Palette
      if (ctrlKey && shiftKey && key === 'P') {
        e.preventDefault()
        setCommandPaletteOpen(true)
        return
      }
      
      // Quick Open
      if (ctrlKey && key === 'p') {
        e.preventDefault()
        setQuickFilePickerOpen(true)
        return
      }
      
      // AI Chat
      if (ctrlKey && shiftKey && key === 'A') {
        e.preventDefault()
        setAiChatOpen(true)
        return
      }

      // File operations
      if (ctrlKey && key === 'n') {
        e.preventDefault()
        handleNewFile()
        return
      }

      if (ctrlKey && key === 'o') {
        e.preventDefault()
        handleOpenFile()
        return
      }

      if (ctrlKey && key === 's') {
        e.preventDefault()
        if (shiftKey) {
          handleSaveAs()
        } else {
          handleSaveFile()
        }
        return
      }

      if (ctrlKey && key === 'w') {
        e.preventDefault()
        handleCloseFile()
        return
      }

      // Find/Replace
      if (ctrlKey && key === 'f') {
        e.preventDefault()
        handleFind()
        return
      }

      if (ctrlKey && key === 'h') {
        e.preventDefault()
        handleReplace()
        return
      }

      if (ctrlKey && key === 'g') {
        e.preventDefault()
        handleGoto()
        return
      }

      // View operations
      if (ctrlKey && key === 'b') {
        e.preventDefault()
        setSidebarVisible(!sidebarVisible)
        return
      }

      if (ctrlKey && key === 'j') {
        e.preventDefault()
        setTerminalVisible(!terminalVisible)
        return
      }

      if (ctrlKey && key === '`') {
        e.preventDefault()
        setTerminalVisible(!terminalVisible)
        return
      }
      
      // Find command by keybinding
      const keybinding = [
        ctrlKey && 'Ctrl',
        shiftKey && 'Shift',
        key
      ].filter(Boolean).join('+')
      
      const command = CommandService.getCommandByKeybinding(keybinding)
      if (command) {
        e.preventDefault()
        CommandService.execute(command.id)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }

  // File Operations
  const handleNewFile = useCallback(() => {
    const newFile = {
      id: `file-${Date.now()}`,
      name: 'Untitled-1.txt',
      content: '',
      language: 'plaintext',
      isDirty: false,
      path: null
    }
    
    setOpenTabs(prev => [...prev, newFile])
    setActiveTabId(newFile.id)
  }, [])

  const handleOpenFile = useCallback(() => {
    // Trigger file picker or quick open
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const newFile = {
            id: `file-${Date.now()}-${Math.random()}`,
            name: file.name,
            content: event.target.result,
            language: detectLanguage(file.name),
            isDirty: false,
            path: file.name
          }
          
          setOpenTabs(prev => [...prev, newFile])
          setActiveTabId(newFile.id)
        }
        reader.readAsText(file)
      })
    }
    input.click()
  }, [])

  const handleSaveFile = useCallback(() => {
    if (activeTabId) {
      const activeTab = openTabs.find(tab => tab.id === activeTabId)
      if (activeTab && activeTab.isDirty) {
        // Save file logic
        console.log('Saving file:', activeTab.name)
        setOpenTabs(prev => prev.map(tab => 
          tab.id === activeTabId ? { ...tab, isDirty: false } : tab
        ))
      }
    }
  }, [activeTabId, openTabs])

  const handleSaveAll = useCallback(() => {
    const dirtyTabs = openTabs.filter(tab => tab.isDirty)
    dirtyTabs.forEach(tab => {
      console.log('Saving file:', tab.name)
    })
    
    setOpenTabs(prev => prev.map(tab => ({ ...tab, isDirty: false })))
  }, [openTabs])

  // Additional handlers for TitleBar
  const handleSaveAs = useCallback(() => {
    const activeTab = openTabs.find(tab => tab.id === activeTabId)
    if (activeTab) {
      const fileName = prompt('Save as:', activeTab.name)
      if (fileName) {
        setOpenTabs(prev => prev.map(tab =>
          tab.id === activeTabId
            ? { ...tab, name: fileName, path: fileName, isDirty: false }
            : tab
        ))
        console.log('File saved as:', fileName)
      }
    }
  }, [activeTabId, openTabs])

  const handleCloseFile = useCallback(() => {
    if (activeTabId) {
      const activeTab = openTabs.find(tab => tab.id === activeTabId)
      if (activeTab?.isDirty) {
        const result = confirm(`${activeTab.name} has unsaved changes. Save before closing?`)
        if (result) {
          handleSaveFile()
        }
      }
      
      setOpenTabs(prev => prev.filter(tab => tab.id !== activeTabId))
      const remainingTabs = openTabs.filter(tab => tab.id !== activeTabId)
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null)
    }
  }, [activeTabId, openTabs, handleSaveFile])

  const handleCloseAllFiles = useCallback(() => {
    const dirtyTabs = openTabs.filter(tab => tab.isDirty)
    if (dirtyTabs.length > 0) {
      const result = confirm(`${dirtyTabs.length} file(s) have unsaved changes. Save all before closing?`)
      if (result) {
        handleSaveAll()
      }
    }
    setOpenTabs([])
    setActiveTabId(null)
  }, [openTabs, handleSaveAll])

  const handleFind = useCallback(() => {
    // Implement find functionality - could focus Monaco editor find widget
    console.log('Find functionality')
  }, [])

  const handleReplace = useCallback(() => {
    // Implement replace functionality
    console.log('Replace functionality')
  }, [])

  const handleGoto = useCallback(() => {
    // Implement go to line functionality
    const line = prompt('Go to line:')
    if (line && !isNaN(line)) {
      console.log(`Go to line: ${line}`)
    }
  }, [])

  const handleMinimize = useCallback(() => {
    console.log('Minimize window')
  }, [])

  const handleMaximize = useCallback(() => {
    console.log('Maximize/Restore window')
  }, [])

  const handleClose = useCallback(() => {
    if (openTabs.some(tab => tab.isDirty)) {
      const result = confirm('You have unsaved changes. Close anyway?')
      if (!result) return
    }
    console.log('Close application')
  }, [openTabs])

  // AI Handlers

  // Additional handlers for TitleBar
  const handleAICompletion = useCallback((completion) => {
    setAiSuggestions(completion.suggestions || [])
  }, [])

  const handleAIChatResponse = useCallback((response) => {
    // Handle AI chat response
    console.log('AI Response:', response)
  }, [])

  // File Management Handlers
  const handleCreateFile = useCallback(() => {
    const fileName = prompt('Enter file name:')
    if (fileName) {
      const newFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: fileName,
        content: '',
        language: detectLanguage(fileName),
        isDirty: false,
        path: fileName
      }
      
      setOpenTabs(prev => [...prev, newFile])
      setActiveTabId(newFile.id)
    }
  }, [])

  const handleDeleteFile = useCallback((path) => {
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      setOpenTabs(prev => prev.filter(tab => tab.path !== path))
      // If the deleted file was active, switch to another tab
      const remainingTabs = openTabs.filter(tab => tab.path !== path)
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id)
      } else {
        setActiveTabId(null)
      }
    }
  }, [openTabs])

  // File selection handler for sidebar
  const handleFileSelect = useCallback(async (file) => {
    if (file.type === 'file') {
      // If file already has content (demo file), create tab directly
      if (file.content !== undefined) {
        const tab = {
          id: file.id || file.path,
          title: file.name,
          content: file.content,
          language: file.language || detectLanguage(file.name),
          isDirty: false,
          path: file.path,
          name: file.name
        }
        
        // Add tab if not already open
        setOpenTabs(prev => {
          const existingTab = prev.find(t => t.id === tab.id)
          if (existingTab) {
            setActiveTabId(tab.id)
            return prev
          }
          setActiveTabId(tab.id)
          return [...prev, tab]
        })
        
        // Add to recent files
        setRecentFiles(prev => {
          const filtered = prev.filter(f => f.path !== file.path)
          return [file, ...filtered].slice(0, 10)
        })
      } else {
        // Real file from file system
        await openFile(file)
        
        // Add to recent files
        setRecentFiles(prev => {
          const filtered = prev.filter(f => f.path !== file.path)
          return [file, ...filtered].slice(0, 10)
        })
      }
    }
  }, [])

  const [expandedFolders, setExpandedFolders] = useState(new Set());

  // Debug file tree changes
  useEffect(() => {
    console.log('[Workbench] File tree updated:', fileTree);
    console.log('[Workbench] Expanded folders:', Array.from(expandedFolders));
  }, [fileTree, expandedFolders])

  // Folder toggle handler for sidebar
  const handleToggleFolder = useCallback(async (folderPath) => {
    console.log('[Workbench] Toggling folder:', folderPath);
    
    const newExpandedFolders = new Set(expandedFolders);
    
    // If folder is already expanded, just collapse it
    if (newExpandedFolders.has(folderPath)) {
      console.log('[Workbench] Collapsing folder:', folderPath);
      newExpandedFolders.delete(folderPath);
      setExpandedFolders(newExpandedFolders);
      return;
    }

    // Expand the folder
    console.log('[Workbench] Expanding folder:', folderPath);
    newExpandedFolders.add(folderPath);
    setExpandedFolders(newExpandedFolders);

    // Load folder contents
    try {
      console.log('[Workbench] Loading folder contents for:', folderPath);
      const children = await driveApi.listFiles(folderPath);
      console.log('[Workbench] Loaded folder children:', children);
      
      const formattedChildren = children.map(child => ({
        ...child,
        path: `${folderPath === '/' ? '' : folderPath}/${child.name}`,
        children: child.type === 'folder' ? [] : undefined,
      }));

      // Update the file tree with the loaded children
      setFileTree(prevTree => {
        const newTree = [...prevTree];
        
        const findAndUpdate = (nodes, path) => {
          for (const node of nodes) {
            if (node.path === path && node.type === 'folder') {
              node.children = formattedChildren;
              console.log('[Workbench] Updated folder children in tree');
              return true;
            }
            if (node.children && findAndUpdate(node.children, path)) {
              return true;
            }
          }
          return false;
        };
        
        findAndUpdate(newTree, folderPath);
        return newTree;
      });
    } catch (error) {
      console.warn('Backend not available, using empty folder contents:', error.message);
      
      // In demo mode, provide some mock children for demonstration
      if (folderPath === '/src') {
        const mockChildren = [
          {
            name: 'components',
            type: 'folder',
            path: '/src/components',
            children: []
          },
          {
            name: 'utils',
            type: 'folder',
            path: '/src/utils',
            children: []
          }
        ];
        
        setFileTree(prevTree => {
          const newTree = [...prevTree];
          const findAndUpdate = (nodes, path) => {
            for (const node of nodes) {
              if (node.path === path && node.type === 'folder') {
                node.children = mockChildren;
                return true;
              }
              if (node.children && findAndUpdate(node.children, path)) {
                return true;
              }
            }
            return false;
          };
          findAndUpdate(newTree, folderPath);
          return newTree;
        });
      } else {
        // Remove from expanded folders if loading failed
        setExpandedFolders(prev => {
          const updated = new Set(prev);
          updated.delete(folderPath);
          return updated;
        });
        
        notificationServiceRef.current?.info(`No contents found for folder: ${folderPath}`);
      }
    }
  }, [expandedFolders]);

  // Utility Functions
  const detectLanguage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript', 
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'txt': 'plaintext'
    }
    return languageMap[ext] || 'plaintext'
  }

  const loadWorkspace = async () => {
    // Load workspace data
    try {
      // Sample file tree data to populate the UI
      const sampleFileTree = [
        {
          id: 'welcome',
          name: 'Welcome.md',
          type: 'file',
          path: 'Welcome.md',
          content: '# Welcome to Studio IDE\n\nThis is a modern AI-powered IDE built with React and VS Code architecture.\n\n## Features\n- AI Code Completion\n- Intelligent Chat Assistant\n- Modern Monaco Editor\n- VS Code-like Interface\n\nStart coding by creating a new file or opening an existing one!'
        },
        {
          id: 'src-folder',
          name: 'src',
          type: 'folder',
          path: 'src',
          children: [
            {
              id: 'app-js',
              name: 'App.js',
              type: 'file',
              path: 'src/App.js',
              content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World!</h1>\n    </div>\n  );\n}\n\nexport default App;'
            },
            {
              id: 'index-js',
              name: 'index.js',
              type: 'file',
              path: 'src/index.js',
              content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));'
            }
          ]
        },
        {
          id: 'package-json',
          name: 'package.json',
          type: 'file',
          path: 'package.json',
          content: '{\n  "name": "studio-ide-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  }\n}'
        }
      ]
      
      setFileTree(sampleFileTree)
      
      // Open the welcome file by default
      const welcomeFile = {
        id: 'welcome-tab',
        name: 'Welcome.md',
        content: sampleFileTree[0].content,
        language: 'markdown',
        isDirty: false,
        path: 'Welcome.md'
      }
      
      setOpenTabs([welcomeFile])
      setActiveTabId(welcomeFile.id)
      
    } catch (error) {
      console.error('Failed to load workspace:', error)
    }
  }

  // Enhanced debug action handler with JavaScriptExecutionService integration
  const handleDebugAction = useCallback((action, ...args) => {
    const executionService = executionServiceRef.current;
    
    switch (action) {
      case 'addWatch':
        if (executionService) {
          const watchItem = executionService.addWatchExpression(args[0]);
          setDebugWatchExpressions(prev => [...prev, {
            expression: watchItem.expression,
            value: watchItem.value,
            error: watchItem.error
          }]);
        }
        break;
        
      case 'removeWatch':
        const watchIndex = args[0];
        if (executionService && debugWatchExpressions[watchIndex]) {
          const expression = debugWatchExpressions[watchIndex].expression;
          // Find and remove from service (need to match by expression)
          for (const [id, watchItem] of executionService.watchedVariables.entries()) {
            if (watchItem.expression === expression) {
              executionService.removeWatchExpression(id);
              break;
            }
          }
        }
        setDebugWatchExpressions(prev => prev.filter((_, index) => index !== watchIndex));
        break;
        
      case 'updateWatch':
        const updateIndex = args[0];
        const newExpression = args[1];
        if (executionService && debugWatchExpressions[updateIndex]) {
          const oldExpression = debugWatchExpressions[updateIndex].expression;
          // Find and update in service
          for (const [id, watchItem] of executionService.watchedVariables.entries()) {
            if (watchItem.expression === oldExpression) {
              const updatedItem = executionService.updateWatchExpression(id, newExpression);
              break;
            }
          }
        }
        setDebugWatchExpressions(prev => prev.map((item, index) => 
          index === updateIndex ? { ...item, expression: newExpression } : item
        ));
        break;
        
      case 'refreshWatch':
        if (executionService) {
          executionService.refreshAllWatchExpressions();
          // Update UI with refreshed values
          const refreshedExpressions = [];
          for (const watchItem of executionService.watchedVariables.values()) {
            refreshedExpressions.push({
              expression: watchItem.expression,
              value: watchItem.value,
              error: watchItem.error
            });
          }
          setDebugWatchExpressions(refreshedExpressions);
        }
        break;
        
      case 'addBreakpoint':
        const newBreakpoint = args[0];
        if (executionService && newBreakpoint) {
          const bpId = `${newBreakpoint.fileName}:${newBreakpoint.lineNumber}`;
          executionService.addBreakpoint(bpId, newBreakpoint.condition);
          setDebugBreakpoints(prev => [...prev, newBreakpoint]);
        }
        break;
        
      case 'selectFrame':
        const frameIndex = args[0];
        if (executionService) {
          executionService.selectCallStackFrame(frameIndex);
          // Update variables for selected frame
          setDebugVariables(executionService.getAllVariables());
        }
        break;
        
      case 'toggleBreakpoint':
        const bpIndex = args[0];
        if (executionService && debugBreakpoints[bpIndex]) {
          const breakpoint = debugBreakpoints[bpIndex];
          const bpId = `${breakpoint.fileName}:${breakpoint.lineNumber}`;
          executionService.toggleBreakpoint(bpId);
        }
        setDebugBreakpoints(prev => prev.map((bp, index) => 
          index === bpIndex ? { ...bp, enabled: !bp.enabled } : bp
        ));
        break;
        
      case 'removeBreakpoint':
        const removeIndex = args[0];
        if (executionService && debugBreakpoints[removeIndex]) {
          const breakpoint = debugBreakpoints[removeIndex];
          const bpId = `${breakpoint.fileName}:${breakpoint.lineNumber}`;
          executionService.removeBreakpoint(bpId);
        }
        setDebugBreakpoints(prev => prev.filter((_, index) => index !== removeIndex));
        break;
        
      case 'removeAllBreakpoints':
        if (executionService) {
          executionService.clearAllBreakpoints();
        }
        setDebugBreakpoints([]);
        break;
        
      case 'goToBreakpoint':
        const breakpoint = args[0];
        console.log('Navigate to breakpoint:', breakpoint);
        // TODO: Implement navigation to file and line
        // This would involve opening the file and scrolling to the line
        if (breakpoint.fileName && breakpoint.lineNumber) {
          // Find and open the file
          // Scroll to the line
          // Highlight the line
        }
        break;
        
      case 'startDebugSession':
        if (executionService) {
          const session = executionService.startDebugSession();
          setIsDebugging(true);
          setIsPaused(false);
          setDebugSessionId(session.id);
          console.log('Debug session started:', session);
          
          // Execute the current tab's code if it's JavaScript
          const activeTab = openTabs.find(tab => tab.id === activeTabId);
          if (activeTab && activeTab.language === 'javascript' && activeTab.content) {
            setTimeout(() => {
              try {
                executionService.executeWithDebugging(activeTab.content, activeTab.name);
              } catch (error) {
                console.error('Debug execution error:', error);
              }
            }, 500);
          }
        }
        break;
        
      case 'stopDebugSession':
        if (executionService) {
          executionService.stopDebugSession();
          setIsDebugging(false);
          setIsPaused(false);
          setDebugSessionId(null);
          // Reset debug state
          setDebugVariables({});
          setDebugCallStack([]);
        }
        break;
        
      case 'restartDebugSession':
        if (executionService) {
          executionService.stopDebugSession();
          const session = executionService.startDebugSession();
          setIsDebugging(true);
          setIsPaused(false);
          setDebugSessionId(session.id);
          console.log('Debug session restarted:', session);
        }
        break;
        
      case 'stepOver':
        if (executionService) {
          executionService.stepOver();
          setIsPaused(true);
        }
        break;
        
      case 'stepInto':
        if (executionService) {
          executionService.stepInto();
          setIsPaused(true);
        }
        break;
        
      case 'stepOut':
        if (executionService) {
          executionService.stepOut();
          setIsPaused(true);
        }
        break;
        
      case 'continue':
        if (executionService) {
          executionService.continue();
          setIsPaused(false);
        }
        break;
        
      case 'pause':
        if (executionService) {
          executionService.pause();
          setIsPaused(true);
        }
        break;
        
      default:
        console.log('Unknown debug action:', action, args);
    }
  }, [debugWatchExpressions, debugBreakpoints, isDebugging, isPaused])

  const refreshNodeInTree = useCallback(async (folderPath) => {
    try {
      console.log('[Workbench] Refreshing folder:', folderPath);
      
      // If refreshing root, reload the entire tree
      if (folderPath === '/') {
        console.log('[Workbench] Refreshing entire workspace');
        await loadWorkspaceFromDrive();
        return;
      }

      // For now, let's use the simpler approach of refreshing from root
      // This ensures we get the most up-to-date file tree
      console.log('[Workbench] Performing full workspace refresh for reliability');
      await loadWorkspaceFromDrive();
      
      // Auto-expand the folder that was being refreshed
      if (folderPath !== '/') {
        setExpandedFolders(prev => new Set(prev).add(folderPath));
      }
      
      // Force re-render of file explorer
      setFileTreeKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error in refreshNodeInTree:', error);
      notificationServiceRef.current?.error(`Failed to refresh folder: ${error.message}`);
    }
  }, []);

  // File operation handler for advanced file management
  const handleFileOperation = useCallback(async (operation, params) => {
    try {
      console.log('[Workbench] File operation:', operation, params);
      
      // Use the path from params if available (e.g., from context menu), otherwise default
      const activeFile = openTabs.find(tab => tab.id === activeTabId);
      const baseDir = params?.path ? (params.type === 'folder' ? params.path : path.dirname(params.path)) : (activeFile ? path.dirname(activeFile.path) : '/');
      
      console.log('[Workbench] Base directory:', baseDir);

      switch (operation) {
        case 'newFile': {
          const fileName = prompt('Enter new file name:');
          if (fileName && fileName.trim()) {
            const newFilePath = `${baseDir === '/' ? '' : baseDir}/${fileName.trim()}`;
            console.log('[Workbench] Creating new file at:', newFilePath);
            
            try {
              await driveApi.saveFile(newFilePath, '');
              console.log('[Workbench] File created successfully, waiting for sync...');
            } catch (error) {
              console.warn('[Workbench] Backend not available, simulating file creation:', error.message);
              // In demo mode, we simulate the file creation
            }
            
            // Small delay to simulate processing
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Automatically expand the parent folder if it's not already
            if (!expandedFolders.has(baseDir)) {
              console.log('[Workbench] Expanding parent folder:', baseDir);
              setExpandedFolders(prev => new Set(prev).add(baseDir));
            }
            
            // Add the new file to the tree manually in demo mode
            const newFile = {
              name: fileName.trim(),
              type: 'file',
              path: newFilePath,
              size: 0,
              lastModified: new Date().toISOString(),
            };
            
            setFileTree(prevTree => {
              const newTree = [...prevTree];
              
              // Add to root if baseDir is '/', otherwise find the parent folder
              if (baseDir === '/') {
                newTree.push(newFile);
              } else {
                const findAndAddToFolder = (nodes, path) => {
                  for (const node of nodes) {
                    if (node.path === path && node.type === 'folder') {
                      if (!node.children) node.children = [];
                      node.children.push(newFile);
                      return true;
                    }
                    if (node.children && findAndAddToFolder(node.children, path)) {
                      return true;
                    }
                  }
                  return false;
                };
                findAndAddToFolder(newTree, baseDir);
              }
              
              return newTree;
            });
            
            setFileTreeKey(prev => prev + 1);
            console.log('[Workbench] File added to tree');
            
            // Automatically open the newly created file
            setTimeout(() => {
              openFile(newFile);
            }, 300);
            
            notificationServiceRef.current?.success(`File '${fileName}' created successfully`);
          }
          break;
        }
        case 'newFolder': {
          const folderName = prompt('Enter new folder name:');
          if (folderName && folderName.trim()) {
            const newFolderPath = `${baseDir === '/' ? '' : baseDir}/${folderName.trim()}`;
            console.log('[Workbench] Creating new folder at:', newFolderPath);
            
            try {
              await driveApi.createFolder(newFolderPath);
              console.log('[Workbench] Folder created successfully, waiting for sync...');
            } catch (error) {
              console.warn('[Workbench] Backend not available, simulating folder creation:', error.message);
              // In demo mode, we simulate the folder creation
            }
            
            // Small delay to simulate processing
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Automatically expand the parent folder if it's not already
            if (!expandedFolders.has(baseDir)) {
              console.log('[Workbench] Expanding parent folder:', baseDir);
              setExpandedFolders(prev => new Set(prev).add(baseDir));
            }
            
            // Add the new folder to the tree manually in demo mode
            const newFolder = {
              name: folderName.trim(),
              type: 'folder',
              path: newFolderPath,
              children: [],
            };
            
            setFileTree(prevTree => {
              const newTree = [...prevTree];
              
              // Add to root if baseDir is '/', otherwise find the parent folder
              if (baseDir === '/') {
                newTree.push(newFolder);
              } else {
                const findAndAddToFolder = (nodes, path) => {
                  for (const node of nodes) {
                    if (node.path === path && node.type === 'folder') {
                      if (!node.children) node.children = [];
                      node.children.push(newFolder);
                      return true;
                    }
                    if (node.children && findAndAddToFolder(node.children, path)) {
                      return true;
                    }
                  }
                  return false;
                };
                findAndAddToFolder(newTree, baseDir);
              }
              
              return newTree;
            });
            
            setFileTreeKey(prev => prev + 1);
            console.log('[Workbench] Folder added to tree');
            
            notificationServiceRef.current?.success(`Folder '${folderName}' created successfully`);
          }
          break;
        }
        case 'refresh': {
          const refreshPath = params?.path || baseDir || '/';
          console.log('[Workbench] Manual refresh requested for:', refreshPath);
          
          if (refreshPath === '/') {
            await forceRefreshWorkspace();
          } else {
            await refreshNodeInTree(refreshPath);
          }
          notificationServiceRef.current?.info(`Refreshed '${refreshPath === '/' ? 'workspace' : refreshPath}'`);
          break;
        }
        default:
          console.log('Unknown file operation:', operation, params);
      }
    } catch (error) {
      console.error('File operation failed:', error);
      notificationServiceRef.current?.error(`File operation failed: ${error.message}`);
    }
  }, [activeTabId, openTabs, expandedFolders, refreshNodeInTree, forceRefreshWorkspace]);

  const cleanup = () => {
    // Cleanup services and listeners
    CommandService.removeAllListeners()
    
    // Dispose professional services
    if (layoutServiceRef.current) {
      layoutServiceRef.current.dispose?.()
    }
    
    if (notificationServiceRef.current) {
      notificationServiceRef.current.dispose?.()
    }
    
    if (editorGroupModelRef.current) {
      editorGroupModelRef.current.dispose?.()
    }
    
    if (instantiationServiceRef.current) {
      instantiationServiceRef.current.dispose?.()
    }
    
    console.log('[Workbench] Services cleaned up')
  }

  // Cleanup effect
  useEffect(() => {
    return cleanup
  }, [])

  return (
    <div className="workbench">
      <TitleBar 
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSave={handleSaveFile}
        onSaveAs={handleSaveAs}
        onSaveAll={handleSaveAll}
        onCloseFile={handleCloseFile}
        onCloseAllFiles={handleCloseAllFiles}
        onToggleTerminal={() => setTerminalVisible(!terminalVisible)}
        onOpenSettings={() => setCommandPaletteOpen(true)}
        onToggleSidebar={(view) => view ? setActiveView(view) : setSidebarVisible(!sidebarVisible)}
        onTogglePanel={(panel) => panel ? console.log(`Open ${panel}`) : setTerminalVisible(!terminalVisible)}
        onZenMode={() => {
          setZenMode(!zenMode)
          layoutServiceRef.current?.toggleZenMode()
        }}
        onCommandPalette={() => setCommandPaletteOpen(true)}
        onFind={handleFind}
        onReplace={handleReplace}
        onGoto={handleGoto}
        currentFile={getCurrentFile()}
        hasUnsavedChanges={hasUnsavedChanges()}
        isMaximized={false}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onClose={handleClose}
      />
      
      <div className="workbench-body">
        <ActivityBar 
          activeView={activeView} 
          onViewChange={setActiveView}
          onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          onTogglePanel={() => setTerminalVisible(!terminalVisible)}
          onOpenAI={() => setAiChatOpen(true)}
        />
        
        <PanelGroup direction="horizontal" className="main-panels">
          {sidebarVisible && (
            <>
              <Panel id="sidebar" order={1} defaultSize={20} minSize={15} maxSize={40}>
                {activeView === 'debug' && (
                  <DebugToolbar
                    isDebugging={isDebugging}
                    isPaused={isPaused}
                    onStartDebug={() => handleDebugAction('startDebugSession')}
                    onStopDebug={() => handleDebugAction('stopDebugSession')}
                    onRestart={() => handleDebugAction('restartDebugSession')}
                    onStepOver={() => handleDebugAction('stepOver')}
                    onStepInto={() => handleDebugAction('stepInto')}
                    onStepOut={() => handleDebugAction('stepOut')}
                    onContinue={() => handleDebugAction('continue')}
                    onPause={() => handleDebugAction('pause')}
                  />
                )}
                <SideBar 
                  key={fileTreeKey}
                  activeView={activeView}
                  fileTree={fileTree}
                  selectedFile={openTabs.find(tab => tab.id === activeTabId)}
                  onFileSelect={handleFileSelect}
                  onToggleFolder={handleToggleFolder}
                  onFileOperation={handleFileOperation}
                  expandedFolders={expandedFolders}
                  isVisible={sidebarVisible}
                  debugVariables={debugVariables}
                  debugCallStack={debugCallStack}
                  debugWatchExpressions={debugWatchExpressions}
                  debugBreakpoints={debugBreakpoints}
                  isDebugging={isDebugging}
                  isPaused={isPaused}
                  onDebugAction={handleDebugAction}
                />
              </Panel>
              <PanelResizeHandle className="resize-handle" />
            </>
          )}
          
          <Panel id="main" order={2}>
            <PanelGroup direction="vertical">
              <Panel id="editor" order={1}>
                <div className="editor-container">
                  <Breadcrumb 
                    filePath={openTabs.find(tab => tab.id === activeTabId)?.path}
                    onNavigate={(path) => {
                      console.log('Navigate to:', path)
                      // Implement navigation to folder/file
                    }}
                  />
                  <EditorGroup 
                    tabs={openTabs}
                    activeTabId={activeTabId}
                    onTabChange={setActiveTabId}
                    onTabClose={(tabId) => {
                      setOpenTabs(prev => prev.filter(tab => tab.id !== tabId))
                      if (activeTabId === tabId) {
                        const remainingTabs = openTabs.filter(tab => tab.id !== tabId)
                        setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null)
                      }
                    }}
                    onContentChange={(tabId, content) => {
                      setOpenTabs(prev => prev.map(tab =>
                        tab.id === tabId 
                          ? { ...tab, content, isDirty: true }
                          : tab
                      ))
                    }}
                    onOpenAI={() => setAiChatOpen(true)}
                    onCreateNewFile={() => handleCreateFile()}
                    onDeleteFile={(path) => handleDeleteFile(path)}
                    onRunCode={handleRunCodeFromEditor}
                    loading={false}
                    showTerminal={terminalVisible}
                    onToggleTerminal={() => setTerminalVisible(prev => !prev)}
                    // Debug props
                    breakpoints={debugBreakpoints}
                    currentExecutionLine={debugCallStack[0] || null}
                    isDebugging={isDebugging}
                    isPaused={isPaused}
                    onDebugAction={handleDebugAction}
                  />
                </div>
              </Panel>
              
              {terminalVisible && (
                <>
                  <PanelResizeHandle className="resize-handle" />
                  <Panel id="terminal" order={2} defaultSize={30} minSize={20} maxSize={60}>
                    <Terminal 
                      executionService={executionServiceRef.current}
                      isVisible={terminalVisible}
                      onToggle={() => setTerminalVisible(false)}
                      currentFile={getCurrentFile()}
                      activeTab={activeTerminalTab}
                      onTabChange={setActiveTerminalTab}
                      triggerExecution={triggerExecution}
                      onExecutionTriggered={() => setTriggerExecution(false)}
                    />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
      
      <StatusBar 
        activeFile={openTabs.find(tab => tab.id === activeTabId)}
        onOpenAI={() => setAiChatOpen(true)}
        showTerminal={terminalVisible}
        onToggleTerminal={() => setTerminalVisible(!terminalVisible)}
        onOpenSourceControl={() => setActiveView('source-control')}
      />

      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onExecute={(command) => {
          console.log('Command executed:', command.id)
        }}
      />

      <QuickFilePicker
        isOpen={quickFilePickerOpen}
        onClose={() => setQuickFilePickerOpen(false)}
        fileTree={fileTree}
        recentFiles={recentFiles}
        onFileSelect={handleFileSelect}
      />
    </div>
  )
}

export default Workbench
