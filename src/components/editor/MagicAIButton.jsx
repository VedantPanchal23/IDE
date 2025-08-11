import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Command,
  Code,
  FileText,
  Bug,
  Lightbulb,
  Zap,
  X
} from 'lucide-react';

export default function MagicAIButton({ onCommandSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const commands = [
    {
      id: 'generate-component',
      title: 'Generate React Component',
      description: 'Create a new React component with props and state',
      icon: Code,
      color: '#7f5af0',
      category: 'Generate'
    },
    {
      id: 'fix-error',
      title: 'Fix This Error',
      description: 'Analyze and fix the current error in your code',
      icon: Bug,
      color: '#ff6b6b',
      category: 'Debug'
    },
    {
      id: 'optimize-code',
      title: 'Optimize Code',
      description: 'Improve performance and clean up your code',
      icon: Zap,
      color: '#5eead4',
      category: 'Optimize'
    },
    {
      id: 'add-comments',
      title: 'Add Documentation',
      description: 'Generate comments and documentation for your code',
      icon: FileText,
      color: '#fbbf24',
      category: 'Document'
    },
    {
      id: 'suggest-improvement',
      title: 'Suggest Improvements',
      description: 'Get AI suggestions for better code structure',
      icon: Lightbulb,
      color: '#f59e0b',
      category: 'Improve'
    },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCommandClick = (command) => {
    onCommandSelect?.(command);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      {/* Magic AI Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="relative group"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#7f5af0] to-[#5eead4] rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse" />
          
          {/* Button */}
          <div className="relative bg-gradient-to-r from-[#7f5af0] to-[#5eead4] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl">
            <Sparkles size={24} className="text-white" />
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                animate={{
                  x: [0, Math.random() * 40 - 20],
                  y: [0, Math.random() * 40 - 20],
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeOut'
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </div>
        </motion.button>
      </motion.div>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f11]/90 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-[#7f5af0] to-[#5eead4] w-8 h-8 rounded-lg flex items-center justify-center">
                    <Command size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">AI Command Palette</h2>
                    <p className="text-gray-400 text-sm">What would you like to do?</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Command size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search commands..."
                    className="w-full bg-white/5 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#7f5af0] transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {/* Commands */}
              <div className="max-h-96 overflow-y-auto">
                {filteredCommands.length > 0 ? (
                  <div className="p-2">
                    {filteredCommands.map((command, index) => (
                      <motion.button
                        key={command.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => handleCommandClick(command)}
                        className="w-full flex items-center space-x-4 p-4 rounded-lg text-left transition-colors group"
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{ backgroundColor: command.color + '20', border: `1px solid ${command.color}40` }}
                        >
                          <command.icon size={20} style={{ color: command.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium group-hover:text-[#5eead4] transition-colors">
                            {command.title}
                          </div>
                          <div className="text-gray-400 text-sm mt-1">
                            {command.description}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                          {command.category}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-2">No commands found</div>
                    <div className="text-gray-500 text-sm">Try a different search term</div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>Press ESC to close</div>
                  <div>AI-powered coding assistant</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
