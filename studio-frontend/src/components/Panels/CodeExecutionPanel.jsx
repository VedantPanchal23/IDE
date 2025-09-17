import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, RotateCcw, Terminal, Settings, Clock, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import ClientExecutionService from '../../services/ClientExecutionService';
import './CodeExecutionPanel.css';

const CodeExecutionPanel = ({ 
  currentFile, 
  code, 
  triggerExecution = false,
  onExecutionTriggered,
  onExecutionResult 
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [clientLanguages, setClientLanguages] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  
  const clientExecutionService = useRef(new ClientExecutionService());
  const outputRef = useRef(null);
  const lastExecutionRef = useRef(null);

  useEffect(() => {
    loadSupportedLanguages();
    updateClientLanguages();
  }, []);

  useEffect(() => {
    if (currentFile && autoDetectLanguage) {
      const detectedLang = detectLanguageFromFile(currentFile);
      if (detectedLang) {
        setLanguage(detectedLang);
      }
    }
  }, [currentFile, autoDetectLanguage]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [executionResult]);

  // Handle trigger execution from editor
  useEffect(() => {
    console.log('CodeExecutionPanel: triggerExecution changed:', triggerExecution, 'code:', code?.substring(0, 50));
    if (triggerExecution && code && code.trim() && !isExecuting) {
      // Prevent duplicate executions
      const currentCodeHash = code + language + input;
      if (lastExecutionRef.current === currentCodeHash) {
        console.log('CodeExecutionPanel: Skipping duplicate execution');
        return;
      }
      lastExecutionRef.current = currentCodeHash;
      
      console.log('CodeExecutionPanel: Triggering automatic execution');
      executeCode();
      if (onExecutionTriggered) {
        onExecutionTriggered();
      }
    }
  }, [triggerExecution]);

  const loadSupportedLanguages = async () => {
    try {
      const response = await fetch('/api/execute/languages');
      const data = await response.json();
      if (data.success) {
        setSupportedLanguages(data.languages);
      }
    } catch (error) {
      console.error('Failed to load supported languages:', error);
      // Fallback to default languages if backend is not available
      setSupportedLanguages([
        { id: 'javascript', name: 'JavaScript', executionMode: 'server' },
        { id: 'typescript', name: 'TypeScript', executionMode: 'server' },
        { id: 'python', name: 'Python', executionMode: 'client' },
        { id: 'html', name: 'HTML', executionMode: 'client' },
        { id: 'css', name: 'CSS', executionMode: 'client' }
      ]);
    }
  };

  const updateClientLanguages = () => {
    const langs = clientExecutionService.current.getSupportedLanguages();
    setClientLanguages(langs);
  };

  const detectLanguageFromFile = (file) => {
    if (!file || !file.name) return null;
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'jsx': 'jsx',
      'tsx': 'tsx'
    };
    
    return languageMap[extension] || null;
  };

  const executeCode = useCallback(async () => {
    console.log('CodeExecutionPanel: executeCode called with code:', code?.substring(0, 100));
    console.log('CodeExecutionPanel: Current language:', language);
    
    if (!code || !code.trim()) {
      console.log('CodeExecutionPanel: No code to execute');
      setExecutionResult({
        success: false,
        error: 'No code to execute',
        output: '',
        executionTime: '0ms',
        language: language
      });
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      // Check if language should execute on client
      const clientLang = clientLanguages.find(lang => lang.id === language);
      let result;

      if (clientLang && clientLang.ready) {
        // Execute on client
        result = await clientExecutionService.current.executeCode(language, code, input);
      } else if (clientLang && !clientLang.ready && language === 'python') {
        // Load Pyodide for Python
        setExecutionResult({
          success: false,
          output: 'Loading Python environment...',
          error: null,
          executionTime: '0ms',
          language: language,
          loading: true
        });
        
        try {
          await clientExecutionService.current.loadPyodide();
          updateClientLanguages();
          result = await clientExecutionService.current.executeCode(language, code, input);
        } catch (loadError) {
          result = {
            success: false,
            error: `Failed to load Python environment: ${loadError.message}`,
            output: '',
            executionTime: '0ms',
            language: language
          };
        }
      } else {
        // Execute on server
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            language: language,
            code: code,
            input: input
          })
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        result = await response.json();
        
        console.log('CodeExecutionPanel: Raw server response:', result);
        
        // Fix output formatting issues
        if (result.success) {
          // Handle cases where output is "[object Object]"
          if (result.output === '[object Object]') {
            result.output = '(No console output - code executed successfully)';
          }
          // Handle empty output
          else if (!result.output || result.output.trim() === '') {
            result.output = '(No output - code executed successfully)';
          }
          // If output is an object, stringify it properly
          else if (result.output && typeof result.output === 'object') {
            result.output = JSON.stringify(result.output, null, 2);
          }
        }
        
        console.log('CodeExecutionPanel: Processed server result:', result);
        
        // If server suggests client execution
        if (result.executeOnClient && result.clientEngine) {
          if (result.clientEngine === 'pyodide' && language === 'python') {
            result = await clientExecutionService.current.executeCode(language, code, input);
          }
        }
      }

      setExecutionResult(result);
      setExecutionHistory(prev => [result, ...prev.slice(0, 5)]); // Keep last 5 results
      
      console.log('CodeExecutionPanel: Execution result:', result);
      
      if (onExecutionResult) {
        onExecutionResult(result);
      }

    } catch (error) {
      const errorResult = {
        success: false,
        error: error.message,
        output: '',
        executionTime: '0ms',
        language: language
      };
      
      setExecutionResult(errorResult);
      setExecutionHistory(prev => [errorResult, ...prev.slice(0, 9)]);
    } finally {
      setIsExecuting(false);
    }
  }, [code, language, clientLanguages, input, onExecutionResult]);

  const stopExecution = () => {
    setIsExecuting(false);
    setExecutionResult({
      success: false,
      error: 'Execution stopped by user',
      output: '',
      executionTime: '0ms',
      language: language
    });
  };

  const clearOutput = () => {
    setExecutionResult(null);
    setExecutionHistory([]);
    clientExecutionService.current.clearHistory();
  };

  const renderOutput = () => {
    if (!executionResult) return null;

    if (executionResult.loading) {
      return (
        <div className="execution-loading">
          <Loader className="w-4 h-4 animate-spin" />
          <span>{executionResult.output}</span>
        </div>
      );
    }

    return (
      <div className={`execution-result ${executionResult.success ? 'success' : 'error'}`}>
        <div className="result-header">
          <div className="result-status">
            {executionResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={executionResult.success ? 'text-green-700' : 'text-red-700'}>
              {executionResult.success ? 'Success' : 'Error'}
            </span>
          </div>
          <div className="result-info">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{executionResult.executionTime}</span>
            {executionResult.executedOnClient && (
              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Client</span>
            )}
          </div>
        </div>

        {executionResult.output && (
          <div className="result-output">
            <div className="output-label">Output:</div>
            {executionResult.renderType === 'html' || executionResult.renderType === 'iframe' ? (
              <div 
                className="html-output"
                dangerouslySetInnerHTML={{ __html: executionResult.output }}
              />
            ) : (
              <pre className="output-text">{executionResult.output}</pre>
            )}
          </div>
        )}

        {executionResult.error && (
          <div className="result-error">
            <div className="error-label">Error:</div>
            <pre className="error-text">{executionResult.error}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="code-execution-panel">
      <div className="execution-controls">
        <div className="control-group">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-select"
            disabled={isExecuting}
          >
            {supportedLanguages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
                {lang.executionMode === 'client' ? ' (Browser)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={executeCode}
            disabled={isExecuting || !code?.trim()}
            className="execute-btn"
            title="Run code (Ctrl+Enter)"
          >
            {isExecuting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isExecuting ? 'Running...' : 'Run'}
          </button>

          {isExecuting && (
            <button
              onClick={stopExecution}
              className="stop-btn"
              title="Stop execution"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          )}

          <button
            onClick={clearOutput}
            className="clear-btn"
            title="Clear output"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="settings-btn"
            title="Execution settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {showSettings && (
          <div className="execution-settings">
            <label>
              <input
                type="checkbox"
                checked={autoDetectLanguage}
                onChange={(e) => setAutoDetectLanguage(e.target.checked)}
              />
              Auto-detect language from file extension
            </label>
          </div>
        )}
      </div>

      {['python', 'javascript', 'typescript'].includes(language) && (
        <div className="input-section">
          <label htmlFor="execution-input">Input (for programs that read input):</label>
          <textarea
            id="execution-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input for your program (one value per line)"
            className="input-textarea"
            rows={3}
            disabled={isExecuting}
          />
        </div>
      )}

      <div className="output-section">
        <div className="output-header">
          <Terminal className="w-4 h-4" />
          <span>Output</span>
          {clientLanguages.find(lang => lang.id === 'python')?.loading && (
            <span className="loading-indicator">
              <Loader className="w-3 h-3 animate-spin" />
              Loading Python...
            </span>
          )}
        </div>
        
        <div className="output-content" ref={outputRef}>
          {renderOutput()}
          {!executionResult && (
            <div className="no-output">
              <Terminal className="w-8 h-8 text-gray-400" />
              <p>No output yet. Run some code to see results here.</p>
            </div>
          )}
        </div>
      </div>

      {executionHistory.length > 0 && (
        <div className="execution-history">
          <div className="history-header">Recent Executions</div>
          <div className="history-list">
            {executionHistory.slice(0, 5).map((result, index) => (
              <div
                key={index}
                className={`history-item ${result.success ? 'success' : 'error'}`}
                onClick={() => setExecutionResult(result)}
              >
                <div className="history-info">
                  <span className="history-language">{result.language}</span>
                  <span className="history-time">{result.executionTime}</span>
                </div>
                <div className="history-status">
                  {result.success ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExecutionPanel;
