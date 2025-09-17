import React, { useState } from 'react'
import { 
  Search, 
  X, 
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen
} from 'lucide-react'
import './Explorer.css'

const Explorer = ({ 
  files = [], 
  activeFile, 
  onFileSelect, 
  onToggleFolder,
  expandedFolders = new Set()
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filterFiles = (files, term) => {
    if (!term) return files
    return files.filter(file => 
      file.name.toLowerCase().includes(term.toLowerCase())
    )
  }

  const renderFileItem = (file, level = 0) => {
    const isFolder = file.type === 'folder'
    const isExpanded = expandedFolders.has(file.path)
    const isActive = activeFile?.path === file.path

    return (
      <div key={file.path} className="file-item-container">
        <div 
          className={`file-item ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => isFolder ? onToggleFolder(file.path) : onFileSelect(file)}
        >
          <div className="file-item-content">
            {isFolder && (
              <span className="folder-toggle">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
            
            <span className="file-icon">
              {isFolder ? (
                isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />
              ) : (
                <File size={14} />
              )}
            </span>
            
            <span className="file-name">{file.name}</span>
          </div>
        </div>
        
        {isFolder && isExpanded && file.children && (
          <div className="folder-contents">
            {file.children.map(child => renderFileItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const filteredFiles = filterFiles(files, searchTerm)

  return (
    <div className="explorer">
      <div className="explorer-header">
        <span className="explorer-title">EXPLORER</span>
      </div>
      
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <X 
              size={14} 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>
      </div>
      
      <div className="file-tree">
        {filteredFiles.length > 0 ? (
          filteredFiles.map(file => renderFileItem(file))
        ) : (
          <div className="no-files">
            {searchTerm ? 'No files match your search' : 'No files to display'}
          </div>
        )}
      </div>
    </div>
  )
}

export default Explorer
