import React, { useState, useRef, useCallback, useEffect } from 'react'
import { 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  Scissors,
  RefreshCw,
  FilePlus,
  FolderPlus
} from 'lucide-react'
import './FileExplorer.css'

const FileExplorer = ({ 
  fileTree = [],
  onFileSelect,
  onToggleFolder,
  expandedFolders = new Set(),
  selectedFile = null,
  onFileOperation,
  searchQuery = '',
  onSearchChange
}) => {
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null })
  const [renaming, setRenaming] = useState(null)
  const fileInputRef = useRef(null)

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ visible: false, x: 0, y: 0, item: null })
    }
    
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu.visible])

  // Get proper VS Code file icon
  const getFileIcon = (fileName, isFolder, isOpen = false) => {
    if (isFolder) {
      return isOpen ? <FolderOpen size={16} /> : <Folder size={16} />
    }
    return <File size={16} />
  }

  // Context menu handlers
  const handleContextMenu = useCallback((e, item) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item
    })
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, item: null })
  }, [])

  // Context menu actions
  const handleContextAction = useCallback((action) => {
    const { item } = contextMenu
    
    switch (action) {
      case 'newFile':
        onFileOperation?.('newFile', item)
        break
      case 'newFolder':
        onFileOperation?.('newFolder', item)
        break
      case 'refresh':
        onFileOperation?.('refresh', item)
        break
      case 'rename':
        setRenaming(item?.path)
        break
      case 'delete':
        if (item && confirm(`Delete ${item.name}?`)) {
          onFileOperation?.('delete', item)
        }
        break
      default:
        console.log('Unknown context action:', action)
    }
    
    closeContextMenu()
  }, [contextMenu, onFileOperation])

  // Render file tree item
  const renderFileItem = (item, depth = 0) => {
    const isFolder = item.type === 'folder'
    const isExpanded = expandedFolders.has(item.path)
    const isSelected = selectedFile?.path === item.path

    const handleClick = (e) => {
      e.stopPropagation()
      if (isFolder) {
        onToggleFolder?.(item.path)
      } else {
        onFileSelect?.(item)
      }
    }

    return (
      <div key={item.path} className="file-item-container">
        <div
          className={`file-item ${isSelected ? 'selected' : ''} ${isFolder ? 'folder' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={handleClick}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          <span className="file-icon">
            {getFileIcon(item.name, isFolder, isExpanded)}
          </span>
          
          <span className="file-name">
            {item.name}
          </span>
        </div>

        {isFolder && isExpanded && item.children && (
          <div className="folder-contents">
            {item.children.map(child => renderFileItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="file-explorer" onClick={closeContextMenu}>
      <div className="file-explorer-header">
        <span className="header-title">EXPLORER</span>
        <div className="header-actions">
          <button 
            className="action-btn" 
            onClick={() => onFileOperation?.('newFile', { path: '/', type: 'folder' })}
            title="New File"
          >
            <FilePlus size={16} />
          </button>
          <button 
            className="action-btn" 
            onClick={() => onFileOperation?.('newFolder', { path: '/', type: 'folder' })}
            title="New Folder"
          >
            <FolderPlus size={16} />
          </button>
          <button 
            className="action-btn" 
            onClick={() => onFileOperation?.('refresh', { path: '/', type: 'folder' })}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {onSearchChange && (
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      )}

      <div className="file-tree">
        {fileTree.length > 0 ? (
          fileTree.map(item => renderFileItem(item))
        ) : (
          <div className="no-files">No files found</div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
        >
          <div className="context-menu-item" onClick={() => handleContextAction('newFile')}>
            <FilePlus size={14} />
            <span>New File</span>
          </div>
          <div className="context-menu-item" onClick={() => handleContextAction('newFolder')}>
            <FolderPlus size={14} />
            <span>New Folder</span>
          </div>
          <div className="context-menu-separator" />
          <div className="context-menu-item" onClick={() => handleContextAction('refresh')}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </div>
          {contextMenu.item && (
            <>
              <div className="context-menu-separator" />
              <div className="context-menu-item" onClick={() => handleContextAction('rename')}>
                <Edit3 size={14} />
                <span>Rename</span>
              </div>
              <div className="context-menu-item" onClick={() => handleContextAction('delete')}>
                <Trash2 size={14} />
                <span>Delete</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default FileExplorer
