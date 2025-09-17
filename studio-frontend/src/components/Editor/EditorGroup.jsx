import React, { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { X, Circle, Play, Square, Terminal, Plus, AlertCircle } from 'lucide-react'
import { configureMonaco, getLanguageFromFilename } from '../../config/monaco'
import ErrorListPanel from '../Panels/ErrorListPanel'
import './EditorGroup.css'

const EditorGroup = ({ 
  tabs = [], 
  activeTabId, 
  onTabChange, 
  onTabClose, 
  onContentChange,
  onCreateNewFile,
  onRunCode,
  loading = false,
  showTerminal = false,
  onToggleTerminal,
  // Debug props
  breakpoints = [],
  currentExecutionLine = null,
  isDebugging = false,
  isPaused = false,
  onDebugAction
}) => {
  const editorRef = useRef(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showErrorList, setShowErrorList] = useState(false)
  const [editorErrors, setEditorErrors] = useState([])

  // Configure Monaco when component mounts
  useEffect(() => {
    configureMonaco()
  }, [])

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    
    // Basic editor configuration
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'Fira Code, Consolas, Monaco, monospace',
      lineHeight: 20,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      glyphMargin: true, // Enable glyph margin for breakpoint indicators
      lightbulb: { enabled: true }, // Enable code actions
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: 'on',
      wordBasedSuggestions: true
    })

    // Configure breakpoint decorations
    setupBreakpointDecorations(editor, monaco)
    
    // Setup error tracking
    setupErrorTracking(editor, monaco)
    
    // Add gutter click handler for breakpoints
    editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const lineNumber = e.target.position.lineNumber
        handleBreakpointToggle(lineNumber)
      }
    })

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log('Save triggered')
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode()
    })
    
    // Add debug shortcuts
    editor.addCommand(monaco.KeyCode.F9, () => {
      const position = editor.getPosition()
      if (position) {
        handleBreakpointToggle(position.lineNumber)
      }
    })
    
    editor.addCommand(monaco.KeyCode.F5, () => {
      if (isDebugging) {
        onDebugAction?.('continue')
      } else {
        onDebugAction?.('startDebugSession')
      }
    })
    
    editor.addCommand(monaco.KeyCode.F10, () => {
      if (isPaused) {
        onDebugAction?.('stepOver')
      }
    })
    
    editor.addCommand(monaco.KeyCode.F11, () => {
      if (isPaused) {
        onDebugAction?.('stepInto')
      }
    })

    // Add intelligent code shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      editor.trigger('keyboard', 'editor.action.commentLine', {})
    })

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.trigger('keyboard', 'editor.action.formatDocument', {})
    })

    editor.addCommand(monaco.KeyCode.F12, () => {
      editor.trigger('keyboard', 'editor.action.revealDefinition', {})
    })

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.F12, () => {
      editor.trigger('keyboard', 'editor.action.goToReferences', {})
    })

    editor.addCommand(monaco.KeyCode.F2, () => {
      editor.trigger('keyboard', 'editor.action.rename', {})
    })
  }

  // Error tracking setup
  const setupErrorTracking = (editor, monaco) => {
    // Listen for marker changes (errors, warnings, info)
    const disposable = monaco.editor.onDidChangeMarkers(() => {
      if (!editor.getModel()) return
      
      const markers = monaco.editor.getModelMarkers({ resource: editor.getModel().uri })
      setEditorErrors(markers)
      
      // Auto-show error list if there are errors
      if (markers.some(m => m.severity === 8)) { // Monaco severity 8 = Error
        setShowErrorList(true)
      }
    })

    return disposable
  }

  // Breakpoint management functions
  const setupBreakpointDecorations = (editor, monaco) => {
    // Define breakpoint decoration types
    window.monacoBreakpointDecorations = {
      breakpointEnabled: 'breakpoint-enabled',
      breakpointDisabled: 'breakpoint-disabled',
      breakpointConditional: 'breakpoint-conditional',
      currentLine: 'current-execution-line'
    }

    // Register CSS classes for breakpoints
    monaco.editor.defineTheme('debug-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {}
    })
  }

  const handleBreakpointToggle = (lineNumber) => {
    if (!activeTab || !onDebugAction) return

    // Check if breakpoint exists at this line
    const existingBreakpoint = breakpoints.find(bp => 
      bp.fileName === activeTab.name && bp.lineNumber === lineNumber
    )

    if (existingBreakpoint) {
      // Remove breakpoint
      const breakpointIndex = breakpoints.indexOf(existingBreakpoint)
      onDebugAction('removeBreakpoint', breakpointIndex)
    } else {
      // Add breakpoint
      const newBreakpoint = {
        fileName: activeTab.name,
        lineNumber: lineNumber,
        columnNumber: 1,
        enabled: true,
        condition: null
      }
      onDebugAction('addBreakpoint', newBreakpoint)
    }
  }

  const updateBreakpointDecorations = () => {
    const editor = editorRef.current
    if (!editor || !activeTab || !window.monaco) return

    const decorations = []
    
    // Add breakpoint decorations
    breakpoints
      .filter(bp => bp.fileName === activeTab.name)
      .forEach(bp => {
        decorations.push({
          range: new window.monaco.Range(bp.lineNumber, 1, bp.lineNumber, 1),
          options: {
            isWholeLine: false,
            glyphMarginClassName: bp.enabled 
              ? (bp.condition ? 'breakpoint-conditional' : 'breakpoint-enabled')
              : 'breakpoint-disabled',
            glyphMarginHoverMessage: {
              value: bp.condition 
                ? `Conditional breakpoint: ${bp.condition}`
                : bp.enabled 
                  ? 'Breakpoint (click to disable)'
                  : 'Disabled breakpoint (click to enable)'
            }
          }
        })
      })

    // Add current execution line decoration
    if (currentExecutionLine && currentExecutionLine.fileName === activeTab.name) {
      decorations.push({
        range: new window.monaco.Range(
          currentExecutionLine.lineNumber, 
          1, 
          currentExecutionLine.lineNumber, 
          1
        ),
        options: {
          isWholeLine: true,
          className: 'current-execution-line',
          glyphMarginClassName: 'current-execution-arrow',
          glyphMarginHoverMessage: {
            value: 'Current execution line'
          }
        }
      })
    }

    // Apply decorations
    const model = editor.getModel()
    if (model) {
      const existingDecorations = model.getAllDecorations()
        .filter(d => d.options.glyphMarginClassName && 
          (d.options.glyphMarginClassName.includes('breakpoint') || 
           d.options.glyphMarginClassName.includes('current-execution')))
        .map(d => d.id)
      
      editor.deltaDecorations(existingDecorations, decorations)
    }
  }

  // Update decorations when breakpoints or execution state changes
  useEffect(() => {
    if (editorRef.current) {
      updateBreakpointDecorations()
    }
  }, [breakpoints, currentExecutionLine, activeTab])

  const handleEditorChange = (value) => {
    if (activeTab && onContentChange) {
      onContentChange(activeTab.id, value)
    }
  }

  const handleTabClose = (e, tabId) => {
    e.stopPropagation()
    if (onTabClose) {
      onTabClose(tabId)
    }
  }

  const handleRunCode = async () => {
    if (!activeTab || isExecuting) return

    setIsExecuting(true)
    try {
      console.log('Running code:', activeTab.content)
      
      // Call the parent's run code handler if provided
      if (onRunCode) {
        onRunCode()
      }
      
      setTimeout(() => {
        setIsExecuting(false)
        console.log('Code execution completed')
      }, 1000) // Shorter timeout since we're just triggering the panel
    } catch (error) {
      console.error('Execution error:', error)
      setIsExecuting(false)
    }
  }

  const isExecutableLanguage = (language) => {
    return ['javascript', 'typescript', 'python', 'java', 'cpp', 'c'].includes(language)
  }

  // Add safety check for getLanguageFromFilename
  const getFileLanguage = (fileName) => {
    if (!fileName) return 'javascript'
    try {
      return getLanguageFromFilename(fileName)
    } catch (error) {
      console.warn('Error getting language for file:', fileName, error)
      return 'javascript'
    }
  }

  if (loading) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading editor...</p>
      </div>
    )
  }

  if (!activeTab) {
    return (
      <div className="editor-empty">
        <div className="welcome-content">
          <h2>Welcome to Studio IDE</h2>
          <p>Start by creating a new file or opening an existing one</p>
          <button className="create-file-btn" onClick={onCreateNewFile}>
            New File
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="editor-group">
      {/* Tab Bar */}
      {tabs.length > 0 && (
        <div className="tab-bar">
          <div className="tabs">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
                onClick={() => onTabChange && onTabChange(tab.id)}
              >
                <span className="tab-name">{tab.name || tab.title}</span>
                <button 
                  className="tab-close"
                  onClick={(e) => handleTabClose(e, tab.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="tab-actions">
            {/* Error indicator */}
            {editorErrors.length > 0 && (
              <button 
                className={`action-btn error-indicator ${showErrorList ? 'active' : ''}`}
                onClick={() => setShowErrorList(!showErrorList)}
                title={`${editorErrors.filter(e => e.severity === 8).length} errors, ${editorErrors.filter(e => e.severity === 4).length} warnings`}
              >
                <AlertCircle size={16} />
                <span className="error-count">{editorErrors.length}</span>
              </button>
            )}

            {activeTab && isExecutableLanguage(getFileLanguage(activeTab.name)) && (
              <button 
                className={`action-btn ${isExecuting ? 'executing' : ''}`}
                onClick={isExecuting ? () => setIsExecuting(false) : handleRunCode}
                title={isExecuting ? 'Stop Execution' : 'Run Code (Ctrl+Enter)'}
              >
                {isExecuting ? <Square size={16} /> : <Play size={16} />}
              </button>
            )}
            
            <button 
              className="action-btn"
              onClick={onToggleTerminal}
              title="Toggle Terminal"
            >
              <Terminal size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      {activeTab ? (
        <div className="editor-container">
          <Editor
            height="100%"
            language={getFileLanguage(activeTab.name)}
            value={activeTab.content || ''}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: 'Fira Code, Consolas, Monaco, monospace',
              lineHeight: 20,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              parameterHints: { enabled: true },
              formatOnType: true,
              formatOnPaste: true
            }}
          />
        </div>
      ) : (
        <div className="editor-empty">
          <div className="welcome-content">
            <h2>Welcome to VS Code Studio</h2>
            <p>Start by opening a file or creating a new one</p>
            <button 
              className="action-btn primary"
              onClick={onCreateNewFile}
            >
              New File
            </button>
          </div>
        </div>
      )}

      {/* Error List Panel */}
      {showErrorList && (
        <ErrorListPanel
          isVisible={showErrorList}
          onToggle={() => setShowErrorList(false)}
          currentFile={activeTab}
          editor={editorRef.current}
        />
      )}
    </div>
  )
}

export default EditorGroup
