import { BrowserEventEmitter } from '../events/BrowserEventEmitter.js'
import AIService from '../ai/AIService'

/**
 * Command Service - Handles all IDE commands like VS Code
 * Supports AI-powered commands and traditional IDE actions
 */
class CommandService extends BrowserEventEmitter {
  constructor() {
    super()
    this.commands = new Map()
    this.recentCommands = []
    this.commandHistory = []
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return

    // Register core commands
    this.registerCoreCommands()
    
    // Register AI commands
    this.registerAICommands()
    
    // Register file commands
    this.registerFileCommands()
    
    // Register editor commands
    this.registerEditorCommands()

    this.isInitialized = true
    this.emit('initialized')
  }

  registerCoreCommands() {
    // File operations
    this.register('file.new', 'New File', async () => {
      this.emit('file.new')
    }, 'Ctrl+N')

    this.register('file.open', 'Open File', async () => {
      this.emit('file.open')
    }, 'Ctrl+O')

    this.register('file.save', 'Save File', async () => {
      this.emit('file.save')
    }, 'Ctrl+S')

    this.register('file.saveAll', 'Save All Files', async () => {
      this.emit('file.saveAll')
    }, 'Ctrl+K S')

    // View commands
    this.register('view.commandPalette', 'Show Command Palette', async () => {
      this.emit('view.commandPalette')
    }, 'Ctrl+Shift+P')

    this.register('view.quickOpen', 'Quick Open', async () => {
      this.emit('view.quickOpen')
    }, 'Ctrl+P')

    this.register('view.toggleSidebar', 'Toggle Sidebar', async () => {
      this.emit('view.toggleSidebar')
    }, 'Ctrl+B')

    this.register('view.toggleTerminal', 'Toggle Terminal', async () => {
      this.emit('view.toggleTerminal')
    }, 'Ctrl+`')

    // Search commands
    this.register('search.find', 'Find', async () => {
      this.emit('search.find')
    }, 'Ctrl+F')

    this.register('search.findInFiles', 'Find in Files', async () => {
      this.emit('search.findInFiles')
    }, 'Ctrl+Shift+F')

    this.register('search.replace', 'Replace', async () => {
      this.emit('search.replace')
    }, 'Ctrl+H')
  }

  registerAICommands() {
    // AI Chat Commands
    this.register('ai.chat.start', 'Start AI Chat', async () => {
      this.emit('ai.chat.start')
    }, 'Ctrl+Shift+A')

    this.register('ai.chat.explain', 'AI: Explain Code', async (context) => {
      const { selectedCode, language } = context || {}
      if (!selectedCode) {
        this.emit('message.show', 'Please select some code first')
        return
      }

      const response = await AIService.chatWithAI(
        `Explain this ${language} code: ${selectedCode}`,
        { type: 'code-explanation', language }
      )
      
      this.emit('ai.chat.response', response)
    }, 'Ctrl+K E')

    this.register('ai.complete.code', 'AI: Complete Code', async (context) => {
      const completion = await AIService.getCodeCompletion(context)
      this.emit('ai.completion.show', completion)
    }, 'Ctrl+Space')

    this.register('ai.refactor.code', 'AI: Refactor Code', async (context) => {
      const { selectedCode, language } = context || {}
      if (!selectedCode) {
        this.emit('message.show', 'Please select code to refactor')
        return
      }

      const refactored = await AIService.refactorCode(selectedCode, language, 'optimize')
      this.emit('ai.refactor.result', refactored)
    }, 'Ctrl+K R')

    this.register('ai.generate.code', 'AI: Generate Code', async () => {
      this.emit('ai.generate.prompt')
    }, 'Ctrl+K G')

    this.register('ai.analyze.code', 'AI: Analyze Code', async (context) => {
      const { selectedCode, language } = context || {}
      if (!selectedCode) {
        this.emit('message.show', 'Please select code to analyze')
        return
      }

      const analysis = await AIService.analyzeCode(selectedCode, language)
      this.emit('ai.analysis.result', analysis)
    }, 'Ctrl+K A')

    this.register('ai.fix.errors', 'AI: Fix Errors', async (context) => {
      const { errors, code, language } = context || {}
      if (!errors || errors.length === 0) {
        this.emit('message.show', 'No errors to fix')
        return
      }

      const fixPrompt = `Fix these errors in ${language} code:\n\nErrors: ${JSON.stringify(errors)}\n\nCode:\n${code}`
      const response = await AIService.chatWithAI(fixPrompt, { type: 'error-fixing' })
      this.emit('ai.chat.response', response)
    }, 'Ctrl+K F')

    this.register('ai.optimize.performance', 'AI: Optimize Performance', async (context) => {
      const { selectedCode, language } = context || {}
      const refactored = await AIService.refactorCode(selectedCode, language, 'performance')
      this.emit('ai.refactor.result', refactored)
    }, 'Ctrl+K O')

    this.register('ai.generate.tests', 'AI: Generate Tests', async (context) => {
      const { selectedCode, language } = context || {}
      const prompt = `Generate unit tests for this ${language} code: ${selectedCode}`
      const generated = await AIService.generateCode(prompt, language, { type: 'unit-tests' })
      this.emit('ai.generation.result', generated)
    }, 'Ctrl+K T')

    this.register('ai.generate.docs', 'AI: Generate Documentation', async (context) => {
      const { selectedCode, language } = context || {}
      const prompt = `Generate documentation for this ${language} code: ${selectedCode}`
      const response = await AIService.chatWithAI(prompt, { type: 'documentation' })
      this.emit('ai.chat.response', response)
    }, 'Ctrl+K D')
  }

  registerFileCommands() {
    this.register('file.newFolder', 'New Folder', async () => {
      this.emit('file.newFolder')
    })

    this.register('file.delete', 'Delete File', async (context) => {
      this.emit('file.delete', context)
    })

    this.register('file.rename', 'Rename File', async (context) => {
      this.emit('file.rename', context)
    })

    this.register('file.duplicate', 'Duplicate File', async (context) => {
      this.emit('file.duplicate', context)
    })
  }

  registerEditorCommands() {
    this.register('editor.formatDocument', 'Format Document', async () => {
      this.emit('editor.format')
    }, 'Shift+Alt+F')

    this.register('editor.commentLine', 'Toggle Line Comment', async () => {
      this.emit('editor.commentLine')
    }, 'Ctrl+/')

    this.register('editor.duplicateLine', 'Duplicate Line', async () => {
      this.emit('editor.duplicateLine')
    }, 'Shift+Alt+Down')

    this.register('editor.moveLinesUp', 'Move Lines Up', async () => {
      this.emit('editor.moveLinesUp')
    }, 'Alt+Up')

    this.register('editor.moveLinesDown', 'Move Lines Down', async () => {
      this.emit('editor.moveLinesDown')
    }, 'Alt+Down')

    this.register('editor.selectAll', 'Select All', async () => {
      this.emit('editor.selectAll')
    }, 'Ctrl+A')

    this.register('editor.undo', 'Undo', async () => {
      this.emit('editor.undo')
    }, 'Ctrl+Z')

    this.register('editor.redo', 'Redo', async () => {
      this.emit('editor.redo')
    }, 'Ctrl+Y')
  }

  register(id, title, handler, keybinding = null, category = 'General') {
    const command = {
      id,
      title,
      handler,
      keybinding,
      category,
      description: title,
      enabled: true
    }

    this.commands.set(id, command)
    return command
  }

  async execute(commandId, context = {}) {
    const command = this.commands.get(commandId)
    if (!command) {
      console.warn(`Command not found: ${commandId}`)
      return false
    }

    if (!command.enabled) {
      console.warn(`Command disabled: ${commandId}`)
      return false
    }

    try {
      // Add to history
      this.addToHistory(commandId)
      
      // Execute command
      await command.handler(context)
      
      this.emit('command.executed', { commandId, context })
      return true
    } catch (error) {
      console.error(`Command execution failed: ${commandId}`, error)
      this.emit('command.error', { commandId, error })
      return false
    }
  }

  getCommands(category = null) {
    const commands = Array.from(this.commands.values())
    
    if (category) {
      return commands.filter(cmd => cmd.category === category)
    }
    
    return commands
  }

  searchCommands(query) {
    if (!query) return this.getCommands()
    
    const searchTerm = query.toLowerCase()
    return this.getCommands().filter(cmd => 
      cmd.title.toLowerCase().includes(searchTerm) ||
      cmd.id.toLowerCase().includes(searchTerm) ||
      cmd.description.toLowerCase().includes(searchTerm)
    )
  }

  getRecentCommands(limit = 10) {
    return this.recentCommands.slice(0, limit)
  }

  addToHistory(commandId) {
    // Add to recent commands
    this.recentCommands = this.recentCommands.filter(id => id !== commandId)
    this.recentCommands.unshift(commandId)
    this.recentCommands = this.recentCommands.slice(0, 20) // Keep last 20

    // Add to full history
    this.commandHistory.push({
      commandId,
      timestamp: Date.now()
    })
  }

  getCommandByKeybinding(keybinding) {
    return Array.from(this.commands.values()).find(cmd => cmd.keybinding === keybinding)
  }

  enableCommand(commandId) {
    const command = this.commands.get(commandId)
    if (command) {
      command.enabled = true
    }
  }

  disableCommand(commandId) {
    const command = this.commands.get(commandId)
    if (command) {
      command.enabled = false
    }
  }

  unregister(commandId) {
    return this.commands.delete(commandId)
  }

  getCategories() {
    const categories = new Set()
    this.commands.forEach(cmd => categories.add(cmd.category))
    return Array.from(categories)
  }

  async healthCheck() {
    return {
      status: this.isInitialized ? 'healthy' : 'not-initialized',
      commandCount: this.commands.size,
      recentCommands: this.recentCommands.length,
      categories: this.getCategories().length
    }
  }
}

export default new CommandService()
