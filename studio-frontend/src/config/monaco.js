import * as monaco from 'monaco-editor'

// Configure Monaco Editor with all VS Code languages and features
export const configureMonaco = () => {
  // Configure TypeScript compiler options for better IntelliSense
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types']
  })

  // Configure diagnostics options
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: false
  })

  // Add common library definitions
  addLibraryDefinitions()

  // Register custom completion providers
  registerCompletionProviders()

  // Register hover providers
  registerHoverProviders()

  // Register code action providers
  registerCodeActionProviders()

  // Define custom VS Code theme
  monaco.editor.defineTheme('vs-code-dark-plus', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // JavaScript/TypeScript
      { token: 'keyword.js', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string.js', foreground: 'CE9178' },
      { token: 'comment.js', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'number.js', foreground: 'B5CEA8' },
      { token: 'regexp.js', foreground: 'D16969' },
      { token: 'operator.js', foreground: 'D4D4D4' },
      { token: 'type.js', foreground: '4EC9B0' },
      { token: 'variable.js', foreground: '9CDCFE' },
      { token: 'function.js', foreground: 'DCDCAA' },
      { token: 'class.js', foreground: '4EC9B0' },
      
      // Python
      { token: 'keyword.python', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string.python', foreground: 'CE9178' },
      { token: 'comment.python', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'number.python', foreground: 'B5CEA8' },
      { token: 'operator.python', foreground: 'D4D4D4' },
      { token: 'type.python', foreground: '4EC9B0' },
      { token: 'function.python', foreground: 'DCDCAA' },
      { token: 'class.python', foreground: '4EC9B0' },
      
      // HTML
      { token: 'tag.html', foreground: '569CD6' },
      { token: 'attribute.name.html', foreground: '9CDCFE' },
      { token: 'attribute.value.html', foreground: 'CE9178' },
      { token: 'string.html', foreground: 'CE9178' },
      
      // CSS
      { token: 'tag.css', foreground: 'D7BA7D' },
      { token: 'attribute.name.css', foreground: '9CDCFE' },
      { token: 'attribute.value.css', foreground: 'CE9178' },
      { token: 'property.css', foreground: '9CDCFE' },
      { token: 'keyword.css', foreground: '569CD6' },
      
      // JSON
      { token: 'string.key.json', foreground: '9CDCFE' },
      { token: 'string.value.json', foreground: 'CE9178' },
      { token: 'number.json', foreground: 'B5CEA8' },
      { token: 'keyword.json', foreground: '569CD6' },
      
      // Java
      { token: 'keyword.java', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string.java', foreground: 'CE9178' },
      { token: 'comment.java', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'type.java', foreground: '4EC9B0' },
      { token: 'class.java', foreground: '4EC9B0' },
      
      // C/C++
      { token: 'keyword.cpp', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string.cpp', foreground: 'CE9178' },
      { token: 'comment.cpp', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'type.cpp', foreground: '4EC9B0' },
      { token: 'function.cpp', foreground: 'DCDCAA' },
      
      // Go
      { token: 'keyword.go', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string.go', foreground: 'CE9178' },
      { token: 'comment.go', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'type.go', foreground: '4EC9B0' },
      { token: 'function.go', foreground: 'DCDCAA' },
      
      // Rust
      { token: 'keyword.rust', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string.rust', foreground: 'CE9178' },
      { token: 'comment.rust', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'type.rust', foreground: '4EC9B0' },
      { token: 'function.rust', foreground: 'DCDCAA' },
      
      // PHP
      { token: 'keyword.php', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'string.php', foreground: 'CE9178' },
      { token: 'comment.php', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'variable.php', foreground: '9CDCFE' },
      { token: 'function.php', foreground: 'DCDCAA' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editor.lineHighlightBackground': '#2a2a2a',
      'editor.selectionBackground': '#264f78',
      'editor.selectionHighlightBackground': '#add6ff26',
      'editorCursor.foreground': '#aeafad',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#c6c6c6',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
      'editorWhitespace.foreground': '#404040',
      'editorBracketMatch.background': '#0064001a',
      'editorBracketMatch.border': '#888888',
      'editorError.foreground': '#f14c4c',
      'editorWarning.foreground': '#ff8c00',
      'editorInfo.foreground': '#75beff',
      'editorHint.foreground': '#eeeeee',
      'editorGutter.background': '#1e1e1e',
      'editorGutter.modifiedBackground': '#1f6feb',
      'editorGutter.addedBackground': '#238636',
      'editorGutter.deletedBackground': '#f85149',
      'diffEditor.insertedTextBackground': '#23863620',
      'diffEditor.removedTextBackground': '#f8514920',
      'editorSuggestWidget.background': '#252526',
      'editorSuggestWidget.border': '#454545',
      'editorSuggestWidget.foreground': '#d4d4d4',
      'editorSuggestWidget.selectedBackground': '#094771',
      'editorHoverWidget.background': '#252526',
      'editorHoverWidget.border': '#454545',
      'peekView.border': '#007acc',
      'peekViewEditor.background': '#001f33',
      'peekViewEditor.matchHighlightBackground': '#ff8f0099',
      'peekViewResult.background': '#252526',
      'peekViewResult.fileForeground': '#ffffff',
      'peekViewResult.lineForeground': '#bbbbbb',
      'peekViewResult.matchHighlightBackground': '#ea5c004d',
      'peekViewResult.selectionBackground': '#3399ff33',
      'peekViewResult.selectionForeground': '#ffffff',
      'peekViewTitle.background': '#1e1e1e',
      'peekViewTitleDescription.foreground': '#ccccccb3',
      'peekViewTitleLabel.foreground': '#ffffff',
    }
  })
  
  // Configure language services
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: 'React',
    allowJs: true,
    typeRoots: ['node_modules/@types']
  })
  
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    allowJs: true,
    jsx: monaco.languages.typescript.JsxEmit.React
  })
  
  // Configure diagnostic options
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    onlyVisible: false
  })
  
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    onlyVisible: false
  })
  
  // Add extra libraries for better IntelliSense
  const reactTypings = `
    declare module 'react' {
      export interface Component<P = {}, S = {}> {}
      export function useState<T>(initialState: T): [T, (value: T) => void];
      export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
      export function useMemo<T>(factory: () => T, deps: any[]): T;
      export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
      export const Fragment: any;
      export default React;
    }
  `
  
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    reactTypings,
    'file:///node_modules/@types/react/index.d.ts'
  )
  
  // Set theme
  monaco.editor.setTheme('vs-code-dark-plus')
}

// Language mappings for file extensions
export const getLanguageFromFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return 'plaintext'
  }
  
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const languageMap = {
    // JavaScript family
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    
    // Web technologies
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    
    // Backend languages
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    
    // Shell and config
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'fish': 'shell',
    'ps1': 'powershell',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'cfg': 'ini',
    
    // Documentation
    'md': 'markdown',
    'markdown': 'markdown',
    'txt': 'plaintext',
    'log': 'plaintext',
    
    // Database
    'sql': 'sql',
    
    // Docker
    'dockerfile': 'dockerfile',
    
    // Other
    'r': 'r',
    'dart': 'dart',
    'lua': 'lua',
    'perl': 'perl',
    'pl': 'perl'
  }
  
  return languageMap[ext] || 'plaintext'
}

// Monaco editor options for different scenarios
export const getEditorOptions = (language) => {
  const baseOptions = {
    theme: 'vs-code-dark-plus',
    fontSize: 14,
    fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', monospace",
    lineNumbers: 'on',
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'off',
    renderWhitespace: 'selection',
    bracketPairColorization: { enabled: true },
    guides: {
      indentation: true,
      bracketPairs: true
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showFunctions: true,
      showConstructors: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showModules: true,
      showProperties: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showEvents: true,
      showOperators: true,
      showTypeParameters: true
    },
    quickSuggestions: {
      other: true,
      comments: true,
      strings: true
    },
    parameterHints: {
      enabled: true
    },
    formatOnPaste: true,
    formatOnType: true,
    codeLens: true,
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    matchBrackets: 'always',
    glyphMargin: true,
    rulers: [],
    hover: {
      enabled: true,
      delay: 500
    },
    lightbulb: {
      enabled: true
    },
    codeActionsOnSave: {
      'source.fixAll': true
    }
  }
  
  // Language-specific configurations
  switch (language) {
    case 'python':
      return {
        ...baseOptions,
        tabSize: 4,
        rulers: [79, 88]
      }
    case 'go':
      return {
        ...baseOptions,
        insertSpaces: false,
        tabSize: 4
      }
    case 'yaml':
    case 'yml':
      return {
        ...baseOptions,
        tabSize: 2,
        insertSpaces: true
      }
    default:
      return baseOptions
  }
}

// Add common library definitions for better IntelliSense
const addLibraryDefinitions = () => {
  // DOM and Browser APIs
  const domTypes = `
declare var window: Window & typeof globalThis;
declare var document: Document;
declare var console: Console;
declare var localStorage: Storage;
declare var sessionStorage: Storage;
declare var fetch: typeof fetch;

interface Console {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
  table(data: any): void;
  time(label?: string): void;
  timeEnd(label?: string): void;
}
`

  // Common Node.js modules
  const nodeTypes = `
declare module "fs" {
  export function readFile(path: string, callback: (err: any, data: Buffer) => void): void;
  export function writeFile(path: string, data: any, callback: (err: any) => void): void;
  export function existsSync(path: string): boolean;
}

declare module "path" {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string): string;
}

declare module "express" {
  interface Request {
    body: any;
    params: any;
    query: any;
  }
  interface Response {
    send(data: any): void;
    json(data: any): void;
    status(code: number): Response;
  }
  function express(): any;
  export = express;
}
`

  // React types
  const reactTypes = `
declare namespace React {
  interface Component<P = {}, S = {}> {
    props: P;
    state: S;
    setState(state: Partial<S>): void;
    render(): JSX.Element;
  }
  
  interface FunctionComponent<P = {}> {
    (props: P): JSX.Element;
  }
  
  function useState<T>(initial: T): [T, (value: T) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  function useMemo<T>(factory: () => T, deps: any[]): T;
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    div: any;
    span: any;
    button: any;
    input: any;
    form: any;
    [elemName: string]: any;
  }
}
`

  // Add the type definitions
  monaco.languages.typescript.javascriptDefaults.addExtraLib(domTypes, 'dom.d.ts')
  monaco.languages.typescript.javascriptDefaults.addExtraLib(nodeTypes, 'node.d.ts')
  monaco.languages.typescript.javascriptDefaults.addExtraLib(reactTypes, 'react.d.ts')
}

// Register intelligent completion providers
const registerCompletionProviders = () => {
  // JavaScript/TypeScript completion provider
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const suggestions = [
        // Console methods
        {
          label: 'console.log',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'console.log(${1:message})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Outputs a message to the console',
          range: range
        },
        {
          label: 'console.error',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'console.error(${1:error})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Outputs an error message to the console',
          range: range
        },
        
        // Function templates
        {
          label: 'function',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'function ${1:functionName}(${2:parameters}) {\n\t${3:// function body}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Function declaration',
          range: range
        },
        {
          label: 'arrow function',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '(${1:parameters}) => {\n\t${2:// function body}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Arrow function',
          range: range
        },
        
        // Control structures
        {
          label: 'if',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'if (${1:condition}) {\n\t${2:// code}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'If statement',
          range: range
        },
        {
          label: 'for',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3:// code}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'For loop',
          range: range
        },
        {
          label: 'forEach',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '${1:array}.forEach((${2:item}, ${3:index}) => {\n\t${4:// code}\n})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Array forEach method',
          range: range
        },
        
        // Try-catch
        {
          label: 'try-catch',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'try {\n\t${1:// code that may throw}\n} catch (${2:error}) {\n\t${3:// handle error}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Try-catch block',
          range: range
        },
        
        // Async/await
        {
          label: 'async function',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'async function ${1:functionName}(${2:parameters}) {\n\t${3:// async code}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Async function declaration',
          range: range
        },
        
        // React hooks
        {
          label: 'useState',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'const [${1:state}, set${1/(.*)/${1:/capitalize}/}] = useState(${2:initialValue})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'React useState hook',
          range: range
        },
        {
          label: 'useEffect',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'useEffect(() => {\n\t${1:// effect code}\n}, [${2:dependencies}])',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'React useEffect hook',
          range: range
        }
      ]

      return { suggestions }
    }
  })
}

// Register hover providers for documentation
const registerHoverProviders = () => {
  monaco.languages.registerHoverProvider('javascript', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position)
      if (!word) return

      const hoverInfo = {
        'console': {
          contents: [
            { value: '**Console API**' },
            { value: 'The console object provides access to the browser\'s debugging console.' },
            { value: '```javascript\nconsole.log("Hello World")\nconsole.error("Error message")\nconsole.warn("Warning message")\n```' }
          ]
        },
        'function': {
          contents: [
            { value: '**Function Declaration**' },
            { value: 'Functions are one of the fundamental building blocks in JavaScript.' },
            { value: '```javascript\nfunction myFunction(param1, param2) {\n  return param1 + param2;\n}\n```' }
          ]
        },
        'const': {
          contents: [
            { value: '**const**' },
            { value: 'Creates a read-only named constant.' },
            { value: '```javascript\nconst PI = 3.14159;\n```' }
          ]
        },
        'let': {
          contents: [
            { value: '**let**' },
            { value: 'Declares a block-scoped local variable.' },
            { value: '```javascript\nlet count = 0;\n```' }
          ]
        },
        'var': {
          contents: [
            { value: '**var**' },
            { value: 'Declares a function-scoped or globally-scoped variable.' },
            { value: '```javascript\nvar name = "John";\n```' }
          ]
        }
      }

      const info = hoverInfo[word.word]
      if (info) {
        return {
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          ),
          contents: info.contents
        }
      }
    }
  })
}

// Register code action providers for quick fixes
const registerCodeActionProviders = () => {
  monaco.languages.registerCodeActionProvider('javascript', {
    provideCodeActions: (model, range, context) => {
      const actions = []

      // Check for missing semicolons
      const lineContent = model.getLineContent(range.startLineNumber)
      if (lineContent.trim() && !lineContent.trim().endsWith(';') && !lineContent.trim().endsWith('{') && !lineContent.trim().endsWith('}')) {
        actions.push({
          title: 'Add missing semicolon',
          kind: 'quickfix',
          edit: {
            edits: [{
              resource: model.uri,
              edit: {
                range: new monaco.Range(range.startLineNumber, lineContent.length + 1, range.startLineNumber, lineContent.length + 1),
                text: ';'
              }
            }]
          }
        })
      }

      // Suggest console.log for debugging
      const selectedText = model.getValueInRange(range)
      if (selectedText && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(selectedText)) {
        actions.push({
          title: `Log '${selectedText}' to console`,
          kind: 'refactor',
          edit: {
            edits: [{
              resource: model.uri,
              edit: {
                range: new monaco.Range(range.endLineNumber + 1, 1, range.endLineNumber + 1, 1),
                text: `\nconsole.log('${selectedText}:', ${selectedText});\n`
              }
            }]
          }
        })
      }

      return {
        actions: actions,
        dispose: () => {}
      }
    }
  })
}

export default {
  configureMonaco,
  getLanguageFromFilename,
  getEditorOptions
}
