# Frontend - VS Code Studio IDE

A professional Visual Studio Code-inspired IDE built with React and modern web technologies.

![VS Code Studio](./public/vite.svg)

## ✨ Features

### 🎯 **50% Milestone Achieved - JavaScript IDE**
- **Professional IDE Interface** - Complete VS Code-inspired layout
- **Monaco Editor Integration** - Full code editing with IntelliSense
- **JavaScript Execution** - Live code running and debugging
- **File Management System** - Complete file operations with UI
- **Terminal Integration** - Interactive JavaScript console
- **Service Architecture** - Professional dependency injection system

### 🎨 **Perfect VS Code Replica**
- **Identical UI/UX**: Pixel-perfect recreation of VS Code's interface
- **Authentic Styling**: Original VS Code dark theme, colors, and fonts
- **Complete Layout**: Title bar, activity bar, sidebar, editor, panel, and status bar
- **Resizable Panels**: Fully resizable interface components
- **Tab Management**: Multiple file tabs with dirty indicators

###  **Advanced Editor**
- **Monaco Editor**: The same editor that powers VS Code
- **Syntax Highlighting**: Support for JavaScript and other languages
- **IntelliSense**: Auto-completion and error detection
- **Code Formatting**: Automatic code formatting and linting
- **Multi-cursor Support**: Advanced editing capabilities

### 🗂️ **File Management**
- **File Explorer**: Interactive tree view with folder expansion/collapse
- **File Operations**: Create, edit, delete, and move files
- **Workspace Loading**: Sample JavaScript project with Express.js
- **File Tree UI**: Professional file browser in sidebar

### ⚡ **JavaScript Execution & Debugging**
- **Live Code Execution**: Run JavaScript code in browser environment
- **Console Output**: Real-time console.log, error, warn output capture
- **Breakpoint Support**: Set/remove breakpoints for debugging
- **Variable Watching**: Monitor variable values during execution
- **Interactive Terminal**: Execute code snippets with command history

### 🔧 **Development Tools**
- **Integrated Terminal**: JavaScript execution terminal
- **Debug Console**: Debugging tools with breakpoint support
- **Output Panel**: Real-time code execution results
- **Error Handling**: Comprehensive error detection and reporting

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Start both frontend and backend simultaneously
   npm run dev:full
   
   # Or start them separately:
   npm run dev      # Frontend (Vite) - http://localhost:5173
   npm run server   # Backend (Express) - http://localhost:3001
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Architecture

### Frontend (React + Vite)
```
src/
├── components/
│   ├── IDE.jsx              # Main IDE container
│   ├── TitleBar.jsx         # VS Code title bar
│   ├── ActivityBar.jsx      # Left activity sidebar
│   ├── SideBar.jsx          # File explorer & views
│   ├── EditorGroup.jsx      # Monaco editor tabs
│   ├── Panel.jsx            # Bottom panel (terminal, etc.)
│   ├── StatusBar.jsx        # Bottom status bar
│   └── AIAssistant.jsx      # AI chat interface
├── config/
│   └── theme.js             # VS Code theme configuration
├── App.jsx                  # Root application
└── main.jsx                 # Entry point
```

### Backend (Node.js + Express)
```
server-simple.cjs            # Express server with Socket.io
├── File system API          # CRUD operations for files
├── AI integration           # Code completion & chat
├── Terminal simulation      # Command execution
└── Real-time sync           # WebSocket communication
```

## 🎯 Key Components

### 1. **IDE Component** (`src/components/IDE.jsx`)
- Main container orchestrating all UI components
- State management for files, tabs, and UI panels
- Event handling for file operations and UI interactions

### 2. **Monaco Editor Integration** (`src/components/EditorGroup.jsx`)
- VS Code's Monaco editor with full feature set
- Custom theme matching VS Code dark theme
- Multi-language syntax highlighting
- IntelliSense and auto-completion

### 3. **AI Assistant** (`src/components/AIAssistant.jsx`)
- Interactive chat interface for coding help
- Context-aware responses
- Code examples and explanations
- Integration with main editor

### 4. **File System** (`server-simple.cjs`)
- In-memory file system for demo purposes
- RESTful API for file operations
- Real-time synchronization via WebSocket

## 🔌 API Endpoints

### File Operations
- `GET /api/files` - Get file system structure
- `POST /api/get-file` - Get file content
- `POST /api/save-file` - Save file changes
- `POST /api/create-file` - Create new file
- `POST /api/delete-file` - Delete file

### AI Features
- `POST /api/ai/complete` - Code completion
- `POST /api/ai/chat` - AI assistant chat

### Terminal
- `POST /api/terminal/execute` - Execute terminal commands

## 🎨 Theming & Styling

The IDE uses VS Code's exact color scheme and styling:

```css
/* Key VS Code Colors */
--vscode-editor-background: #1e1e1e
--vscode-sideBar-background: #252526
--vscode-activityBar-background: #2f3129
--vscode-statusBar-background: #007acc
--vscode-tab-activeBackground: #1e1e1e
```

**Fonts:**
- UI: Segoe UI, Tahoma, Geneva, Verdana
- Editor: Cascadia Code, Fira Code, Consolas, Courier New

## 🔧 Configuration

### VS Code Theme (`src/config/theme.js`)
Complete VS Code theme configuration including:
- Color palette
- Syntax highlighting rules
- Font specifications
- Component sizing

### Editor Settings
Monaco editor configured with:
- VS Code keybindings
- IntelliSense enabled
- Auto-formatting
- Bracket pair colorization
- Minimap support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Microsoft VS Code** - For the amazing editor and UI inspiration
- **Monaco Editor** - For the powerful web editor
- **React** - For the component framework
- **Socket.io** - For real-time communication
- **Vite** - For the fast development server

## 🚧 Roadmap

- [ ] **Advanced AI Features**
  - Code refactoring suggestions
  - Automated testing generation
  - Code review assistance

- [ ] **Enhanced File System**
  - Git integration
  - Remote repository support
  - File versioning

- [ ] **Collaboration Features**
  - Voice/video chat
  - Screen sharing
  - User presence indicators

- [ ] **Extension System**
  - Plugin architecture
  - Theme customization
  - Custom commands

- [ ] **Performance Optimization**
  - Code splitting
  - Lazy loading
  - Service worker caching

## 📞 Support

For support, email [your-email] or join our [Discord server].

---

**Made with ❤️ by [Your Name]**

*A tribute to VS Code - bringing the best IDE experience to the web with AI superpowers!*
