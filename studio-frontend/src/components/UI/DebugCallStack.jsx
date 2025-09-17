import React from 'react'
import { List, ArrowRight } from 'lucide-react'
import './DebugCallStack.css'

const DebugCallStack = ({ callStack = [], onFrameSelect, activeFrame = 0 }) => {
  const formatFunctionName = (frame) => {
    if (frame.functionName) {
      return frame.functionName
    }
    return frame.url ? '<anonymous>' : '<unknown>'
  }

  const formatLocation = (frame) => {
    if (frame.url && frame.lineNumber !== undefined) {
      const fileName = frame.url.split('/').pop() || frame.url
      return `${fileName}:${frame.lineNumber}${frame.columnNumber ? `:${frame.columnNumber}` : ''}`
    }
    return 'unknown'
  }

  const getFrameIcon = (index) => {
    if (index === activeFrame) {
      return <ArrowRight size={12} className="active-frame-icon" />
    }
    return <span className="frame-bullet">•</span>
  }

  return (
    <div className="debug-callstack">
      <div className="callstack-header">
        <div className="header-title">
          <List size={16} />
          <span>Call Stack</span>
        </div>
        <div className="frame-count">
          {callStack.length} frame{callStack.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="callstack-content">
        {callStack.length > 0 ? (
          <div className="callstack-list">
            {callStack.map((frame, index) => (
              <div
                key={index}
                className={`callstack-frame ${index === activeFrame ? 'active' : ''}`}
                onClick={() => onFrameSelect?.(index)}
                title={`${formatFunctionName(frame)} at ${formatLocation(frame)}`}
              >
                <div className="frame-icon">
                  {getFrameIcon(index)}
                </div>
                
                <div className="frame-info">
                  <div className="frame-function">
                    {formatFunctionName(frame)}
                  </div>
                  <div className="frame-location">
                    {formatLocation(frame)}
                  </div>
                </div>
                
                {frame.source && (
                  <div className="frame-source">
                    <code>{frame.source}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="callstack-empty">
            <p>No call stack available</p>
            <small>Start debugging to see the call stack</small>
          </div>
        )}
      </div>
    </div>
  )
}

export default DebugCallStack
