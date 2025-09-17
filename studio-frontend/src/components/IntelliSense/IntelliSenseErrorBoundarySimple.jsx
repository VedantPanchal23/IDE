import React from 'react'

class IntelliSenseErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('IntelliSense Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return null // Silent fail instead of breaking the app
    }

    return this.props.children
  }
}

export default IntelliSenseErrorBoundary
