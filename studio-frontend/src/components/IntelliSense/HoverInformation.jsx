import React, { useEffect, useState } from 'react'
import { Book, Code, FileText, Link, Tag, Zap } from 'lucide-react'
import './HoverInformation.css'

const HoverInformation = ({ editor, language }) => {
  const [hoverProvider, setHoverProvider] = useState(null)

  useEffect(() => {
    if (!editor || !window.monaco) return

    const monaco = window.monaco

    // Register hover provider
    const provider = monaco.languages.registerHoverProvider(language, {
      provideHover: (model, position) => {
        return new Promise((resolve) => {
          const hoverInfo = getHoverInformation(model, position, language)
          resolve(hoverInfo)
        })
      }
    })

    setHoverProvider(provider)

    // Configure hover behavior
    const editorInstance = editor
    if (editorInstance) {
      editorInstance.updateOptions({
        hover: {
          enabled: true,
          delay: 300,
          sticky: true
        }
      })
    }

    return () => {
      if (provider) {
        provider.dispose()
      }
    }
  }, [editor, language])

  const getHoverInformation = (model, position, language) => {
    const word = model.getWordAtPosition(position)
    if (!word) return null

    const wordValue = word.word
    const line = model.getLineContent(position.lineNumber)
    const fullLine = line.trim()

    // Get hover information based on word context
    const hoverData = getWordInformation(wordValue, fullLine, position, model, language)
    
    if (!hoverData) return null

    return {
      range: new window.monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn
      ),
      contents: formatHoverContents(hoverData)
    }
  }

  const getWordInformation = (word, line, position, model, language) => {
    // Check for built-in JavaScript/TypeScript objects and functions
    const jsBuiltins = getJavaScriptBuiltins(word)
    if (jsBuiltins) return jsBuiltins

    // Check for HTML elements and attributes
    if (language === 'html') {
      const htmlInfo = getHTMLInformation(word, line)
      if (htmlInfo) return htmlInfo
    }

    // Check for CSS properties and values
    if (language === 'css') {
      const cssInfo = getCSSInformation(word, line)
      if (cssInfo) return cssInfo
    }

    // Check for React components and hooks
    const reactInfo = getReactInformation(word, line)
    if (reactInfo) return reactInfo

    // Check for local variable/function definitions
    const localInfo = getLocalDefinition(word, model, position)
    if (localInfo) return localInfo

    // Check for library/package information
    const libraryInfo = getLibraryInformation(word, line)
    if (libraryInfo) return libraryInfo

    return null
  }

  const getJavaScriptBuiltins = (word) => {
    const builtins = {
      'console': {
        type: 'object',
        description: 'The console object provides access to the browser debugging console.',
        syntax: 'console.method()',
        methods: ['log', 'error', 'warn', 'info', 'debug', 'clear', 'table'],
        example: 'console.log("Hello, world!");',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/API/Console'
      },
      'Array': {
        type: 'constructor',
        description: 'The Array constructor is used to create Array objects.',
        syntax: 'new Array(length) or Array.from()',
        methods: ['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'map', 'filter', 'reduce'],
        example: 'const arr = new Array(5).fill(0);',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array'
      },
      'Object': {
        type: 'constructor',
        description: 'The Object constructor creates an object wrapper.',
        syntax: 'Object.method() or new Object()',
        methods: ['keys', 'values', 'entries', 'assign', 'create', 'freeze'],
        example: 'const obj = Object.create(null);',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object'
      },
      'String': {
        type: 'constructor',
        description: 'The String constructor is used to create String objects.',
        syntax: 'new String(value) or String.method()',
        methods: ['charAt', 'indexOf', 'slice', 'split', 'replace', 'toLowerCase', 'toUpperCase'],
        example: 'const str = String(123);',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String'
      },
      'Number': {
        type: 'constructor',
        description: 'The Number constructor contains constants and methods for working with numbers.',
        syntax: 'Number.method() or new Number(value)',
        methods: ['parseInt', 'parseFloat', 'isInteger', 'isNaN', 'toFixed'],
        example: 'const num = Number.parseInt("42");',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number'
      },
      'Math': {
        type: 'object',
        description: 'Math is a built-in object with properties and methods for mathematical constants and functions.',
        syntax: 'Math.method()',
        methods: ['abs', 'ceil', 'floor', 'round', 'max', 'min', 'random', 'pow', 'sqrt'],
        example: 'const random = Math.random();',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math'
      },
      'Date': {
        type: 'constructor',
        description: 'Creates a JavaScript Date instance that represents a moment in time.',
        syntax: 'new Date() or Date.method()',
        methods: ['getTime', 'getFullYear', 'getMonth', 'getDate', 'setFullYear', 'toISOString'],
        example: 'const now = new Date();',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date'
      },
      'JSON': {
        type: 'object',
        description: 'The JSON object contains methods for parsing JSON and converting values to JSON.',
        syntax: 'JSON.method()',
        methods: ['parse', 'stringify'],
        example: 'const obj = JSON.parse(jsonString);',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON'
      },
      'Promise': {
        type: 'constructor',
        description: 'The Promise object represents the eventual completion (or failure) of an asynchronous operation.',
        syntax: 'new Promise((resolve, reject) => {})',
        methods: ['then', 'catch', 'finally', 'all', 'race', 'resolve', 'reject'],
        example: 'const promise = new Promise(resolve => resolve(42));',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise'
      },
      'fetch': {
        type: 'function',
        description: 'The fetch() method starts the process of fetching a resource from the network.',
        syntax: 'fetch(url, options)',
        parameters: ['url', 'options (optional)'],
        example: 'fetch("/api/data").then(response => response.json());',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'
      },
      'setTimeout': {
        type: 'function',
        description: 'The setTimeout() method calls a function after a specified number of milliseconds.',
        syntax: 'setTimeout(function, delay, ...args)',
        parameters: ['function', 'delay', 'arguments (optional)'],
        example: 'setTimeout(() => console.log("Hello"), 1000);',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/API/setTimeout'
      },
      'setInterval': {
        type: 'function',
        description: 'The setInterval() method repeatedly calls a function with a fixed time delay between each call.',
        syntax: 'setInterval(function, delay, ...args)',
        parameters: ['function', 'delay', 'arguments (optional)'],
        example: 'setInterval(() => console.log("Tick"), 1000);',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/API/setInterval'
      }
    }

    return builtins[word]
  }

  const getReactInformation = (word, line) => {
    const reactBuiltins = {
      'useState': {
        type: 'hook',
        description: 'A Hook that lets you add React state to function components.',
        syntax: 'const [state, setState] = useState(initialState)',
        parameters: ['initialState'],
        returns: 'Array with current state value and state setter function',
        example: 'const [count, setCount] = useState(0);',
        docs: 'https://reactjs.org/docs/hooks-state.html'
      },
      'useEffect': {
        type: 'hook',
        description: 'A Hook that lets you perform side effects in function components.',
        syntax: 'useEffect(effect, dependencies)',
        parameters: ['effect function', 'dependencies array (optional)'],
        example: 'useEffect(() => { document.title = count; }, [count]);',
        docs: 'https://reactjs.org/docs/hooks-effect.html'
      },
      'useContext': {
        type: 'hook',
        description: 'A Hook that lets you subscribe to React context without nesting.',
        syntax: 'const value = useContext(MyContext)',
        parameters: ['context object'],
        example: 'const theme = useContext(ThemeContext);',
        docs: 'https://reactjs.org/docs/hooks-reference.html#usecontext'
      },
      'useReducer': {
        type: 'hook',
        description: 'A Hook that lets you manage complex state logic through a reducer function.',
        syntax: 'const [state, dispatch] = useReducer(reducer, initialArg, init)',
        parameters: ['reducer', 'initialArg', 'init (optional)'],
        example: 'const [state, dispatch] = useReducer(counterReducer, {count: 0});',
        docs: 'https://reactjs.org/docs/hooks-reference.html#usereducer'
      },
      'useMemo': {
        type: 'hook',
        description: 'A Hook that memoizes expensive calculations.',
        syntax: 'const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])',
        parameters: ['factory function', 'dependencies array'],
        example: 'const expensiveValue = useMemo(() => computeExpensive(a, b), [a, b]);',
        docs: 'https://reactjs.org/docs/hooks-reference.html#usememo'
      },
      'useCallback': {
        type: 'hook',
        description: 'A Hook that memoizes a callback function.',
        syntax: 'const memoizedCallback = useCallback(() => {}, [dependencies])',
        parameters: ['callback function', 'dependencies array'],
        example: 'const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);',
        docs: 'https://reactjs.org/docs/hooks-reference.html#usecallback'
      },
      'React': {
        type: 'library',
        description: 'A JavaScript library for building user interfaces.',
        methods: ['createElement', 'Component', 'Fragment', 'memo', 'forwardRef'],
        example: 'import React from "react";',
        docs: 'https://reactjs.org/docs/react-api.html'
      },
      'Component': {
        type: 'class',
        description: 'The base class for React components when defined as ES6 classes.',
        syntax: 'class MyComponent extends React.Component',
        methods: ['render', 'componentDidMount', 'componentDidUpdate', 'componentWillUnmount'],
        example: 'class MyComponent extends React.Component { render() { return <div />; } }',
        docs: 'https://reactjs.org/docs/react-component.html'
      }
    }

    return reactBuiltins[word]
  }

  const getHTMLInformation = (word, line) => {
    const htmlElements = {
      'div': {
        type: 'element',
        description: 'A generic container for flow content.',
        category: 'Flow content',
        attributes: ['id', 'class', 'style', 'data-*'],
        example: '<div class="container">Content</div>',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/div'
      },
      'span': {
        type: 'element',
        description: 'A generic inline container for phrasing content.',
        category: 'Phrasing content',
        attributes: ['id', 'class', 'style'],
        example: '<span class="highlight">Text</span>',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/span'
      },
      'button': {
        type: 'element',
        description: 'An interactive element activated by a user with a mouse, keyboard, finger, voice command, or other assistive technology.',
        category: 'Interactive content',
        attributes: ['type', 'disabled', 'onclick', 'form'],
        example: '<button type="submit">Click me</button>',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button'
      },
      'input': {
        type: 'element',
        description: 'Used to create interactive controls for web-based forms.',
        category: 'Form-associated content',
        attributes: ['type', 'name', 'value', 'placeholder', 'required'],
        example: '<input type="text" placeholder="Enter text">',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input'
      }
    }

    return htmlElements[word]
  }

  const getCSSInformation = (word, line) => {
    const cssProperties = {
      'display': {
        type: 'property',
        description: 'Sets whether an element is treated as a block or inline element.',
        values: ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'],
        example: 'display: flex;',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/CSS/display'
      },
      'flex': {
        type: 'property',
        description: 'A shorthand property for flex-grow, flex-shrink, and flex-basis.',
        values: ['auto', 'initial', 'none', '<number>'],
        example: 'flex: 1 0 auto;',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex'
      },
      'grid': {
        type: 'property',
        description: 'A shorthand property for grid-template-rows, grid-template-columns, and more.',
        values: ['none', '<grid-template>', '<grid-template-rows> / <grid-template-columns>'],
        example: 'grid: repeat(3, 1fr) / auto-flow dense;',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/CSS/grid'
      },
      'color': {
        type: 'property',
        description: 'Sets the foreground color value of text and text decorations.',
        values: ['<color>', 'inherit', 'initial', 'unset'],
        example: 'color: #ff0000;',
        mdn: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color'
      }
    }

    return cssProperties[word]
  }

  const getLocalDefinition = (word, model, position) => {
    const content = model.getValue()
    const lines = content.split('\n')
    
    // Look for variable/function declarations
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Function declarations
      const functionMatch = line.match(new RegExp(`function\\s+${word}\\s*\\(`))
      if (functionMatch) {
        return {
          type: 'function',
          description: `User-defined function: ${word}`,
          location: `Line ${i + 1}`,
          preview: line.trim(),
          definition: true
        }
      }
      
      // Variable declarations
      const varMatch = line.match(new RegExp(`(?:const|let|var)\\s+${word}\\s*=`))
      if (varMatch) {
        return {
          type: 'variable',
          description: `Local variable: ${word}`,
          location: `Line ${i + 1}`,
          preview: line.trim(),
          definition: true
        }
      }
      
      // Arrow functions
      const arrowMatch = line.match(new RegExp(`(?:const|let|var)\\s+${word}\\s*=\\s*\\(`))
      if (arrowMatch) {
        return {
          type: 'function',
          description: `Arrow function: ${word}`,
          location: `Line ${i + 1}`,
          preview: line.trim(),
          definition: true
        }
      }
    }
    
    return null
  }

  const getLibraryInformation = (word, line) => {
    // Check if it's a popular library or package
    const libraries = {
      'lodash': {
        type: 'library',
        description: 'A modern JavaScript utility library delivering modularity, performance & extras.',
        usage: 'Utility functions for arrays, objects, strings, and more',
        example: 'import _ from "lodash";',
        website: 'https://lodash.com/'
      },
      'axios': {
        type: 'library',
        description: 'Promise based HTTP client for the browser and node.js.',
        usage: 'Making HTTP requests',
        example: 'axios.get("/api/users").then(response => console.log(response.data));',
        website: 'https://axios-http.com/'
      },
      'express': {
        type: 'library',
        description: 'Fast, unopinionated, minimalist web framework for Node.js.',
        usage: 'Building web servers and APIs',
        example: 'const app = express();',
        website: 'https://expressjs.com/'
      }
    }

    return libraries[word]
  }

  const formatHoverContents = (hoverData) => {
    const contents = []

    // Main description
    contents.push({
      value: `**${hoverData.type}** ${hoverData.description}`,
      isTrusted: true
    })

    // Syntax information
    if (hoverData.syntax) {
      contents.push({
        value: `**Syntax:** \`${hoverData.syntax}\``,
        isTrusted: true
      })
    }

    // Parameters
    if (hoverData.parameters) {
      contents.push({
        value: `**Parameters:** ${hoverData.parameters.join(', ')}`,
        isTrusted: true
      })
    }

    // Methods
    if (hoverData.methods) {
      contents.push({
        value: `**Methods:** ${hoverData.methods.slice(0, 5).join(', ')}${hoverData.methods.length > 5 ? '...' : ''}`,
        isTrusted: true
      })
    }

    // Values (for CSS)
    if (hoverData.values) {
      contents.push({
        value: `**Values:** ${hoverData.values.slice(0, 4).join(', ')}${hoverData.values.length > 4 ? '...' : ''}`,
        isTrusted: true
      })
    }

    // Example
    if (hoverData.example) {
      contents.push({
        value: `**Example:**\n\`\`\`javascript\n${hoverData.example}\n\`\`\``,
        isTrusted: true
      })
    }

    // Location (for local definitions)
    if (hoverData.location) {
      contents.push({
        value: `**Location:** ${hoverData.location}`,
        isTrusted: true
      })
    }

    // Preview (for local definitions)
    if (hoverData.preview) {
      contents.push({
        value: `\`\`\`javascript\n${hoverData.preview}\n\`\`\``,
        isTrusted: true
      })
    }

    // Documentation link
    if (hoverData.mdn) {
      contents.push({
        value: `[📖 MDN Documentation](${hoverData.mdn})`,
        isTrusted: true
      })
    }

    if (hoverData.docs) {
      contents.push({
        value: `[📖 Documentation](${hoverData.docs})`,
        isTrusted: true
      })
    }

    if (hoverData.website) {
      contents.push({
        value: `[🌐 Website](${hoverData.website})`,
        isTrusted: true
      })
    }

    return contents
  }

  // This component doesn't render anything visible
  return null
}

export default HoverInformation
