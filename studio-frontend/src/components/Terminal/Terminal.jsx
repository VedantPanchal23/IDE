import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Play, Settings, X } from 'lucide-react';
import CodeExecutionPanel from '../Panels/CodeExecutionPanel';
import './Terminal.css';

const Terminal = ({ 
  executionService, 
  isVisible = false, 
  onToggle,
  currentFile,
  activeTab: parentActiveTab = 'terminal',
  onTabChange,
  triggerExecution = false,
  onExecutionTriggered
}) => {
  const [activeTab, setActiveTab] = useState(parentActiveTab); // 'terminal' or 'execution'
  const [output, setOutput] = useState([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!executionService) return;

    const handleConsoleOutput = (outputData) => {
      setOutput(prev => [...prev, {
        type: 'output',
        content: outputData.message,
        level: outputData.type,
        timestamp: outputData.timestamp
      }]);
    };

    const handleExecutionStarted = () => {
      setIsRunning(true);
      setOutput(prev => [...prev, {
        type: 'info',
        content: 'Code execution started...',
        timestamp: new Date().toISOString()
      }]);
    };

    const handleExecutionCompleted = ({ result }) => {
      setIsRunning(false);
      if (result !== undefined) {
        setOutput(prev => [...prev, {
          type: 'result',
          content: `Result: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    const handleExecutionError = ({ error }) => {
      setIsRunning(false);
      setOutput(prev => [...prev, {
        type: 'error',
        content: `Error: ${error}`,
        timestamp: new Date().toISOString()
      }]);
    };

    const handleBreakpointHit = ({ line, variables }) => {
      setOutput(prev => [...prev, {
        type: 'debug',
        content: `Breakpoint hit at line ${line}`,
        timestamp: new Date().toISOString()
      }]);
      
      if (Object.keys(variables).length > 0) {
        setOutput(prev => [...prev, {
          type: 'debug',
          content: `Variables: ${JSON.stringify(variables, null, 2)}`,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    executionService.on('consoleOutput', handleConsoleOutput);
    executionService.on('executionStarted', handleExecutionStarted);
    executionService.on('executionCompleted', handleExecutionCompleted);
    executionService.on('executionError', handleExecutionError);
    executionService.on('breakpointHit', handleBreakpointHit);

    return () => {
      executionService.off('consoleOutput', handleConsoleOutput);
      executionService.off('executionStarted', handleExecutionStarted);
      executionService.off('executionCompleted', handleExecutionCompleted);
      executionService.off('executionError', handleExecutionError);
      executionService.off('breakpointHit', handleBreakpointHit);
    };
  }, [executionService]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Sync activeTab with parent state
  useEffect(() => {
    setActiveTab(parentActiveTab);
  }, [parentActiveTab]);

  // Auto-switch to execution tab when code execution is triggered
  useEffect(() => {
    if (triggerExecution) {
      setActiveTab('execution');
      if (onTabChange) {
        onTabChange('execution');
      }
    }
  }, [triggerExecution, onTabChange]);

  const handleRunCode = async (code) => {
    if (!executionService || isRunning) return;

    // Add command to output
    setOutput(prev => [...prev, {
      type: 'command',
      content: `> ${code}`,
      timestamp: new Date().toISOString()
    }]);

    // Add to history
    if (code.trim() && !history.includes(code)) {
      setHistory(prev => [...prev, code]);
    }
    setHistoryIndex(-1);

    try {
      await executionService.executeCode(code);
    } catch (error) {
      // Error handling is done in the event listeners
    }
  };

  const handleRunCurrentFile = async () => {
    if (!currentFile || !executionService || isRunning) return;

    try {
      await executionService.executeCode(currentFile.content, { debug: false });
    } catch (error) {
      // Error handling is done in the event listeners
    }
  };

  const handleDebugCurrentFile = async () => {
    if (!currentFile || !executionService || isRunning) return;

    try {
      await executionService.executeCode(currentFile.content, { debug: true });
    } catch (error) {
      // Error handling is done in the event listeners
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleRunCode(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex < history.length) {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    }
  };

  const clearTerminal = () => {
    setOutput([]);
    if (executionService) {
      executionService.clearConsoleOutput();
    }
  };

  const stopExecution = () => {
    if (executionService && isRunning) {
      executionService.stopExecution();
      setIsRunning(false);
    }
  };

  const getOutputClass = (type) => {
    switch (type) {
      case 'error': return 'terminal-error';
      case 'warn': return 'terminal-warning';
      case 'debug': return 'terminal-debug';
      case 'info': return 'terminal-info';
      case 'command': return 'terminal-command';
      case 'result': return 'terminal-result';
      default: return 'terminal-output';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="terminal">
      <div className="terminal-header">
        <div className="terminal-tabs">
          <button 
            className={`terminal-tab ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('terminal');
              onTabChange?.('terminal');
            }}
          >
            <TerminalIcon className="w-4 h-4" />
            Terminal
          </button>
          <button 
            className={`terminal-tab ${activeTab === 'execution' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('execution');
              onTabChange?.('execution');
            }}
          >
            <Play className="w-4 h-4" />
            Code Execution
          </button>
        </div>
        <div className="terminal-controls">
          {activeTab === 'terminal' && currentFile && (
            <>
              <button 
                className="terminal-btn terminal-btn-run"
                onClick={handleRunCurrentFile}
                disabled={isRunning}
                title="Run current file"
              >
                ▶ Run
              </button>
              <button 
                className="terminal-btn terminal-btn-debug"
                onClick={handleDebugCurrentFile}
                disabled={isRunning}
                title="Debug current file"
              >
                🐛 Debug
              </button>
            </>
          )}
          {activeTab === 'terminal' && (
            <>
              <button 
                className="terminal-btn terminal-btn-stop"
                onClick={stopExecution}
                disabled={!isRunning}
                title="Stop execution"
              >
                ⏹ Stop
              </button>
              <button 
                className="terminal-btn terminal-btn-clear"
                onClick={clearTerminal}
                title="Clear terminal"
              >
                🗑 Clear
              </button>
            </>
          )}
          <button 
            className="terminal-btn terminal-btn-close"
            onClick={onToggle}
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {activeTab === 'terminal' ? (
        <>
          <div className="terminal-content" ref={terminalRef}>
            <div className="terminal-output">
              {output.map((item, index) => (
                <div 
                  key={index} 
                  className={`terminal-line ${getOutputClass(item.type)}`}
                >
                  <span className="terminal-timestamp">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <pre className="terminal-text">{item.content}</pre>
                </div>
              ))}
              {isRunning && (
                <div className="terminal-line terminal-running">
                  <span className="terminal-spinner">⟳</span>
                  <span>Executing...</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleInputSubmit} className="terminal-input-form">
            <div className="terminal-input-line">
              <span className="terminal-prompt">js&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                placeholder="Enter JavaScript code..."
                disabled={isRunning}
              />
            </div>
          </form>
        </>
      ) : (
        <CodeExecutionPanel 
          currentFile={currentFile}
          code={currentFile?.content || ''}
          triggerExecution={triggerExecution}
          onExecutionTriggered={onExecutionTriggered}
          onExecutionResult={(result) => {
            // Optionally add execution results to terminal output
            if (result.success) {
              setOutput(prev => [...prev, {
                type: 'info',
                content: `Code executed successfully in ${result.executionTime}`,
                timestamp: new Date().toISOString()
              }]);
            } else {
              setOutput(prev => [...prev, {
                type: 'error', 
                content: `Execution failed: ${result.error}`,
                timestamp: new Date().toISOString()
              }]);
            }
          }}
        />
      )}
    </div>
  );
};

export default Terminal;
