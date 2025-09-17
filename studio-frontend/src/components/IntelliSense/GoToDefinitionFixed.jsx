import React, { useState, useEffect, useRef } from 'react'
import { 
  MousePointer, 
  ExternalLink, 
  FileText, 
  ArrowUpRight,
  MapPin,
  Eye,
  ChevronRight
} from 'lucide-react'
import './GoToDefinition.css'

const GoToDefinition = ({ editor, language }) => {
  const [definitionInfo, setDefinitionInfo] = useState(null)
  const [showPeek, setShowPeek] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const disposablesRef = useRef([])

  useEffect(() => {
    if (!editor || !window.monaco) {
      return
    }

    // Clear previous disposables
    disposablesRef.current.forEach(disposable => {
      try {
        if (disposable && typeof disposable.dispose === 'function') {
          disposable.dispose()
        }
      } catch (error) {
        // Silently handle disposal errors
      }
    })
    disposablesRef.current = []

    try {
      const handleKeyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
          setIsCtrlPressed(true)
        }
      }

      const handleKeyUp = (e) => {
        if (!e.ctrlKey && !e.metaKey) {
          setIsCtrlPressed(false)
        }
      }

      const handleClick = (e) => {
        if (isCtrlPressed && editor && !editor.isDisposed?.()) {
          try {
            const position = editor.getTargetAtClientPoint(e.clientX, e.clientY)
            if (position?.position) {
              handleGoToDefinition(position.position)
            }
          } catch (error) {
            // Silently handle click errors
          }
        }
      }

      // Add event listeners
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('keyup', handleKeyUp)
      
      const editorDomNode = editor.getDomNode?.()
      if (editorDomNode) {
        editorDomNode.addEventListener('click', handleClick)
      }

      // Cleanup function
      return () => {
        try {
          document.removeEventListener('keydown', handleKeyDown)
          document.removeEventListener('keyup', handleKeyUp)
          
          if (editorDomNode) {
            editorDomNode.removeEventListener('click', handleClick)
          }
          
          disposablesRef.current.forEach(disposable => {
            try {
              if (disposable && typeof disposable.dispose === 'function') {
                disposable.dispose()
              }
            } catch (error) {
              // Silently handle disposal errors
            }
          })
          disposablesRef.current = []
        } catch (error) {
          // Silently handle cleanup errors
        }
      }
    } catch (error) {
      console.warn('Error setting up GoToDefinition:', error)
      return () => {} // Return empty cleanup function on error
    }
  }, [editor, language])

  const handleGoToDefinition = (position) => {
    if (!editor || editor.isDisposed?.()) return

    try {
      const model = editor.getModel()
      if (!model) return

      const word = model.getWordAtPosition(position)
      if (!word) return

      const definition = findDefinition(word.word, model, position)
      if (definition) {
        editor.setPosition(definition)
        editor.revealLineInCenter(definition.lineNumber)
      }
    } catch (error) {
      console.warn('Error handling go to definition:', error)
    }
  }

  const handlePeekDefinition = (position) => {
    if (!editor || editor.isDisposed?.()) return

    try {
      const model = editor.getModel()
      if (!model) return

      const word = model.getWordAtPosition(position)
      if (!word) return

      const definition = findDefinition(word.word, model, position)
      if (definition) {
        setDefinitionInfo({
          word: word.word,
          definition,
          position
        })
        setShowPeek(true)
      }
    } catch (error) {
      console.warn('Error handling peek definition:', error)
    }
  }

  const findDefinition = (word, model, position) => {
    try {
      const text = model.getValue()
      const lines = text.split('\n')

      // Built-in definitions
      const builtInDefinitions = {
        'console': { lineNumber: 1, column: 1, description: 'Built-in console object' },
        'document': { lineNumber: 1, column: 1, description: 'Built-in document object' },
        'window': { lineNumber: 1, column: 1, description: 'Built-in window object' },
        'Array': { lineNumber: 1, column: 1, description: 'Built-in Array constructor' },
        'Object': { lineNumber: 1, column: 1, description: 'Built-in Object constructor' },
        'String': { lineNumber: 1, column: 1, description: 'Built-in String constructor' },
        'Number': { lineNumber: 1, column: 1, description: 'Built-in Number constructor' },
        'Boolean': { lineNumber: 1, column: 1, description: 'Built-in Boolean constructor' },
        'Date': { lineNumber: 1, column: 1, description: 'Built-in Date constructor' },
        'Math': { lineNumber: 1, column: 1, description: 'Built-in Math object' },
        'JSON': { lineNumber: 1, column: 1, description: 'Built-in JSON object' },
        'Promise': { lineNumber: 1, column: 1, description: 'Built-in Promise constructor' },
        'fetch': { lineNumber: 1, column: 1, description: 'Built-in fetch function' },
        'setTimeout': { lineNumber: 1, column: 1, description: 'Built-in setTimeout function' },
        'setInterval': { lineNumber: 1, column: 1, description: 'Built-in setInterval function' },
        'clearTimeout': { lineNumber: 1, column: 1, description: 'Built-in clearTimeout function' },
        'clearInterval': { lineNumber: 1, column: 1, description: 'Built-in clearInterval function' }
      }

      if (builtInDefinitions[word]) {
        return builtInDefinitions[word]
      }

      // Look for local definitions
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        
        // Function declarations
        const functionMatch = line.match(new RegExp(`(?:function\\s+${word}\\s*\\(|const\\s+${word}\\s*=\\s*(?:function|\\()|let\\s+${word}\\s*=\\s*(?:function|\\()|var\\s+${word}\\s*=\\s*(?:function|\\())`))
        if (functionMatch) {
          return {
            lineNumber: i + 1,
            column: functionMatch.index + 1,
            description: `Function: ${word}`
          }
        }

        // Variable declarations
        const varMatch = line.match(new RegExp(`(?:const|let|var)\\s+${word}\\s*=`))
        if (varMatch) {
          return {
            lineNumber: i + 1,
            column: varMatch.index + 1,
            description: `Variable: ${word}`
          }
        }

        // Class declarations
        const classMatch = line.match(new RegExp(`class\\s+${word}`))
        if (classMatch) {
          return {
            lineNumber: i + 1,
            column: classMatch.index + 1,
            description: `Class: ${word}`
          }
        }
      }

      return null
    } catch (error) {
      console.warn('Error finding definition:', error)
      return null
    }
  }

  // This component doesn't render anything visible
  return null
}

export default GoToDefinition
