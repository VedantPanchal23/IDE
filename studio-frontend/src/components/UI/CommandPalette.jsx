import React, { useState, useRef, useEffect } from 'react'
import { Search, History, Star, X } from 'lucide-react'
import './CommandPalette.css'

const CommandPalette = ({ 
  isOpen, 
  onClose, 
  commands = [], 
  onCommandExecute,
  recentCommands = []
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.command.toLowerCase().includes(query.toLowerCase())
  )

  const displayCommands = query ? filteredCommands : recentCommands.slice(0, 10)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < displayCommands.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (displayCommands[selectedIndex]) {
          handleCommandSelect(displayCommands[selectedIndex])
        }
        break
    }
  }

  const handleCommandSelect = (command) => {
    onCommandExecute(command)
    onClose()
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-input-container">
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
          <X size={16} className="close-icon" onClick={onClose} />
        </div>
        
        <div className="command-list">
          {displayCommands.length > 0 ? (
            displayCommands.map((command, index) => (
              <div
                key={command.command}
                className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleCommandSelect(command)}
              >
                <div className="command-info">
                  <div className="command-title">{command.title}</div>
                  <div className="command-subtitle">{command.command}</div>
                </div>
                
                <div className="command-meta">
                  {!query && recentCommands.includes(command) && (
                    <History size={14} className="recent-icon" />
                  )}
                  {command.keybinding && (
                    <span className="keybinding">{command.keybinding}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-commands">
              {query ? `No commands found for "${query}"` : 'No recent commands'}
            </div>
          )}
        </div>
        
        <div className="command-palette-footer">
          <span>↑↓ to navigate • Enter to select • Esc to close</span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
