import React from 'react'

class IntelliSenseErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('IntelliSense component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return null // Silently fail for IntelliSense components
    }

    return this.props.children
  }
}

export default IntelliSenseErrorBoundary
