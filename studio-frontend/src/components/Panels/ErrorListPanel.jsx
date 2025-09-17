import React, { useState, useEffect } from 'react'
import { AlertCircle, AlertTriangle, Info, X, ChevronDown, ChevronRight } from 'lucide-react'
import './ErrorListPanel.css'

const ErrorListPanel = ({ 
  isVisible = false, 
  onToggle,
  currentFile = null,
  editor = null 
}) => {
  const [errors, setErrors] = useState([])
  const [filter, setFilter] = useState('all') // all, errors, warnings, info
  const [groupByFile, setGroupByFile] = useState(true)

  useEffect(() => {
    if (!editor || !window.monaco) return

    const updateErrors = () => {
      const model = editor.getModel()
      if (!model) return

      const markers = window.monaco.editor.getModelMarkers({ resource: model.uri })
      const errorList = markers.map(marker => ({
        severity: marker.severity,
        message: marker.message,
        startLineNumber: marker.startLineNumber,
        startColumn: marker.startColumn,
        endLineNumber: marker.endLineNumber,
        endColumn: marker.endColumn,
        fileName: currentFile?.name || 'untitled',
        filePath: currentFile?.path || 'untitled',
        source: marker.source || 'JavaScript'
      }))

      setErrors(errorList)
    }

    // Update errors when markers change
    const disposable = window.monaco.editor.onDidChangeMarkers(() => {
      updateErrors()
    })

    // Initial update
    updateErrors()

    return () => {
      disposable.dispose()
    }
  }, [editor, currentFile])

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 8: // Error
        return <AlertCircle size={16} className="error-icon" />
      case 4: // Warning  
        return <AlertTriangle size={16} className="warning-icon" />
      case 2: // Info
        return <Info size={16} className="info-icon" />
      default:
        return <Info size={16} className="info-icon" />
    }
  }

  const getSeverityText = (severity) => {
    switch (severity) {
      case 8: return 'Error'
      case 4: return 'Warning'
      case 2: return 'Info'
      default: return 'Info'
    }
  }

  const filteredErrors = errors.filter(error => {
    if (filter === 'all') return true
    if (filter === 'errors') return error.severity === 8
    if (filter === 'warnings') return error.severity === 4
    if (filter === 'info') return error.severity === 2
    return true
  })

  const errorCount = errors.filter(e => e.severity === 8).length
  const warningCount = errors.filter(e => e.severity === 4).length
  const infoCount = errors.filter(e => e.severity === 2).length

  const handleErrorClick = (error) => {
    if (editor) {
      editor.revealLineInCenter(error.startLineNumber)
      editor.setPosition({
        lineNumber: error.startLineNumber,
        column: error.startColumn
      })
      editor.focus()
    }
  }

  const groupedErrors = groupByFile 
    ? filteredErrors.reduce((groups, error) => {
        const file = error.fileName
        if (!groups[file]) groups[file] = []
        groups[file].push(error)
        return groups
      }, {})
    : { 'All Files': filteredErrors }

  if (!isVisible) return null

  return (
    <div className="error-list-panel">
      <div className="error-list-header">
        <div className="error-list-title">
          <span>Problems</span>
          <div className="error-counts">
            {errorCount > 0 && (
              <span className="error-count">
                <AlertCircle size={12} />
                {errorCount}
              </span>
            )}
            {warningCount > 0 && (
              <span className="warning-count">
                <AlertTriangle size={12} />
                {warningCount}
              </span>
            )}
            {infoCount > 0 && (
              <span className="info-count">
                <Info size={12} />
                {infoCount}
              </span>
            )}
          </div>
        </div>
        
        <div className="error-list-actions">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'errors' ? 'active' : ''}
              onClick={() => setFilter('errors')}
            >
              Errors
            </button>
            <button 
              className={filter === 'warnings' ? 'active' : ''}
              onClick={() => setFilter('warnings')}
            >
              Warnings
            </button>
            <button 
              className={filter === 'info' ? 'active' : ''}
              onClick={() => setFilter('info')}
            >
              Info
            </button>
          </div>
          
          <button 
            className="group-toggle"
            onClick={() => setGroupByFile(!groupByFile)}
            title={groupByFile ? 'Ungroup by file' : 'Group by file'}
          >
            {groupByFile ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          <button 
            className="close-btn"
            onClick={onToggle}
            title="Close Problems Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="error-list-content">
        {Object.keys(groupedErrors).length === 0 ? (
          <div className="no-problems">
            <Info size={24} />
            <p>No problems detected</p>
          </div>
        ) : (
          Object.entries(groupedErrors).map(([fileName, fileErrors]) => (
            <div key={fileName} className="error-group">
              {groupByFile && Object.keys(groupedErrors).length > 1 && (
                <div className="error-group-header">
                  <ChevronDown size={16} />
                  <span className="file-name">{fileName}</span>
                  <span className="error-count">({fileErrors.length})</span>
                </div>
              )}
              
              <div className="error-list">
                {fileErrors.map((error, index) => (
                  <div 
                    key={index}
                    className="error-item"
                    onClick={() => handleErrorClick(error)}
                  >
                    <div className="error-icon-container">
                      {getSeverityIcon(error.severity)}
                    </div>
                    
                    <div className="error-details">
                      <div className="error-message">{error.message}</div>
                      <div className="error-location">
                        {!groupByFile && <span className="file-name">{error.fileName}</span>}
                        <span className="line-col">
                          Line {error.startLineNumber}, Column {error.startColumn}
                        </span>
                        <span className="error-source">[{error.source}]</span>
                      </div>
                    </div>
                    
                    <div className="error-severity">
                      {getSeverityText(error.severity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ErrorListPanel
