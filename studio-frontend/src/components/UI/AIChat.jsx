import React, { useState, useRef, useEffect } from 'react'
import { X, Maximize2, Minimize2, RotateCcw, Send, Bot, User } from 'lucide-react'
import './AIChat.css'

const AIChat = ({ 
  isOpen, 
  onClose, 
  onSendMessage, 
  messages = [],
  isLoading = false 
}) => {
  const [input, setInput] = useState('')
  const [isMaximized, setIsMaximized] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!isOpen) return null

  return (
    <div className={`ai-chat ${isMaximized ? 'maximized' : ''}`}>
      <div className="ai-chat-header">
        <div className="header-left">
          <Bot size={16} />
          <span>AI Assistant</span>
        </div>
        
        <div className="header-actions">
          <button 
            className="header-btn"
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          
          <button 
            className="header-btn"
            onClick={() => onSendMessage('clear')}
            title="Clear chat"
          >
            <RotateCcw size={14} />
          </button>
          
          <button 
            className="header-btn close-btn"
            onClick={onClose}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="ai-chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <Bot size={24} />
            <h3>AI Assistant</h3>
            <p>Ask me anything about your code, get explanations, generate snippets, or just chat!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-avatar">
                {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className="message-content">
                <pre className="message-text">{message.content}</pre>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message ai-message">
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
      
      <form className="ai-chat-input" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything... (Shift+Enter for new line)"
          rows={1}
          className="input-field"
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          className="send-btn"
          disabled={!input.trim() || isLoading}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}

export default AIChat
