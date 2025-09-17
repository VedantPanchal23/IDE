import React, { useEffect, useRef, useState } from 'react'
import { 
  Lightbulb, 
  Code, 
  Search, 
  BookOpen, 
  Zap,
  FileText,
  Code2,
  Variable,
  Package,
  Hash,
  Type,
  ChevronRight,
  Star,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle
} from 'lucide-react'
import './IntelliSenseProvider.css'

const IntelliSenseProvider = ({ editor, language, onSymbolSearch, onGoToDefinition }) => {
  const [completionItems, setCompletionItems] = useState([])
  const [errorMarkers, setErrorMarkers] = useState([])
  const [hoverInfo, setHoverInfo] = useState(null)
  const [symbols, setSymbols] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize Monaco IntelliSense features
  useEffect(() => {
    if (!editor || isInitialized) return

    const monaco = window.monaco
    if (!monaco) return

    try {
      // Register completion provider
      const completionProvider = monaco.languages.registerCompletionItemProvider(language, {
        provideCompletionItems: (model, position) => {
          return provideCompletionItems(model, position)
        }
      })

      // Register hover provider
      const hoverProvider = monaco.languages.registerHoverProvider(language, {
        provideHover: (model, position) => {
          return provideHoverInfo(model, position)
        }
      })

      // Register definition provider
      const definitionProvider = monaco.languages.registerDefinitionProvider(language, {
        provideDefinition: (model, position) => {
          return provideDefinition(model, position)
        }
      })

      // Register document symbol provider
      const symbolProvider = monaco.languages.registerDocumentSymbolProvider(language, {
        provideDocumentSymbols: (model) => {
          return provideDocumentSymbols(model)
        }
      })

      // Register code action provider (for quick fixes)
      const codeActionProvider = monaco.languages.registerCodeActionProvider(language, {
        provideCodeActions: (model, range, context) => {
          return provideCodeActions(model, range, context)
        }
      })

      // Set up real-time error checking
      setupErrorChecking(editor, monaco)

      setIsInitialized(true)

      // Cleanup function
      return () => {
        completionProvider.dispose()
        hoverProvider.dispose()
        definitionProvider.dispose()
        symbolProvider.dispose()
        codeActionProvider.dispose()
      }
    } catch (error) {
      console.error('Error initializing IntelliSense:', error)
    }
  }, [editor, language, isInitialized])

  const provideCompletionItems = (model, position) => {
    const word = model.getWordUntilPosition(position)
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    }

    // Get context-aware suggestions
    const suggestions = getCompletionSuggestions(model, position, word.word)
    
    return {
      suggestions: suggestions.map(suggestion => ({
        ...suggestion,
        range: range
      }))
    }
  }

  const getCompletionSuggestions = (model, position, word) => {
    const text = model.getValue()
    const lineContent = model.getLineContent(position.lineNumber)
    const beforeCursor = lineContent.substring(0, position.column - 1)
    
    // JavaScript/TypeScript specific completions
    const jsCompletions = [
      // Built-in objects and methods
      {
        label: 'console.log',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation: 'Outputs a message to the console',
        insertText: 'console.log(${1:message})',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Console method'
      },
      {
        label: 'document.getElementById',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation: 'Returns the element that has the ID attribute with the specified value',
        insertText: 'document.getElementById(${1:id})',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'DOM method'
      },
      {
        label: 'setTimeout',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation: 'Calls a function after a specified number of milliseconds',
        insertText: 'setTimeout(${1:callback}, ${2:delay})',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Timer function'
      },
      {
        label: 'fetch',
        kind: window.monaco.languages.CompletionItemKind.Function,
        documentation: 'Starts the process of fetching a resource from the network',
        insertText: 'fetch(${1:url})\n  .then(response => response.json())\n  .then(data => ${2:console.log(data)})',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Fetch API'
      },
      // Common patterns
      {
        label: 'function',
        kind: window.monaco.languages.CompletionItemKind.Keyword,
        documentation: 'Function declaration',
        insertText: 'function ${1:name}(${2:parameters}) {\n  ${3:// code}\n}',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Function declaration'
      },
      {
        label: 'arrow function',
        kind: window.monaco.languages.CompletionItemKind.Snippet,
        documentation: 'Arrow function expression',
        insertText: '(${1:parameters}) => {\n  ${2:// code}\n}',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Arrow function'
      },
      {
        label: 'try-catch',
        kind: window.monaco.languages.CompletionItemKind.Snippet,
        documentation: 'Try-catch error handling block',
        insertText: 'try {\n  ${1:// code}\n} catch (${2:error}) {\n  ${3:console.error(error)}\n}',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Error handling'
      },
      {
        label: 'for loop',
        kind: window.monaco.languages.CompletionItemKind.Snippet,
        documentation: 'For loop iteration',
        insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n  ${3:// code}\n}',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'For loop'
      },
      {
        label: 'for...of loop',
        kind: window.monaco.languages.CompletionItemKind.Snippet,
        documentation: 'For...of loop for iterables',
        insertText: 'for (const ${1:item} of ${2:iterable}) {\n  ${3:// code}\n}',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'For...of loop'
      },
      {
        label: 'if statement',
        kind: window.monaco.languages.CompletionItemKind.Snippet,
        documentation: 'If conditional statement',
        insertText: 'if (${1:condition}) {\n  ${2:// code}\n}',
        insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: 'Conditional statement'
      }
    ]

    // React specific completions
    if (text.includes('import React') || text.includes('from \'react\'')) {
      jsCompletions.push(
        {
          label: 'useState',
          kind: window.monaco.languages.CompletionItemKind.Function,
          documentation: 'React hook for state management',
          insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue})',
          insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'React Hook'
        },
        {
          label: 'useEffect',
          kind: window.monaco.languages.CompletionItemKind.Function,
          documentation: 'React hook for side effects',
          insertText: 'useEffect(() => {\n  ${1:// effect}\n}, [${2:dependencies}])',
          insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'React Hook'
        },
        {
          label: 'React component',
          kind: window.monaco.languages.CompletionItemKind.Class,
          documentation: 'React functional component',
          insertText: 'const ${1:ComponentName} = () => {\n  return (\n    <div>\n      ${2:content}\n    </div>\n  )\n}\n\nexport default ${1:ComponentName}',
          insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'React Component'
        }
      )
    }

    // Filter suggestions based on current word
    return jsCompletions.filter(completion => 
      !word || completion.label.toLowerCase().includes(word.toLowerCase())
    )
  }

  const provideHoverInfo = (model, position) => {
    const word = model.getWordAtPosition(position)
    if (!word) return null

    const hoverData = getHoverInformation(word.word, model, position)
    if (!hoverData) return null

    return {
      range: new window.monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn
      ),
      contents: [
        { value: `**${hoverData.signature}**` },
        { value: hoverData.documentation },
        ...(hoverData.examples ? [{ value: `\`\`\`javascript\n${hoverData.examples}\n\`\`\`` }] : [])
      ]
    }
  }

  const getHoverInformation = (word, model, position) => {
    const hoverData = {
      'console': {
        signature: 'console: Console',
        documentation: 'The console object provides access to the browser\'s debugging console.',
        examples: 'console.log("Hello World")\nconsole.error("Error message")\nconsole.warn("Warning")'
      },
      'document': {
        signature: 'document: Document',
        documentation: 'The Document interface represents any web page loaded in the browser.',
        examples: 'document.getElementById("myId")\ndocument.querySelector(".class")\ndocument.createElement("div")'
      },
      'setTimeout': {
        signature: 'setTimeout(callback: Function, delay: number): number',
        documentation: 'Calls a function after a specified number of milliseconds.',
        examples: 'setTimeout(() => {\n  console.log("Delayed execution")\n}, 1000)'
      },
      'fetch': {
        signature: 'fetch(url: string, options?: RequestInit): Promise<Response>',
        documentation: 'Starts the process of fetching a resource from the network.',
        examples: 'fetch("/api/data")\n  .then(response => response.json())\n  .then(data => console.log(data))'
      },
      'useState': {
        signature: 'useState<T>(initialState: T): [T, Dispatch<SetStateAction<T>>]',
        documentation: 'React hook that lets you add state to functional components.',
        examples: 'const [count, setCount] = useState(0)\nsetCount(count + 1)'
      },
      'useEffect': {
        signature: 'useEffect(effect: EffectCallback, deps?: DependencyList): void',
        documentation: 'React hook that lets you perform side effects in functional components.',
        examples: 'useEffect(() => {\n  // Effect logic\n}, [dependency])'
      }
    }

    return hoverData[word] || null
  }

  const provideDefinition = (model, position) => {
    const word = model.getWordAtPosition(position)
    if (!word) return null

    // Mock definition locations - in real implementation, this would analyze the code
    const definitions = findDefinitions(word.word, model)
    
    return definitions.map(def => ({
      uri: model.uri,
      range: new window.monaco.Range(def.line, def.column, def.line, def.column + word.word.length)
    }))
  }

  const findDefinitions = (word, model) => {
    const text = model.getValue()
    const lines = text.split('\n')
    const definitions = []

    lines.forEach((line, index) => {
      // Look for function definitions
      const functionMatch = line.match(new RegExp(`(?:function\\s+${word}|const\\s+${word}\\s*=|let\\s+${word}\\s*=|var\\s+${word}\\s*=)`))
      if (functionMatch) {
        definitions.push({
          line: index + 1,
          column: functionMatch.index + 1,
          type: 'function'
        })
      }

      // Look for class definitions
      const classMatch = line.match(new RegExp(`class\\s+${word}`))
      if (classMatch) {
        definitions.push({
          line: index + 1,
          column: classMatch.index + 1,
          type: 'class'
        })
      }
    })

    return definitions
  }

  const provideDocumentSymbols = (model) => {
    const text = model.getValue()
    const lines = text.split('\n')
    const symbols = []

    lines.forEach((line, index) => {
      // Find functions
      const functionMatch = line.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=|let\s+(\w+)\s*=|var\s+(\w+)\s*=)/)
      if (functionMatch) {
        const name = functionMatch[1] || functionMatch[2] || functionMatch[3] || functionMatch[4]
        symbols.push({
          name,
          kind: window.monaco.languages.SymbolKind.Function,
          range: new window.monaco.Range(index + 1, 1, index + 1, line.length),
          selectionRange: new window.monaco.Range(index + 1, 1, index + 1, line.length)
        })
      }

      // Find classes
      const classMatch = line.match(/class\s+(\w+)/)
      if (classMatch) {
        symbols.push({
          name: classMatch[1],
          kind: window.monaco.languages.SymbolKind.Class,
          range: new window.monaco.Range(index + 1, 1, index + 1, line.length),
          selectionRange: new window.monaco.Range(index + 1, 1, index + 1, line.length)
        })
      }

      // Find constants and variables
      const varMatch = line.match(/(?:const|let|var)\s+(\w+)/)
      if (varMatch && !functionMatch) {
        symbols.push({
          name: varMatch[1],
          kind: window.monaco.languages.SymbolKind.Variable,
          range: new window.monaco.Range(index + 1, 1, index + 1, line.length),
          selectionRange: new window.monaco.Range(index + 1, 1, index + 1, line.length)
        })
      }
    })

    return symbols
  }

  const provideCodeActions = (model, range, context) => {
    const actions = []

    // Add quick fixes for common issues
    context.markers.forEach(marker => {
      if (marker.severity === window.monaco.MarkerSeverity.Error) {
        // Example: Missing semicolon fix
        if (marker.message.includes('semicolon')) {
          actions.push({
            title: 'Add missing semicolon',
            kind: 'quickfix',
            edit: {
              edits: [{
                resource: model.uri,
                edit: {
                  range: new window.monaco.Range(marker.endLineNumber, marker.endColumn, marker.endLineNumber, marker.endColumn),
                  text: ';'
                }
              }]
            }
          })
        }
      }
    })

    return { actions, dispose: () => {} }
  }

  const setupErrorChecking = (editor, monaco) => {
    const model = editor.getModel()
    if (!model) return

    // Real-time syntax checking
    const checkSyntax = () => {
      const content = model.getValue()
      const errors = performSyntaxCheck(content)
      
      monaco.editor.setModelMarkers(model, 'javascript', errors.map(error => ({
        severity: error.severity,
        message: error.message,
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.line,
        endColumn: error.column + (error.length || 1)
      })))
    }

    // Check syntax on content change
    const disposable = model.onDidChangeContent(() => {
      setTimeout(checkSyntax, 500) // Debounce
    })

    // Initial check
    checkSyntax()

    return disposable
  }

  const performSyntaxCheck = (content) => {
    const errors = []
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      // Check for common syntax errors
      
      // Missing semicolons (simple check)
      if (line.trim() && 
          !line.trim().endsWith(';') && 
          !line.trim().endsWith('{') && 
          !line.trim().endsWith('}') &&
          !line.trim().startsWith('//') &&
          !line.trim().startsWith('*') &&
          !line.includes('if') &&
          !line.includes('for') &&
          !line.includes('while') &&
          !line.includes('function') &&
          !line.includes('class') &&
          line.match(/^\s*(const|let|var|return)\s+/)) {
        errors.push({
          severity: window.monaco.MarkerSeverity.Warning,
          message: 'Missing semicolon',
          line: index + 1,
          column: line.length,
          length: 1
        })
      }

      // Unmatched parentheses
      const openParens = (line.match(/\(/g) || []).length
      const closeParens = (line.match(/\)/g) || []).length
      if (openParens !== closeParens) {
        errors.push({
          severity: window.monaco.MarkerSeverity.Error,
          message: 'Unmatched parentheses',
          line: index + 1,
          column: 1,
          length: line.length
        })
      }

      // Undefined variables (basic check)
      const undefinedMatch = line.match(/\b(\w+)\s*\(\)/)
      if (undefinedMatch && !['console', 'document', 'window', 'setTimeout', 'setInterval'].includes(undefinedMatch[1])) {
        // This is a simplified check - real implementation would use AST analysis
      }
    })

    return errors
  }

  return null // This component doesn't render anything visible
}

export default IntelliSenseProvider
