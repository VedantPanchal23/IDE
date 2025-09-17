import React, { useState, useEffect } from 'react'

const GoToDefinition = ({ editor, language }) => {
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

  useEffect(() => {
    if (!editor || !window.monaco) {
      return
    }

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
          console.warn('Error with go to definition:', error)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    
    const editorDomNode = editor.getDomNode?.()
    if (editorDomNode) {
      editorDomNode.addEventListener('click', handleClick)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      
      if (editorDomNode) {
        editorDomNode.removeEventListener('click', handleClick)
      }
    }
  }, [editor, isCtrlPressed])

  const handleGoToDefinition = (position) => {
    if (!editor || editor.isDisposed?.()) return

    try {
      const model = editor.getModel()
      if (!model) return

      const word = model.getWordAtPosition(position)
      if (!word) return

      const definition = findDefinition(word.word, model)
      if (definition) {
        editor.setPosition(definition)
        editor.revealLineInCenter(definition.lineNumber)
      }
    } catch (error) {
      console.warn('Error handling go to definition:', error)
    }
  }

  const findDefinition = (word, model) => {
    try {
      const text = model.getValue()
      const lines = text.split('\n')

      // Built-in definitions
      const builtInDefinitions = {
        'console': { lineNumber: 1, column: 1 },
        'document': { lineNumber: 1, column: 1 },
        'window': { lineNumber: 1, column: 1 },
        'Array': { lineNumber: 1, column: 1 },
        'Object': { lineNumber: 1, column: 1 },
        'String': { lineNumber: 1, column: 1 },
        'Number': { lineNumber: 1, column: 1 },
        'Boolean': { lineNumber: 1, column: 1 },
        'Date': { lineNumber: 1, column: 1 },
        'Math': { lineNumber: 1, column: 1 },
        'JSON': { lineNumber: 1, column: 1 },
        'Promise': { lineNumber: 1, column: 1 },
        'fetch': { lineNumber: 1, column: 1 },
        'setTimeout': { lineNumber: 1, column: 1 },
        'setInterval': { lineNumber: 1, column: 1 }
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
            column: functionMatch.index + 1
          }
        }

        // Variable declarations
        const varMatch = line.match(new RegExp(`(?:const|let|var)\\s+${word}\\s*=`))
        if (varMatch) {
          return {
            lineNumber: i + 1,
            column: varMatch.index + 1
          }
        }

        // Class declarations
        const classMatch = line.match(new RegExp(`class\\s+${word}`))
        if (classMatch) {
          return {
            lineNumber: i + 1,
            column: classMatch.index + 1
          }
        }
      }

      return null
    } catch (error) {
      console.warn('Error finding definition:', error)
      return null
    }
  }

  return null
}

export default GoToDefinition
