import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import { executeTerminalCommand } from '../../services/DriveAPIService';
import './Terminal.css';

const Terminal = ({ isVisible, onToggle }) => {
  const [output, setOutput] = useState([]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/');
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      inputRef.current?.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleInputSubmit = async (e) => {
    e.preventDefault();
    const command = input.trim();
    if (!command) return;

    // Add command to output and history
    const newHistory = [...history, command];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length);
    setOutput(prev => [...prev, { type: 'command', content: command, cwd }]);
    setInput('');
    setIsRunning(true);

    try {
      const result = await executeTerminalCommand(command);

      if (result.clear) {
        setOutput([]);
      } else if (result.output) {
        setOutput(prev => [...prev, { type: result.error ? 'error' : 'output', content: result.output }]);
      }

      // The backend needs to return the new CWD on successful `cd`
      if (result.newCwd) {
        setCwd(result.newCwd);
      }

    } catch (error) {
      setOutput(prev => [...prev, { type: 'error', content: error.message }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex > 0 ? historyIndex - 1 : 0;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(history.length);
        setInput('');
      }
    } else if (e.key === 'c' && e.ctrlKey) {
        setInput('');
        setIsRunning(false);
    }
  };

  const getOutputClass = (type) => {
    return type === 'error' ? 'terminal-error' : 'terminal-output';
  };

  if (!isVisible) return null;

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-header">
        <div className="terminal-tabs">
          <button className="terminal-tab active">
            <TerminalIcon className="w-4 h-4" />
            Terminal
          </button>
        </div>
        <div className="terminal-controls">
          <button className="terminal-btn terminal-btn-close" onClick={onToggle} title="Close panel">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="terminal-content">
        <div className="terminal-output-area">
          {output.map((item, index) => (
            <div key={index} className="terminal-line">
              {item.type === 'command' ? (
                <>
                  <span className="terminal-prompt">{item.cwd} &gt;</span>
                  <span className="terminal-command">{item.content}</span>
                </>
              ) : (
                <pre className={getOutputClass(item.type)}>{item.content}</pre>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
        <form onSubmit={handleInputSubmit} className="terminal-input-form">
          <div className="terminal-input-line">
            <span className="terminal-prompt">{cwd} &gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="terminal-input"
              placeholder="Enter command..."
              disabled={isRunning}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Terminal;
