import React from 'react'
import { Play, Pause, Square, ArrowRight, ArrowDown, ArrowUp, RotateCcw } from 'lucide-react'
import './DebugToolbar.css'

const DebugToolbar = ({ 
  isDebugging = false,
  isPaused = false,
  onStartDebug,
  onStopDebug,
  onStepOver,
  onStepInto,
  onStepOut,
  onContinue,
  onPause,
  onRestart
}) => {
  return (
    <div className="debug-toolbar">
      <div className="debug-toolbar-section">
        <div className="debug-title">Debug Controls</div>
        <div className="debug-buttons">
          {!isDebugging ? (
            <button 
              className="debug-btn start" 
              onClick={onStartDebug}
              title="Start Debugging (F5)"
            >
              <Play size={16} />
              <span>Start</span>
            </button>
          ) : (
            <>
              <button 
                className="debug-btn stop" 
                onClick={onStopDebug}
                title="Stop Debugging (Shift+F5)"
              >
                <Square size={16} />
                <span>Stop</span>
              </button>
              
              <button 
                className="debug-btn restart" 
                onClick={onRestart}
                title="Restart Debugging (Ctrl+Shift+F5)"
              >
                <RotateCcw size={16} />
                <span>Restart</span>
              </button>
              
              <div className="debug-separator"></div>
              
              {isPaused ? (
                <button 
                  className="debug-btn continue" 
                  onClick={onContinue}
                  title="Continue (F5)"
                >
                  <Play size={16} />
                  <span>Continue</span>
                </button>
              ) : (
                <button 
                  className="debug-btn pause" 
                  onClick={onPause}
                  title="Pause (F6)"
                >
                  <Pause size={16} />
                  <span>Pause</span>
                </button>
              )}
              
              <button 
                className="debug-btn step-over" 
                onClick={onStepOver}
                title="Step Over (F10)"
                disabled={!isPaused}
              >
                <ArrowRight size={16} />
                <span>Step Over</span>
              </button>
              
              <button 
                className="debug-btn step-into" 
                onClick={onStepInto}
                title="Step Into (F11)"
                disabled={!isPaused}
              >
                <ArrowDown size={16} />
                <span>Step Into</span>
              </button>
              
              <button 
                className="debug-btn step-out" 
                onClick={onStepOut}
                title="Step Out (Shift+F11)"
                disabled={!isPaused}
              >
                <ArrowUp size={16} />
                <span>Step Out</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="debug-status">
        <span className={`debug-status-indicator ${isDebugging ? 'active' : 'inactive'}`}>
          {isDebugging ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
        </span>
      </div>
    </div>
  )
}

export default DebugToolbar
