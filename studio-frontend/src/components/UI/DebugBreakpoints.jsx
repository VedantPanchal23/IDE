import React, { useState } from 'react'
import { Circle, X, MoreHorizontal, ChevronRight, ChevronDown } from 'lucide-react'
import './DebugBreakpoints.css'

const DebugBreakpoints = ({ 
  breakpoints = [], 
  onToggleBreakpoint, 
  onRemoveBreakpoint, 
  onRemoveAllBreakpoints,
  onGoToBreakpoint 
}) => {
  const [expandedFiles, setExpandedFiles] = useState(new Set())

  // Group breakpoints by file
  const groupedBreakpoints = breakpoints.reduce((groups, bp, index) => {
    const fileName = bp.fileName || 'Unknown File'
    if (!groups[fileName]) {
      groups[fileName] = []
    }
    groups[fileName].push({ ...bp, index })
    return groups
  }, {})

  const toggleFileExpansion = (fileName) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(fileName)) {
      newExpanded.delete(fileName)
    } else {
      newExpanded.add(fileName)
    }
    setExpandedFiles(newExpanded)
  }

  const formatLinePreview = (line) => {
    if (!line) return ''
    return line.trim().substring(0, 50) + (line.trim().length > 50 ? '...' : '')
  }

  const getBreakpointIcon = (bp) => {
    if (!bp.enabled) {
      return <Circle size={12} className="breakpoint-icon disabled" />
    }
    if (bp.condition) {
      return <Circle size={12} className="breakpoint-icon conditional" />
    }
    return <Circle size={12} className="breakpoint-icon enabled" />
  }

  return (
    <div className="debug-breakpoints">
      <div className="breakpoints-header">
        <div className="header-title">
          <Circle size={16} />
          <span>Breakpoints</span>
        </div>
        <div className="header-actions">
          <button
            className="breakpoints-action"
            onClick={() => onRemoveAllBreakpoints?.()}
            title="Remove All Breakpoints"
            disabled={breakpoints.length === 0}
          >
            <X size={14} />
          </button>
          <button className="breakpoints-action" title="More Actions">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
      
      <div className="breakpoints-content">
        {Object.keys(groupedBreakpoints).length > 0 ? (
          <div className="breakpoints-list">
            {Object.entries(groupedBreakpoints).map(([fileName, fileBreakpoints]) => {
              const isExpanded = expandedFiles.has(fileName)
              
              return (
                <div key={fileName} className="breakpoints-file-group">
                  <div 
                    className="file-header"
                    onClick={() => toggleFileExpansion(fileName)}
                  >
                    <div className="file-expand">
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </div>
                    <span className="file-name">{fileName}</span>
                    <span className="file-count">({fileBreakpoints.length})</span>
                  </div>
                  
                  {isExpanded && (
                    <div className="file-breakpoints">
                      {fileBreakpoints.map((bp) => (
                        <div 
                          key={bp.index}
                          className={`breakpoint-item ${!bp.enabled ? 'disabled' : ''}`}
                        >
                          <div className="breakpoint-main">
                            <div 
                              className="breakpoint-toggle"
                              onClick={() => onToggleBreakpoint?.(bp.index)}
                            >
                              {getBreakpointIcon(bp)}
                            </div>
                            
                            <div 
                              className="breakpoint-info"
                              onClick={() => onGoToBreakpoint?.(bp)}
                            >
                              <div className="breakpoint-location">
                                Line {bp.lineNumber}
                                {bp.columnNumber && `:${bp.columnNumber}`}
                              </div>
                              {bp.lineContent && (
                                <div className="breakpoint-preview">
                                  {formatLinePreview(bp.lineContent)}
                                </div>
                              )}
                              {bp.condition && (
                                <div className="breakpoint-condition">
                                  Condition: {bp.condition}
                                </div>
                              )}
                            </div>
                            
                            <button
                              className="breakpoint-remove"
                              onClick={() => onRemoveBreakpoint?.(bp.index)}
                              title="Remove Breakpoint"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="breakpoints-empty">
            <p>No breakpoints set</p>
            <small>Click in the editor gutter to add breakpoints</small>
          </div>
        )}
      </div>
    </div>
  )
}

export default DebugBreakpoints
