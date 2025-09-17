import React from 'react'
import { ChevronRight, Home, FileText } from 'lucide-react'
import './Breadcrumb.css'

const Breadcrumb = ({ filePath, onNavigate, showHome = true }) => {
  if (!filePath) return null

  // Parse the file path into segments
  const pathSegments = filePath.split('/').filter(segment => segment.length > 0)
  const fileName = pathSegments[pathSegments.length - 1] || ''
  const directories = pathSegments.slice(0, -1)

  const handleSegmentClick = (index) => {
    if (index === -1) {
      // Home/root clicked
      onNavigate?.('/')
    } else {
      // Directory clicked - reconstruct path up to that point
      const pathToSegment = '/' + pathSegments.slice(0, index + 1).join('/')
      onNavigate?.(pathToSegment)
    }
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase()

    const iconMap = {
      'js': '',
      'jsx': '⚛️',
      'ts': '🔷',
      'tsx': '⚛️',
      'json': '📋',
      'html': '🌐',
      'css': '🎨',
      'md': '',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚡',
      'c': '⚡',
      'php': '🐘',
      'rb': '💎',
      'go': '🐹',
      'rs': '🦀',
      'vue': '💚',
      'scss': '🎨',
      'less': '🎨',
      'xml': '',
      'yml': '',
      'yaml': ''
    }

    return iconMap[extension] || ''
  }

  return (
    <div className="breadcrumb">
      <div className="breadcrumb-content">
        {showHome && (
          <>
            <button
              className="breadcrumb-segment home"
              onClick={() => handleSegmentClick(-1)}
              title="Go to workspace root"
            >
              <Home size={14} />
            </button>
            {pathSegments.length > 0 && (
              <ChevronRight size={12} className="breadcrumb-separator" />
            )}
          </>
        )}

        {directories.map((directory, index) => (
          <React.Fragment key={index}>
            <button
              className="breadcrumb-segment directory"
              onClick={() => handleSegmentClick(index)}
              title={`Go to ${directory}`}
            >
              {directory}
            </button>
            <ChevronRight size={12} className="breadcrumb-separator" />
          </React.Fragment>
        ))}

        {fileName && (
          <div className="breadcrumb-segment file active">
            <span className="file-icon">{getFileIcon(fileName)}</span>
            <span className="file-name">{fileName}</span>
          </div>
        )}
      </div>

      <div className="breadcrumb-actions">
        <button
          className="breadcrumb-action"
          title="Copy path"
          onClick={() => navigator.clipboard?.writeText(filePath)}
        >
          <FileText size={14} />
        </button>
      </div>
    </div>
  )
}

export default Breadcrumb
