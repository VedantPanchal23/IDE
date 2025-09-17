import React, { useState } from 'react'
import FileExplorer from './FileExplorer'
import DebugVariables from './DebugVariables'
import DebugCallStack from './DebugCallStack'
import DebugWatch from './DebugWatch'
import DebugBreakpoints from './DebugBreakpoints'
import DebugTestRunner from './DebugTestRunner'
import './SideBar.css'

const SideBar = ({ 
  activeView, 
  fileTree, 
  onFileSelect, 
  onToggleFolder,
  onFileOperation,
  selectedFile,
  expandedFolders = new Set(),
  isVisible = true,
  // Debug props
  debugVariables = {},
  debugCallStack = [],
  debugWatchExpressions = [],
  debugBreakpoints = [],
  isDebugging = false,
  isPaused = false,
  onDebugAction
}) => {
  const [expandedVariablePaths, setExpandedVariablePaths] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const renderView = () => {
    switch (activeView) {
      case 'explorer':
        return (
          <FileExplorer
            fileTree={fileTree}
            onFileSelect={onFileSelect}
            onToggleFolder={onToggleFolder}
            onFileOperation={onFileOperation}
            selectedFile={selectedFile}
            expandedFolders={expandedFolders}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )
      case 'search':
        return (
          <div className="sidebar-section">
            <div className="section-header">
              <span className="section-title">SEARCH</span>
            </div>
            <div className="search-content">
              <input type="text" placeholder="Search files..." className="search-input" />
              <div className="search-results">
                <p>Search results will appear here...</p>
              </div>
            </div>
          </div>
        )
      case 'source-control':
        return (
          <div className="sidebar-section">
            <div className="section-header">
              <span className="section-title">SOURCE CONTROL</span>
            </div>
            <div className="content">
              <p>Git integration coming soon...</p>
            </div>
          </div>
        )
      case 'run':
        return (
          <div className="sidebar-section debug-section">
            <div className="section-header">
              <span className="section-title">RUN AND DEBUG</span>
            </div>
            <div className="debug-panels">
              <div className="debug-panel">
                <DebugTestRunner 
                  onDebugAction={onDebugAction}
                  isDebugging={isDebugging}
                  isPaused={isPaused}
                />
              </div>
              
              <div className="debug-panel">
                <DebugVariables 
                  variables={debugVariables}
                  expandedPaths={expandedVariablePaths}
                  onVariableExpand={(path) => {
                    const newExpanded = new Set(expandedVariablePaths)
                    if (newExpanded.has(path)) {
                      newExpanded.delete(path)
                    } else {
                      newExpanded.add(path)
                    }
                    setExpandedVariablePaths(newExpanded)
                  }}
                />
              </div>
              
              <div className="debug-panel">
                <DebugWatch 
                  watchExpressions={debugWatchExpressions}
                  onAddWatch={(expression) => onDebugAction?.('addWatch', expression)}
                  onRemoveWatch={(index) => onDebugAction?.('removeWatch', index)}
                  onUpdateWatch={(index, expression) => onDebugAction?.('updateWatch', index, expression)}
                  onRefreshWatch={() => onDebugAction?.('refreshWatch')}
                />
              </div>
              
              <div className="debug-panel">
                <DebugCallStack 
                  callStack={debugCallStack}
                  onFrameSelect={(index) => onDebugAction?.('selectFrame', index)}
                />
              </div>
              
              <div className="debug-panel">
                <DebugBreakpoints 
                  breakpoints={debugBreakpoints}
                  onToggleBreakpoint={(index) => onDebugAction?.('toggleBreakpoint', index)}
                  onRemoveBreakpoint={(index) => onDebugAction?.('removeBreakpoint', index)}
                  onRemoveAllBreakpoints={() => onDebugAction?.('removeAllBreakpoints')}
                  onGoToBreakpoint={(bp) => onDebugAction?.('goToBreakpoint', bp)}
                />
              </div>
            </div>
          </div>
        )
      case 'extensions':
        return (
          <div className="sidebar-section">
            <div className="section-header">
              <span className="section-title">EXTENSIONS</span>
            </div>
            <div className="content">
              <p>Extension marketplace coming soon...</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="sidebar-section">
            <div className="section-header">
              <span className="section-title">{activeView.toUpperCase()}</span>
            </div>
            <div className="content">Coming soon...</div>
          </div>
        )
    }
  }

  if (!isVisible) return null

  return (
    <div className="sidebar">
      {renderView()}
    </div>
  )
}

export default SideBar
