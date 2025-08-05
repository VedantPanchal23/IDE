import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  X, 
  Minimize2, 
  Maximize2,
  Code,
  Lightbulb,
  Bug
} from 'lucide-react';

export default function AIAssistant({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hi! I'm your AI coding assistant. I can help you:\n\n• Generate code snippets\n• Debug errors\n• Explain concepts\n• Optimize performance\n\nWhat would you like to work on?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { icon: Code, text: "Generate a React component", color: "#7f5af0" },
    { icon: Bug, text: "Help debug this error", color: "#ff6b6b" },
    { icon: Lightbulb, text: "Optimize this code", color: "#5eead4" },
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I understand you want help with: "${inputValue}"\n\nHere's a code example:\n\n\`\`\`jsx\nfunction ExampleComponent() {\n  const [state, setState] = useState(null);\n  \n  return (\n    <div className="example">\n      <h1>Hello World!</h1>\n    </div>\n  );\n}\n\`\`\`\n\nWould you like me to explain any part of this code?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content) => {
    // Basic markdown-like formatting
    return content.split('\n').map((line, index) => {
      if (line.startsWith('```') && line.endsWith('```')) {
        const code = line.slice(3, -3);
        return (
          <div key={index} className="bg-[#0f0f11] rounded p-3 my-2 font-mono text-sm border border-white/10">
            <pre className="text-[#5eead4] whitespace-pre-wrap">{code}</pre>
          </div>
        );
      } else if (line.includes('```')) {
        const parts = line.split('```');
        return (
          <div key={index} className="my-1">
            {parts.map((part, i) => 
              i % 2 === 0 ? 
                <span key={i}>{part}</span> : 
                <code key={i} className="bg-[#7f5af0]/20 px-1 rounded text-[#5eead4]">{part}</code>
            )}
          </div>
        );
      } else if (line.startsWith('•')) {
        return <div key={index} className="ml-4 text-gray-300">{line}</div>;
      } else {
        return <div key={index} className="my-1">{line}</div>;
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: isMinimized ? 60 : 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-[#0f0f11]/80 backdrop-blur-md border-l border-white/10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            {!isMinimized && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#5eead4] rounded-full animate-pulse" />
                  <h3 className="text-white font-medium">AI Assistant</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMinimized(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Minimize2 size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onToggle}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              </>
            )}
            
            {isMinimized && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMinimized(false)}
                className="w-full flex justify-center text-[#7f5af0]"
              >
                <MessageCircle size={24} />
              </motion.button>
            )}
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-[#7f5af0] to-[#5eead4] text-white'
                        : 'bg-white/5 backdrop-blur-sm text-gray-200 border border-white/10'
                    }`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles size={16} className="text-[#5eead4]" />
                          <span className="text-xs text-gray-400">AI Assistant</span>
                        </div>
                      )}
                      <div className="text-sm">
                        {formatMessage(message.content)}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#7f5af0] rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-[#7f5af0] rounded-full animate-bounce delay-75" />
                          <div className="w-2 h-2 bg-[#7f5af0] rounded-full animate-bounce delay-150" />
                        </div>
                        <span className="text-xs text-gray-400">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-4 py-2 border-t border-white/10">
                <div className="flex space-x-2">
                  {quickPrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setInputValue(prompt.text)}
                      className="flex items-center space-x-1 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-gray-300 transition-colors border border-white/10"
                      style={{ borderColor: prompt.color + '40' }}
                    >
                      <prompt.icon size={12} style={{ color: prompt.color }} />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#7f5af0] transition-colors"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-[#7f5af0] to-[#5eead4] text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
