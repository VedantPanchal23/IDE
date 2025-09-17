import React from 'react'
import { GitBranch, AlertCircle, Terminal, Settings } from 'lucide-react'
import './StatusBar.css'

const StatusBar = ({ 
  activeFile, 
  onOpenAI, 
  showTerminal, 
  onToggleTerminal,
  onOpenSourceControl 
}) => {
  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="status-item" onClick={onOpenSourceControl}>
          <GitBranch size={14} />
          <span>main</span>
        </div>
        
        <div className="status-item">
          <AlertCircle size={14} />
          <span>0</span>
        </div>
      </div>
      
      <div className="status-right">
        <div className="status-item">
          <span>Ln 1, Col 1</span>
        </div>
        
        <div className="status-item">
          <span>{activeFile?.language || 'Plain Text'}</span>
        </div>
        
        <div className="status-item" onClick={onToggleTerminal}>
          <Terminal size={14} />
        </div>
        
        <div className="status-item">
          <Settings size={14} />
        </div>
      </div>
    </div>
  )
}

export default StatusBar
