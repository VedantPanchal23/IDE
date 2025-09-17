import React, { useState, useCallback, useEffect } from 'react'
import './PanelResizer.css'

const PanelResizer = ({ 
  direction = 'horizontal', // 'horizontal' or 'vertical'
  onResize,
  minSize = 200,
  maxSize = null,
  initialSize = 300,
  disabled = false
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const [startPos, setStartPos] = useState(0)
  const [startSize, setStartSize] = useState(initialSize)

  const handleMouseDown = useCallback((e) => {
    if (disabled) return
    
    e.preventDefault()
    setIsResizing(true)
    
    const pos = direction === 'horizontal' ? e.clientX : e.clientY
    setStartPos(pos)
    setStartSize(initialSize)
    
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }, [direction, disabled, initialSize])

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return
    
    const pos = direction === 'horizontal' ? e.clientX : e.clientY
    const delta = pos - startPos
    let newSize = startSize + delta
    
    // Apply constraints
    if (newSize < minSize) newSize = minSize
    if (maxSize && newSize > maxSize) newSize = maxSize
    
    onResize?.(newSize)
  }, [isResizing, direction, startPos, startSize, minSize, maxSize, onResize])

  const handleMouseUp = useCallback(() => {
    if (!isResizing) return
    
    setIsResizing(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [isResizing])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const resizerClass = `panel-resizer ${direction} ${isResizing ? 'resizing' : ''} ${disabled ? 'disabled' : ''}`

  return (
    <div 
      className={resizerClass}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
      tabIndex={disabled ? -1 : 0}
    >
      <div className="resizer-handle">
        <div className="resizer-indicator"></div>
      </div>
    </div>
  )
}

export default PanelResizer
