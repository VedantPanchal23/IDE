import React, { useState, useEffect, useRef } from 'react'
import { Search, Command, Zap, Keyboard } from 'lucide-react'
import CommandService from '../../platform/commands/CommandService'
import './CommandPalette.css'

const CommandPalette = ({ isOpen, onClose, onExecute }) => {
  const [query, setQuery] = useState('')
  const [filteredCommands, setFilteredCommands] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentCommands, setRecentCommands] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      loadCommands()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.trim()) {
      const commands = CommandService.searchCommands(query)
      setFilteredCommands(commands)
    } else {
      const recent = CommandService.getRecentCommands(5)
      const allCommands = CommandService.getCommands()
      setFilteredCommands([
        ...recent.map(id => allCommands.find(cmd => cmd.id === id)).filter(Boolean),
        ...allCommands.slice(0, 10)
      ])
    }
    setSelectedIndex(0)
  }, [query])

  const loadCommands = () => {
    const recent = CommandService.getRecentCommands()
    setRecentCommands(recent)
    
    if (!query.trim()) {
      const commands = CommandService.getCommands()
      setFilteredCommands(commands.slice(0, 10))
    }
  }

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredCommands.length - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex])
        }
        break
    }
  }

  const executeCommand = async (command) => {
    try {
      await CommandService.execute(command.id)
      if (onExecute) {
        onExecute(command)
      }
      onClose()
      setQuery('')
    } catch (error) {
      console.error('Failed to execute command:', error)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'AI':
        return <Zap size={16} className="category-icon ai" />
      case 'File':
        return <Command size={16} className="category-icon file" />
      case 'Editor':
        return <Keyboard size={16} className="category-icon editor" />
      default:
        return <Command size={16} className="category-icon general" />
    }
  }

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="highlight">{part}</span>
      ) : part
    )
  }

  if (!isOpen) return null

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-palette-header">
          <Search size={16} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="command-input"
          />
          <kbd className="escape-hint">Esc</kbd>
        </div>

        <div className="command-list">
          {filteredCommands.length === 0 ? (
            <div className="no-commands">
              <Command size={24} />
              <p>No commands found</p>
              <span>Try a different search term</span>
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => executeCommand(command)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="command-icon">
                  {getCategoryIcon(command.category)}
                </div>
                
                <div className="command-content">
                  <div className="command-title">
                    {highlightMatch(command.title, query)}
                  </div>
                  <div className="command-description">
                    {command.description}
                  </div>
                  {command.category && (
                    <div className="command-category">
                      {command.category}
                    </div>
                  )}
                </div>

                {command.keybinding && (
                  <div className="command-keybinding">
                    <kbd>{command.keybinding}</kbd>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {recentCommands.length > 0 && !query.trim() && (
          <div className="recent-commands">
            <div className="recent-header">Recent Commands</div>
            <div className="recent-list">
              {recentCommands.slice(0, 3).map(commandId => {
                const command = CommandService.getCommands().find(cmd => cmd.id === commandId)
                return command ? (
                  <div key={commandId} className="recent-item">
                    {getCategoryIcon(command.category)}
                    <span>{command.title}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>
        )}

        <div className="command-palette-footer">
          <div className="tips">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Execute</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
