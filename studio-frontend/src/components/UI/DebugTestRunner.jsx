import React, { useState } from 'react'
import { Play, Square, Bug, Zap, Eye } from 'lucide-react'
import './DebugTestRunner.css'

const DebugTestRunner = ({ onDebugAction, isDebugging, isPaused }) => {
  const [testResults, setTestResults] = useState([])

  const runSimpleTest = () => {
    if (!onDebugAction) return

    // Start debug session and simulate execution
    onDebugAction('startDebugSession')
    
    // Add some test results
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      action: 'Debug session started',
      status: 'info'
    }])
  }

  const addTestBreakpoint = () => {
    if (!onDebugAction) return

    // Add a breakpoint at line 4 of the demo file
    const breakpoint = {
      fileName: 'debug-demo.js',
      lineNumber: 4,
      columnNumber: 1,
      enabled: true,
      condition: null
    }
    
    onDebugAction('addBreakpoint', breakpoint)
    
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      action: 'Breakpoint added at line 4',
      status: 'success'
    }])
  }

  const simulateVariableUpdate = () => {
    if (!onDebugAction) return

    // Add a watch expression
    onDebugAction('addWatch', 'total')
    
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      action: 'Watch expression "total" added',
      status: 'info'
    }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="debug-test-runner">
      <div className="test-header">
        <h3><Bug size={16} /> Debug Test Runner</h3>
        <div className="debug-status">
          <span className={`status-indicator ${isDebugging ? 'active' : 'inactive'}`}>
            {isDebugging ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
          </span>
        </div>
      </div>
      
      <div className="test-controls">
        <button 
          className="test-btn primary"
          onClick={runSimpleTest}
          disabled={isDebugging}
        >
          <Play size={14} />
          Start Debug Test
        </button>
        
        <button 
          className="test-btn secondary"
          onClick={addTestBreakpoint}
        >
          <Square size={14} />
          Add Breakpoint
        </button>
        
        <button 
          className="test-btn secondary"
          onClick={simulateVariableUpdate}
        >
          <Eye size={14} />
          Add Watch
        </button>
        
        <button 
          className="test-btn danger"
          onClick={clearResults}
        >
          Clear Results
        </button>
      </div>
      
      <div className="test-results">
        <div className="results-header">
          <Zap size={14} />
          Test Results
        </div>
        <div className="results-list">
          {testResults.length === 0 ? (
            <div className="no-results">No test results yet. Run a debug test to see real-time updates.</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className={`result-item ${result.status}`}>
                <span className="timestamp">{result.timestamp}</span>
                <span className="action">{result.action}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DebugTestRunner
