import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import './AIAssistant.css'

const AIAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help you with:\n\n• Code completion and suggestions\n• Debugging and error analysis\n• Code optimization tips\n• Explaining complex concepts\n• Generating boilerplate code\n\nWhat would you like help with today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Simulate AI response (replace with actual AI API call)
      const response = await simulateAIResponse(inputMessage)
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAIResponse = async (message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('react')) {
      return `Great question about React! Here are some key concepts:

**Components**: Building blocks of React apps
\`\`\`jsx
function MyComponent() {
  return <div>Hello World!</div>
}
\`\`\`

**Hooks**: Functions that let you use state and lifecycle
\`\`\`jsx
const [count, setCount] = useState(0)
useEffect(() => {
  // Side effects here
}, [])
\`\`\`

**Props**: Data passed to components
\`\`\`jsx
<MyComponent name="John" age={25} />
\`\`\``
    } else if (lowerMessage.includes('debug') || lowerMessage.includes('error')) {
      return `Here are some debugging strategies:

🐛 **Common debugging techniques:**
• Use \`console.log()\` to inspect values
• Check the browser's developer tools
• Use React DevTools extension
• Add breakpoints in your code
• Verify props and state values

**Example debugging:**
\`\`\`jsx
const [data, setData] = useState([])

// Debug: Check what data looks like
console.log('Current data:', data)
\`\`\``
    } else if (lowerMessage.includes('optimize') || lowerMessage.includes('performance')) {
      return `🚀 **Performance optimization tips:**

• Use \`React.memo()\` for components that don't change often
• Implement proper key props in lists
• Use \`useMemo()\` for expensive calculations
• Use \`useCallback()\` for stable function references
• Code splitting with \`React.lazy()\`

**Example:**
\`\`\`jsx
const ExpensiveComponent = React.memo(({ data }) => {
  const expensiveValue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0)
  }, [data])
  
  return <div>{expensiveValue}</div>
})
\`\`\``
    } else if (lowerMessage.includes('css') || lowerMessage.includes('style')) {
      return `🎨 **CSS and Styling tips:**

• Use CSS Grid and Flexbox for layouts
• Consider CSS-in-JS libraries like styled-components
• Use CSS custom properties (variables)
• Mobile-first responsive design

**Example with CSS Grid:**
\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  gap: 20px;
}
\`\`\``
    } else {
      return `I'm here to help with your coding questions! You can ask me about:

• **React concepts** - components, hooks, state management
• **JavaScript fundamentals** - ES6+, async/await, promises
• **CSS styling** - flexbox, grid, animations
• **Debugging techniques** - finding and fixing errors
• **Performance optimization** - making your code faster
• **Best practices** - clean code principles

Feel free to ask specific questions or request code examples!`
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="ai-assistant-overlay">
      <div className="ai-assistant">
        <div className="ai-assistant-header">
          <div className="ai-assistant-title">
            <Sparkles size={16} />
            <span>AI Assistant</span>
          </div>
          <button className="ai-assistant-close" onClick={onClose}>×</button>
        </div>

        <div className="ai-assistant-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="message-content">
                <pre>{message.content}</pre>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="ai-assistant-input">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about coding..."
            rows="3"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
