import React from 'react'
import { Files, Search, GitBranch, Play, Package, Sparkles } from 'lucide-react'
import './ActivityBar.css'

const ActivityBar = ({ 
  activeView, 
  onViewChange, 
  onToggleSidebar, 
  onTogglePanel, 
  onOpenAI 
}) => {
  const activityItems = [
    { id: 'explorer', icon: Files, title: 'Explorer' },
    { id: 'search', icon: Search, title: 'Search' },
    { id: 'source-control', icon: GitBranch, title: 'Source Control' },
    { id: 'run', icon: Play, title: 'Run and Debug' },
    { id: 'extensions', icon: Package, title: 'Extensions' }
  ]

  return (
    <div className="activity-bar">
      <div className="activity-items">
        {activityItems.map(item => (
          <div
            key={item.id}
            className={`activity-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            title={item.title}
          >
            <item.icon size={20} />
          </div>
        ))}
      </div>
      
      <div className="activity-bottom">
        <div className="activity-item" onClick={onOpenAI} title="AI Assistant">
          <Sparkles size={20} />
        </div>
      </div>
    </div>
  )
}

export default ActivityBar
