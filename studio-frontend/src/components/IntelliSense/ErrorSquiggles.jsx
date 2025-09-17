import React, { useEffect, useState } from 'react'
import { AlertTriangle, XCircle, Info, Lightbulb, CheckCircle } from 'lucide-react'
import './ErrorSquiggles.css'

const ErrorSquiggles = ({ editor, language, onErrorsChange }) => {
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (!editor) return

    const model = editor.getModel()
    if (!model) return

    // Set up real-time error checking
    const disposable = model.onDidChangeContent(() => {
      debounceAnalysis()
    })

    // Initial analysis
    performAnalysis()

    return () => disposable.dispose()
  }, [editor, language])

  const debounceAnalysis = (() => {
    let timeout
    return () => {
      clearTimeout(timeout)
      timeout = setTimeout(performAnalysis, 500)
    }
  })()

  const performAnalysis = async () => {
    if (!editor) return

    setIsAnalyzing(true)
    const model = editor.getModel()
    if (!model) return

    const content = model.getValue()
    const analysisResult = analyzeCode(content, language)
    
    // Apply markers to Monaco editor
    const monaco = window.monaco
    if (monaco) {
      const markers = [
        ...analysisResult.errors.map(error => ({
          severity: monaco.MarkerSeverity.Error,
          message: error.message,
          startLineNumber: error.line,
          startColumn: error.column,
          endLineNumber: error.endLine || error.line,
          endColumn: error.endColumn || (error.column + (error.length || 1)),
          code: error.code,
          source: error.source || 'IntelliSense'
        })),
        ...analysisResult.warnings.map(warning => ({
          severity: monaco.MarkerSeverity.Warning,
          message: warning.message,
          startLineNumber: warning.line,
          startColumn: warning.column,
          endLineNumber: warning.endLine || warning.line,
          endColumn: warning.endColumn || (warning.column + (warning.length || 1)),
          code: warning.code,
          source: warning.source || 'IntelliSense'
        })),
        ...analysisResult.suggestions.map(suggestion => ({
          severity: monaco.MarkerSeverity.Info,
          message: suggestion.message,
          startLineNumber: suggestion.line,
          startColumn: suggestion.column,
          endLineNumber: suggestion.endLine || suggestion.line,
          endColumn: suggestion.endColumn || (suggestion.column + (suggestion.length || 1)),
          code: suggestion.code,
          source: suggestion.source || 'IntelliSense'
        }))
      ]

      monaco.editor.setModelMarkers(model, 'javascript', markers)
    }

    setErrors(analysisResult.errors)
    setWarnings(analysisResult.warnings)
    setSuggestions(analysisResult.suggestions)
    setIsAnalyzing(false)

    // Notify parent component
    if (onErrorsChange) {
      onErrorsChange({
        errors: analysisResult.errors,
        warnings: analysisResult.warnings,
        suggestions: analysisResult.suggestions
      })
    }
  }

  const analyzeCode = (content, language) => {
    const errors = []
    const warnings = []
    const suggestions = []
    const lines = content.split('\n')

    if (language === 'javascript' || language === 'typescript') {
      analyzeJavaScript(lines, errors, warnings, suggestions)
    } else if (language === 'json') {
      analyzeJSON(content, errors, warnings, suggestions)
    } else if (language === 'css') {
      analyzeCSS(lines, errors, warnings, suggestions)
    }

    return { errors, warnings, suggestions }
  }

  const analyzeJavaScript = (lines, errors, warnings, suggestions) => {
    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const trimmedLine = line.trim()

      // Skip comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        return
      }

      // Syntax errors
      checkSyntaxErrors(line, lineNumber, errors)
      
      // Code quality warnings
      checkCodeQuality(line, lineNumber, warnings)
      
      // Suggestions for improvements
      checkSuggestions(line, lineNumber, suggestions)
    })
  }

  const checkSyntaxErrors = (line, lineNumber, errors) => {
    // Unmatched parentheses
    const openParens = (line.match(/\(/g) || []).length
    const closeParens = (line.match(/\)/g) || []).length
    if (openParens > closeParens) {
      errors.push({
        line: lineNumber,
        column: line.lastIndexOf('(') + 1,
        length: 1,
        message: 'Missing closing parenthesis',
        code: 'missing-paren',
        severity: 'error'
      })
    } else if (closeParens > openParens) {
      errors.push({
        line: lineNumber,
        column: line.indexOf(')') + 1,
        length: 1,
        message: 'Unexpected closing parenthesis',
        code: 'unexpected-paren',
        severity: 'error'
      })
    }

    // Unmatched brackets
    const openBrackets = (line.match(/\[/g) || []).length
    const closeBrackets = (line.match(/\]/g) || []).length
    if (openBrackets !== closeBrackets) {
      errors.push({
        line: lineNumber,
        column: 1,
        length: line.length,
        message: 'Unmatched square brackets',
        code: 'unmatched-brackets',
        severity: 'error'
      })
    }

    // Unmatched braces
    const openBraces = (line.match(/\{/g) || []).length
    const closeBraces = (line.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push({
        line: lineNumber,
        column: 1,
        length: line.length,
        message: 'Unmatched curly braces',
        code: 'unmatched-braces',
        severity: 'error'
      })
    }

    // Invalid variable names
    const invalidVarMatch = line.match(/(?:var|let|const)\s+([0-9]\w*)/g)
    if (invalidVarMatch) {
      errors.push({
        line: lineNumber,
        column: line.indexOf(invalidVarMatch[0]) + 1,
        length: invalidVarMatch[0].length,
        message: 'Variable names cannot start with a number',
        code: 'invalid-var-name',
        severity: 'error'
      })
    }

    // Missing quotes
    const stringMatch = line.match(/(['"])[^'"]*$/g)
    if (stringMatch && !line.includes('//')) {
      errors.push({
        line: lineNumber,
        column: line.indexOf(stringMatch[0]) + 1,
        length: stringMatch[0].length,
        message: 'Unterminated string literal',
        code: 'unterminated-string',
        severity: 'error'
      })
    }
  }

  const checkCodeQuality = (line, lineNumber, warnings) => {
    // Missing semicolons
    if (line.trim() && 
        !line.trim().endsWith(';') && 
        !line.trim().endsWith('{') && 
        !line.trim().endsWith('}') &&
        !line.trim().startsWith('//') &&
        !line.includes('if') &&
        !line.includes('for') &&
        !line.includes('while') &&
        !line.includes('function') &&
        !line.includes('class') &&
        line.match(/^\s*(const|let|var|return)\s+/)) {
      warnings.push({
        line: lineNumber,
        column: line.length,
        length: 1,
        message: 'Missing semicolon',
        code: 'missing-semicolon',
        severity: 'warning'
      })
    }

    // Unused variables (basic check)
    const varDeclaration = line.match(/(?:const|let|var)\s+(\w+)\s*=/)
    if (varDeclaration) {
      const varName = varDeclaration[1]
      // This is a simplified check - real implementation would track usage
      if (varName.startsWith('unused')) {
        warnings.push({
          line: lineNumber,
          column: line.indexOf(varName) + 1,
          length: varName.length,
          message: `'${varName}' is assigned but never used`,
          code: 'unused-variable',
          severity: 'warning'
        })
      }
    }

    // Use of var instead of let/const
    if (line.includes('var ') && !line.includes('//')) {
      warnings.push({
        line: lineNumber,
        column: line.indexOf('var') + 1,
        length: 3,
        message: 'Prefer const or let over var',
        code: 'prefer-const-let',
        severity: 'warning'
      })
    }

    // Double equals instead of triple equals
    if (line.includes('==') && !line.includes('===') && !line.includes('!==')) {
      warnings.push({
        line: lineNumber,
        column: line.indexOf('==') + 1,
        length: 2,
        message: 'Use === instead of ==',
        code: 'prefer-strict-equality',
        severity: 'warning'
      })
    }

    // Console.log in production code
    if (line.includes('console.log') && !line.includes('//')) {
      warnings.push({
        line: lineNumber,
        column: line.indexOf('console.log') + 1,
        length: 11,
        message: 'Remove console.log before production',
        code: 'no-console',
        severity: 'warning'
      })
    }
  }

  const checkSuggestions = (line, lineNumber, suggestions) => {
    // Suggest arrow functions
    if (line.includes('function(') && !line.includes('//')) {
      suggestions.push({
        line: lineNumber,
        column: line.indexOf('function') + 1,
        length: 8,
        message: 'Consider using arrow function',
        code: 'prefer-arrow-function',
        severity: 'info'
      })
    }

    // Suggest template literals
    if (line.match(/['"][^'"]*\+[^'"]*['"]/) && !line.includes('//')) {
      suggestions.push({
        line: lineNumber,
        column: 1,
        length: line.length,
        message: 'Consider using template literals',
        code: 'prefer-template-literal',
        severity: 'info'
      })
    }

    // Suggest destructuring
    if (line.match(/const\s+\w+\s*=\s*\w+\.\w+/) && !line.includes('//')) {
      suggestions.push({
        line: lineNumber,
        column: 1,
        length: line.length,
        message: 'Consider using destructuring assignment',
        code: 'prefer-destructuring',
        severity: 'info'
      })
    }

    // Suggest optional chaining
    if (line.includes(' && ') && line.includes('.')) {
      suggestions.push({
        line: lineNumber,
        column: 1,
        length: line.length,
        message: 'Consider using optional chaining (?.)',
        code: 'prefer-optional-chaining',
        severity: 'info'
      })
    }
  }

  const analyzeJSON = (content, errors, warnings, suggestions) => {
    try {
      JSON.parse(content)
    } catch (error) {
      const lines = content.split('\n')
      let lineNumber = 1
      let columnNumber = 1

      // Try to extract line/column from error message
      const match = error.message.match(/line (\d+) column (\d+)/)
      if (match) {
        lineNumber = parseInt(match[1])
        columnNumber = parseInt(match[2])
      }

      errors.push({
        line: lineNumber,
        column: columnNumber,
        length: 1,
        message: `JSON syntax error: ${error.message}`,
        code: 'json-syntax-error',
        severity: 'error'
      })
    }
  }

  const analyzeCSS = (lines, errors, warnings, suggestions) => {
    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const trimmedLine = line.trim()

      if (!trimmedLine || trimmedLine.startsWith('/*')) {
        return
      }

      // Missing semicolons in CSS
      if (trimmedLine.includes(':') && 
          !trimmedLine.endsWith(';') && 
          !trimmedLine.endsWith('{') && 
          !trimmedLine.endsWith('}')) {
        warnings.push({
          line: lineNumber,
          column: line.length,
          length: 1,
          message: 'Missing semicolon in CSS property',
          code: 'css-missing-semicolon',
          severity: 'warning'
        })
      }

      // Unknown CSS properties (basic check)
      const propertyMatch = trimmedLine.match(/^([a-z-]+):\s*/)
      if (propertyMatch) {
        const property = propertyMatch[1]
        const invalidProperties = ['colr', 'widht', 'heigth', 'backgrond']
        if (invalidProperties.includes(property)) {
          errors.push({
            line: lineNumber,
            column: line.indexOf(property) + 1,
            length: property.length,
            message: `Unknown CSS property: ${property}`,
            code: 'unknown-css-property',
            severity: 'error'
          })
        }
      }
    })
  }

  // This component doesn't render anything visible
  return null
}

export default ErrorSquiggles
