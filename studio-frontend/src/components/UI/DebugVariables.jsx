import React, { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, Database } from 'lucide-react'
import './DebugVariables.css'

const DebugVariables = ({ variables = {}, onVariableExpand, expandedPaths = new Set() }) => {
  const [searchFilter, setSearchFilter] = useState('')

  const renderVariable = (name, value, path = '', depth = 0) => {
    const fullPath = path ? `${path}.${name}` : name
    const isExpanded = expandedPaths.has(fullPath)
    const isObject = typeof value === 'object' && value !== null
    const hasChildren = isObject && Object.keys(value).length > 0

    const filteredValue = searchFilter 
      ? name.toLowerCase().includes(searchFilter.toLowerCase()) 
      : true

    if (!filteredValue) return null

    return (
      <div key={fullPath} className="variable-item">
        <div 
          className="variable-header"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => hasChildren && onVariableExpand?.(fullPath)}
        >
          <div className="variable-expand">
            {hasChildren ? (
              isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            ) : (
              <span className="variable-bullet">•</span>
            )}
          </div>
          <span className="variable-name">{name}</span>
          <span className="variable-separator">:</span>
          <span className={`variable-value ${typeof value}`}>
            {isObject ? 
              `{${Object.keys(value).length} items}` : 
              JSON.stringify(value)
            }
          </span>
          <span className="variable-type">{typeof value}</span>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="variable-children">
            {Object.entries(value).map(([childName, childValue]) =>
              renderVariable(childName, childValue, fullPath, depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  const filteredVariables = Object.entries(variables)

  return (
    <div className="debug-variables">
      <div className="variables-header">
        <div className="header-title">
          <Database size={16} />
          <span>Variables</span>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Filter variables..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="variables-search"
          />
        </div>
      </div>
      
      <div className="variables-content">
        {filteredVariables.length > 0 ? (
          <div className="variables-list">
            {filteredVariables.map(([name, value]) =>
              renderVariable(name, value)
            )}
          </div>
        ) : (
          <div className="variables-empty">
            <p>No variables to display</p>
            <small>Start debugging to see variable values</small>
          </div>
        )}
      </div>
    </div>
  )
}

export default DebugVariables
