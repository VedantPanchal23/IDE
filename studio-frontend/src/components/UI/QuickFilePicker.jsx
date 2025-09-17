import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search, File, Folder, Clock } from 'lucide-react'
import './QuickFilePicker.css'

const QuickFilePicker = ({
  isOpen,
  onClose,
  fileTree = [],
  recentFiles = [],
  onFileSelect
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Flatten file tree for searching
  const allFiles = useMemo(() => {
    const flatten = (items, parentPath = '') => {
      let files = []
      items.forEach(item => {
        const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name
        if (item.type === 'file') {
          files.push({
            name: item.name,
            path: item.path || fullPath,
            fullPath,
            type: 'file'
          })
        } else if (item.children) {
          files = files.concat(flatten(item.children, fullPath))
        }
      })
      return files
    }
    return flatten(fileTree)
  }, [fileTree])

  // Filter and score files based on query
  const filteredFiles = useMemo(() => {
    if (!query) {
      return recentFiles.slice(0, 10).map(file => ({ ...file, score: 0, isRecent: true }))
    }

    const queryLower = query.toLowerCase()
    const scored = allFiles
      .map(file => {
        const fileName = file.name.toLowerCase()
        const filePath = file.fullPath.toLowerCase()

        let score = 0

        // Exact match
        if (fileName === queryLower) score += 100
        // Starts with query
        else if (fileName.startsWith(queryLower)) score += 80
        // Contains query in filename
        else if (fileName.includes(queryLower)) score += 60
        // Contains query in path
        else if (filePath.includes(queryLower)) score += 40
        // Fuzzy match
        else if (fuzzyMatch(fileName, queryLower)) score += 20

        return { ...file, score }
      })
      .filter(file => file.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)

    return scored
  }, [query, allFiles, recentFiles])

  // Fuzzy matching algorithm
  const fuzzyMatch = (text, pattern) => {
    let textIndex = 0
    let patternIndex = 0

    while (textIndex < text.length && patternIndex < pattern.length) {
      if (text[textIndex] === pattern[patternIndex]) {
        patternIndex++
      }
      textIndex++
    }

    return patternIndex === pattern.length
  }

  // Highlight matching characters
  const highlightMatch = (text, query) => {
    if (!query) return text

    const regex = new RegExp(`(${query.split('').join('|')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return <span key={index} className="highlight">{part}</span>
      }
      return part
    })
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredFiles.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredFiles[selectedIndex]) {
            handleSelect(filteredFiles[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredFiles, selectedIndex, onClose])

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex]
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }
  }, [selectedIndex])

  const handleSelect = (file) => {
    onFileSelect?.(file)
    onClose()
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const iconMap = {
      'js': '',
      'jsx': '⚛️',
      'ts': '🟦',
      'tsx': '⚛️',
      'json': '📋',
      'css': '🎨',
      'html': '🌐',
      'md': '',
      'py': '🐍'
    }
    return iconMap[ext] || ''
  }

  if (!isOpen) return null

  return (
    <div className="quick-file-picker-overlay" onClick={onClose}>
      <div className="quick-file-picker" onClick={e => e.stopPropagation()}>
        <div className="search-header">
          <Search size={16} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search files by name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="search-input"
          />
          <div className="search-hint">
            Use ↑↓ to navigate, Enter to open, Esc to close
          </div>
        </div>

        <div className="file-list" ref={listRef}>
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file, index) => (
              <div
                key={file.path}
                className={`file-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(file)}
              >
                <div className="file-icon">
                  {file.isRecent && <Clock size={12} className="recent-icon" />}
                  <span>{getFileIcon(file.name)}</span>
                </div>
                <div className="file-info">
                  <div className="file-name">
                    {highlightMatch(file.name, query)}
                  </div>
                  <div className="file-path">
                    {highlightMatch(file.fullPath, query)}
                  </div>
                </div>
                {file.isRecent && (
                  <div className="recent-badge">Recent</div>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state">
              {query ? (
                <div>
                  <File size={32} className="empty-icon" />
                  <p>No files found matching "{query}"</p>
                  <small>Try a different search term</small>
                </div>
              ) : (
                <div>
                  <Clock size={32} className="empty-icon" />
                  <p>No recent files</p>
                  <small>Recently opened files will appear here</small>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="picker-footer">
          <div className="results-count">
            {filteredFiles.length > 0 && (
              <span>{filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="keyboard-shortcuts">
            <span className="shortcut">Ctrl+P</span> to open
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickFilePicker
