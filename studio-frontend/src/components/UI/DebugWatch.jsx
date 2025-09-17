import React, { useState } from 'react'
import { Eye, Plus, Trash2, RefreshCw } from 'lucide-react'
import './DebugWatch.css'

const DebugWatch = ({ watchExpressions = [], onAddWatch, onRemoveWatch, onUpdateWatch, onRefreshWatch }) => {
  const [newExpression, setNewExpression] = useState('')
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editValue, setEditValue] = useState('')

  const handleAddExpression = () => {
    if (newExpression.trim()) {
      onAddWatch?.(newExpression.trim())
      setNewExpression('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddExpression()
    }
  }

  const handleEditStart = (index, expression) => {
    setEditingIndex(index)
    setEditValue(expression)
  }

  const handleEditSave = (index) => {
    if (editValue.trim()) {
      onUpdateWatch?.(index, editValue.trim())
    }
    setEditingIndex(-1)
    setEditValue('')
  }

  const handleEditCancel = () => {
    setEditingIndex(-1)
    setEditValue('')
  }

  const handleEditKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      handleEditSave(index)
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const formatValue = (value, error) => {
    if (error) {
      return { text: error, className: 'error' }
    }
    
    if (value === undefined) {
      return { text: 'undefined', className: 'undefined' }
    }
    
    if (value === null) {
      return { text: 'null', className: 'null' }
    }
    
    if (typeof value === 'string') {
      return { text: `"${value}"`, className: 'string' }
    }
    
    if (typeof value === 'object') {
      return { text: JSON.stringify(value, null, 2), className: 'object' }
    }
    
    return { text: String(value), className: typeof value }
  }

  return (
    <div className="debug-watch">
      <div className="watch-header">
        <div className="header-title">
          <Eye size={16} />
          <span>Watch</span>
        </div>
        <button 
          className="watch-refresh"
          onClick={() => onRefreshWatch?.()}
          title="Refresh all expressions"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      
      <div className="watch-content">
        <div className="watch-input">
          <input
            type="text"
            placeholder="Add expression to watch..."
            value={newExpression}
            onChange={(e) => setNewExpression(e.target.value)}
            onKeyPress={handleKeyPress}
            className="watch-input-field"
          />
          <button 
            className="watch-add-btn"
            onClick={handleAddExpression}
            disabled={!newExpression.trim()}
          >
            <Plus size={14} />
          </button>
        </div>
        
        <div className="watch-list">
          {watchExpressions.length > 0 ? (
            watchExpressions.map((item, index) => {
              const { text, className } = formatValue(item.value, item.error)
              
              return (
                <div key={index} className="watch-item">
                  <div className="watch-expression">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, index)}
                        onBlur={() => handleEditSave(index)}
                        className="watch-edit-input"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="expression-text"
                        onClick={() => handleEditStart(index, item.expression)}
                        title="Click to edit"
                      >
                        {item.expression}
                      </span>
                    )}
                    
                    <button
                      className="watch-remove-btn"
                      onClick={() => onRemoveWatch?.(index)}
                      title="Remove expression"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  <div className={`watch-value ${className}`}>
                    <pre>{text}</pre>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="watch-empty">
              <p>No watch expressions</p>
              <small>Add expressions to monitor their values during debugging</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DebugWatch
