import React, { useState, useRef, useEffect } from 'react'
import './TitleBar.css'

const TitleBar = ({ 
  onNewFile, 
  onOpenFile, 
  onSave,
  onSaveAs,
  onSaveAll,
  onCloseFile,
  onCloseAllFiles,
  onToggleTerminal, 
  onOpenSettings,
  onToggleSidebar,
  onTogglePanel,
  onZenMode,
  onCommandPalette,
  onFind,
  onReplace,
  onGoto,
  currentFile,
  hasUnsavedChanges = false,
  isMaximized = false,
  onMinimize,
  onMaximize,
  onClose
}) => {
  const [activeMenu, setActiveMenu] = useState(null)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName)
  }

  const handleMenuItemClick = (action) => {
    setActiveMenu(null)
    if (action) action()
  }

  const menus = {
    File: [
      { label: 'New File', shortcut: 'Ctrl+N', action: onNewFile },
      { label: 'New Window', shortcut: 'Ctrl+Shift+N', action: () => window.open(window.location.href) },
      { separator: true },
      { label: 'Open File...', shortcut: 'Ctrl+O', action: onOpenFile },
      { label: 'Open Folder...', shortcut: 'Ctrl+K Ctrl+O', action: () => console.log('Open folder') },
      { label: 'Open Recent', submenu: [
        { label: 'Reopen Closed Editor', shortcut: 'Ctrl+Shift+T' },
        { separator: true },
        { label: 'Clear Recently Opened' }
      ]},
      { separator: true },
      { label: 'Save', shortcut: 'Ctrl+S', action: onSave, disabled: !currentFile },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: onSaveAs, disabled: !currentFile },
      { label: 'Save All', shortcut: 'Ctrl+K S', action: onSaveAll },
      { separator: true },
      { label: 'Close Editor', shortcut: 'Ctrl+W', action: onCloseFile, disabled: !currentFile },
      { label: 'Close All Editors', shortcut: 'Ctrl+K Ctrl+W', action: onCloseAllFiles }
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z' },
      { label: 'Redo', shortcut: 'Ctrl+Y' },
      { separator: true },
      { label: 'Cut', shortcut: 'Ctrl+X' },
      { label: 'Copy', shortcut: 'Ctrl+C' },
      { label: 'Paste', shortcut: 'Ctrl+V' },
      { separator: true },
      { label: 'Find', shortcut: 'Ctrl+F', action: onFind },
      { label: 'Replace', shortcut: 'Ctrl+H', action: onReplace },
      { label: 'Find in Files', shortcut: 'Ctrl+Shift+F' },
      { label: 'Replace in Files', shortcut: 'Ctrl+Shift+H' }
    ],
    View: [
      { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P', action: onCommandPalette },
      { label: 'Open View...', shortcut: 'Ctrl+Q' },
      { separator: true },
      { label: 'Explorer', shortcut: 'Ctrl+Shift+E', action: () => onToggleSidebar?.('explorer') },
      { label: 'Search', shortcut: 'Ctrl+Shift+F', action: () => onToggleSidebar?.('search') },
      { label: 'Source Control', shortcut: 'Ctrl+Shift+G', action: () => onToggleSidebar?.('source-control') },
      { label: 'Extensions', shortcut: 'Ctrl+Shift+X', action: () => onToggleSidebar?.('extensions') },
      { separator: true },
      { label: 'Terminal', shortcut: 'Ctrl+`', action: onToggleTerminal },
      { label: 'Problems', shortcut: 'Ctrl+Shift+M', action: () => onTogglePanel?.('problems') },
      { label: 'Output', shortcut: 'Ctrl+Shift+U', action: () => onTogglePanel?.('output') },
      { separator: true },
      { label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: () => onToggleSidebar?.() },
      { label: 'Toggle Panel', shortcut: 'Ctrl+J', action: () => onTogglePanel?.() },
      { label: 'Zen Mode', shortcut: 'Ctrl+K Z', action: onZenMode }
    ],
    Go: [
      { label: 'Go to Line...', shortcut: 'Ctrl+G', action: onGoto },
      { label: 'Go to Symbol...', shortcut: 'Ctrl+Shift+O' },
      { label: 'Go to Definition', shortcut: 'F12' },
      { label: 'Go to References', shortcut: 'Shift+F12' },
      { separator: true },
      { label: 'Go Back', shortcut: 'Alt+←' },
      { label: 'Go Forward', shortcut: 'Alt+→' }
    ],
    Run: [
      { label: 'Start Debugging', shortcut: 'F5' },
      { label: 'Run Without Debugging', shortcut: 'Ctrl+F5' },
      { label: 'Stop Debugging', shortcut: 'Shift+F5' },
      { label: 'Restart Debugging', shortcut: 'Ctrl+Shift+F5' },
      { separator: true },
      { label: 'Toggle Breakpoint', shortcut: 'F9' },
      { label: 'Step Over', shortcut: 'F10' },
      { label: 'Step Into', shortcut: 'F11' },
      { label: 'Step Out', shortcut: 'Shift+F11' }
    ],
    Terminal: [
      { label: 'New Terminal', shortcut: 'Ctrl+Shift+`', action: onToggleTerminal },
      { label: 'Split Terminal', shortcut: 'Ctrl+Shift+5' },
      { separator: true },
      { label: 'Kill Terminal', shortcut: 'Ctrl+C' },
      { label: 'Clear Terminal', shortcut: 'Ctrl+K' }
    ],
    Help: [
      { label: 'Welcome' },
      { label: 'Show All Commands', shortcut: 'Ctrl+Shift+P', action: onCommandPalette },
      { label: 'Documentation' },
      { separator: true },
      { label: 'Keyboard Shortcuts Reference', shortcut: 'Ctrl+K Ctrl+R' },
      { separator: true },
      { label: 'About IDE Studio' }
    ]
  }

  const renderMenuItem = (item, index) => {
    if (item.separator) {
      return <div key={index} className="menu-separator" />
    }

    return (
      <div 
        key={index}
        className={`dropdown-menu-item ${item.disabled ? 'disabled' : ''}`}
        onClick={() => !item.disabled && handleMenuItemClick(item.action)}
      >
        <span className="menu-item-label">{item.label}</span>
        {item.shortcut && (
          <span className="menu-item-shortcut">{item.shortcut}</span>
        )}
      </div>
    )
  }

  const renderDropdown = (menuName) => {
    if (activeMenu !== menuName) return null

    return (
      <div className="dropdown-menu" ref={menuRef}>
        {menus[menuName].map(renderMenuItem)}
      </div>
    )
  }

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <div className="app-icon">📝</div>
        <div className="app-title">
          IDE Studio
          {currentFile && (
            <>
              <span className="file-separator"> - </span>
              <span className="current-file">
                {currentFile.name || 'Untitled'}
                {hasUnsavedChanges && <span className="unsaved-indicator"> ●</span>}
              </span>
              {currentFile.path && (
                <span className="file-path"> - {currentFile.path}</span>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="title-bar-center">
        <div className="menu-bar">
          {Object.keys(menus).map(menuName => (
            <div key={menuName} className="menu-container">
              <div 
                className={`menu-item ${activeMenu === menuName ? 'active' : ''}`}
                onClick={() => handleMenuClick(menuName)}
              >
                {menuName}
              </div>
              {renderDropdown(menuName)}
            </div>
          ))}
        </div>
      </div>
      
      <div className="title-bar-right">
        <div className="window-controls">
          <button 
            className="window-control minimize"
            onClick={onMinimize}
            title="Minimize"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M 0,5 10,5" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </button>
          <button 
            className="window-control maximize"
            onClick={onMaximize}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M 0,2 8,2 8,10 0,10 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
                <path d="M 2,0 10,0 10,8" fill="none" stroke="currentColor" strokeWidth="1"/>
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M 0,0 10,0 10,10 0,10 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
              </svg>
            )}
          </button>
          <button 
            className="window-control close"
            onClick={onClose}
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M 0,0 10,10 M 10,0 0,10" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TitleBar
