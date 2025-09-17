import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Code2, 
  Variable, 
  Type, 
  Package, 
  Hash, 
  FileText, 
  ChevronRight, 
  Filter,
  X,
  ArrowRight
} from 'lucide-react'
import './SymbolSearch.css'

const SymbolSearch = ({ isOpen, onClose, onGoToSymbol, fileTree, currentFile }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filter, setFilter] = useState('all') // 'all', 'functions', 'variables', 'classes'
  const [searchScope, setSearchScope] = useState('project') // 'project', 'file'
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query) {
      performSymbolSearch(query)
    } else {
      setResults([])
    }
    setSelectedIndex(0)
  }, [query, filter, searchScope])

  const performSymbolSearch = (searchQuery) => {
    const symbols = []
    
    if (searchScope === 'project') {
      // Search across all files in the project
      symbols.push(...searchInProject(searchQuery))
    } else {
      // Search only in current file
      symbols.push(...searchInCurrentFile(searchQuery))
    }

    // Filter by symbol type
    const filteredSymbols = symbols.filter(symbol => {
      if (filter === 'all') return true
      return symbol.type === filter
    })

    // Sort by relevance (exact matches first, then partial matches)
    filteredSymbols.sort((a, b) => {
      const aExact = a.name.toLowerCase() === searchQuery.toLowerCase()
      const bExact = b.name.toLowerCase() === searchQuery.toLowerCase()
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      const aStartsWith = a.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      const bStartsWith = b.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      
      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1
      
      return a.name.localeCompare(b.name)
    })

    setResults(filteredSymbols.slice(0, 50)) // Limit results
  }

  const searchInProject = (searchQuery) => {
    // Mock project-wide symbol search
    // In a real implementation, this would parse all files in the project
    const mockSymbols = [
      {
        name: 'useState',
        type: 'functions',
        file: 'src/components/App.jsx',
        line: 5,
        signature: 'useState(initialState)',
        description: 'React hook for state management',
        icon: Code2
      },
      {
        name: 'useEffect',
        type: 'functions',
        file: 'src/components/App.jsx',
        line: 12,
        signature: 'useEffect(effect, deps)',
        description: 'React hook for side effects',
        icon: Code2
      },
      {
        name: 'handleSubmit',
        type: 'functions',
        file: 'src/components/Form.jsx',
        line: 25,
        signature: 'handleSubmit(event)',
        description: 'Form submission handler',
        icon: Code2
      },
      {
        name: 'UserContext',
        type: 'classes',
        file: 'src/contexts/UserContext.js',
        line: 8,
        signature: 'class UserContext',
        description: 'User context provider',
        icon: Type
      },
      {
        name: 'API_BASE_URL',
        type: 'variables',
        file: 'src/config/constants.js',
        line: 3,
        signature: 'const API_BASE_URL',
        description: 'Base URL for API requests',
        icon: Variable
      },
      {
        name: 'validateEmail',
        type: 'functions',
        file: 'src/utils/validation.js',
        line: 15,
        signature: 'validateEmail(email)',
        description: 'Email validation utility',
        icon: Code2
      },
      {
        name: 'ThemeProvider',
        type: 'classes',
        file: 'src/components/ThemeProvider.jsx',
        line: 10,
        signature: 'class ThemeProvider',
        description: 'Theme context provider',
        icon: Type
      },
      {
        name: 'formatDate',
        type: 'functions',
        file: 'src/utils/dateUtils.js',
        line: 8,
        signature: 'formatDate(date, format)',
        description: 'Date formatting utility',
        icon: Code2
      }
    ]

    return mockSymbols.filter(symbol => 
      symbol.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const searchInCurrentFile = (searchQuery) => {
    // Mock current file symbol search
    // In a real implementation, this would parse the current file content
    if (!currentFile) return []

    const mockCurrentFileSymbols = [
      {
        name: 'EditorGroup',
        type: 'classes',
        file: currentFile.name,
        line: 1,
        signature: 'const EditorGroup',
        description: 'Main editor component',
        icon: Type
      },
      {
        name: 'handleTabChange',
        type: 'functions',
        file: currentFile.name,
        line: 45,
        signature: 'handleTabChange(tabId)',
        description: 'Tab change handler',
        icon: Code2
      },
      {
        name: 'activeTabId',
        type: 'variables',
        file: currentFile.name,
        line: 15,
        signature: 'const [activeTabId, setActiveTabId]',
        description: 'Active tab state',
        icon: Variable
      }
    ]

    return mockCurrentFileSymbols.filter(symbol => 
      symbol.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelectSymbol(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleSelectSymbol = (symbol) => {
    if (onGoToSymbol) {
      onGoToSymbol(symbol.file, symbol.line, symbol.name)
    }
    onClose()
  }

  const getSymbolIcon = (symbol) => {
    const IconComponent = symbol.icon
    return <IconComponent size={16} className={`symbol-icon symbol-icon-${symbol.type}`} />
  }

  const getFilterIcon = (filterType) => {
    switch (filterType) {
      case 'functions':
        return <Code2 size={14} />
      case 'variables':
        return <Variable size={14} />
      case 'classes':
        return <Type size={14} />
      default:
        return <Hash size={14} />
    }
  }

  if (!isOpen) return null

  return (
    <div className="symbol-search-overlay" onClick={onClose}>
      <div className="symbol-search-container" onClick={e => e.stopPropagation()}>
        <div className="symbol-search-header">
          <div className="symbol-search-input-container">
            <Search size={16} className="symbol-search-input-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search symbols..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="symbol-search-input"
            />
            <button className="symbol-search-close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
          
          <div className="symbol-search-filters">
            <div className="symbol-search-scope">
              <button
                className={`symbol-search-scope-btn ${searchScope === 'project' ? 'active' : ''}`}
                onClick={() => setSearchScope('project')}
              >
                <Package size={12} />
                Project
              </button>
              <button
                className={`symbol-search-scope-btn ${searchScope === 'file' ? 'active' : ''}`}
                onClick={() => setSearchScope('file')}
              >
                <FileText size={12} />
                File
              </button>
            </div>
            
            <div className="symbol-search-type-filters">
              {['all', 'functions', 'variables', 'classes'].map(filterType => (
                <button
                  key={filterType}
                  className={`symbol-search-filter-btn ${filter === filterType ? 'active' : ''}`}
                  onClick={() => setFilter(filterType)}
                  title={`Filter by ${filterType}`}
                >
                  {getFilterIcon(filterType)}
                  <span>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="symbol-search-results">
          {results.length === 0 && query && (
            <div className="symbol-search-no-results">
              <Search size={24} />
              <p>No symbols found</p>
              <span>Try a different search term or change the scope</span>
            </div>
          )}
          
          {results.length === 0 && !query && (
            <div className="symbol-search-help">
              <div className="symbol-search-help-item">
                <Hash size={16} />
                <span>Search for functions, variables, classes, and more</span>
              </div>
              <div className="symbol-search-help-item">
                <Package size={16} />
                <span>Use Project scope to search across all files</span>
              </div>
              <div className="symbol-search-help-item">
                <FileText size={16} />
                <span>Use File scope to search in current file only</span>
              </div>
              <div className="symbol-search-help-item">
                <Filter size={16} />
                <span>Filter results by symbol type</span>
              </div>
            </div>
          )}

          {results.map((symbol, index) => (
            <div
              key={`${symbol.file}-${symbol.line}-${symbol.name}`}
              className={`symbol-search-result ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectSymbol(symbol)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="symbol-search-result-icon">
                {getSymbolIcon(symbol)}
              </div>
              
              <div className="symbol-search-result-content">
                <div className="symbol-search-result-header">
                  <span className="symbol-search-result-name">{symbol.name}</span>
                  <span className="symbol-search-result-signature">{symbol.signature}</span>
                </div>
                
                <div className="symbol-search-result-details">
                  <span className="symbol-search-result-file">{symbol.file}</span>
                  <span className="symbol-search-result-line">:{symbol.line}</span>
                  {symbol.description && (
                    <span className="symbol-search-result-description"> - {symbol.description}</span>
                  )}
                </div>
              </div>
              
              <div className="symbol-search-result-action">
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>

        <div className="symbol-search-footer">
          <div className="symbol-search-shortcuts">
            <kbd>↑↓</kbd> Navigate
            <kbd>Enter</kbd> Go to Symbol
            <kbd>Esc</kbd> Close
          </div>
          <div className="symbol-search-count">
            {results.length > 0 && `${results.length} results`}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SymbolSearch
