import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown,
  Terminal,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function OutputPanel({ isOpen, onToggle }) {
  const [activeTab, setActiveTab] = useState('console');
  const [logs, setLogs] = useState([
    { id: 1, type: 'info', message: 'Server started on port 3000', timestamp: '10:30:15' },
    { id: 2, type: 'success', message: 'Build completed successfully', timestamp: '10:30:18' },
    { id: 3, type: 'warning', message: 'Unused variable "temp" in App.jsx:15', timestamp: '10:30:20' },
    { id: 4, type: 'error', message: 'TypeError: Cannot read property "map" of undefined', timestamp: '10:30:22' },
  ]);

  const tabs = [
    { id: 'console', label: 'Console', count: logs.length },
    { id: 'terminal', label: 'Terminal', count: 0 },
    { id: 'problems', label: 'Problems', count: 2 },
    { id: 'output', label: 'Output', count: 0 },
  ];

  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return <XCircle size={14} className="text-red-400" />;
      case 'warning': return <AlertCircle size={14} className="text-yellow-400" />;
      case 'success': return <CheckCircle size={14} className="text-green-400" />;
      default: return <Terminal size={14} className="text-blue-400" />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-300';
      case 'warning': return 'text-yellow-300';
      case 'success': return 'text-green-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 250, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-[#0f0f11]/80 backdrop-blur-md border-t border-white/10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#0f0f11]/50 border-b border-white/10">
            <div className="flex">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10 border-b-2 border-[#7f5af0]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-[#7f5af0] text-white text-xs px-1.5 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="flex items-center space-x-2 px-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-white transition-colors"
                title="Clear"
              >
                <RotateCcw size={16} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                className="text-gray-400 hover:text-white transition-colors"
                title={isOpen ? "Minimize" : "Maximize"}
              >
                <ChevronDown size={16} />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'console' && (
              <div className="p-4 space-y-2 font-mono text-sm">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start space-x-3 py-1"
                  >
                    <span className="text-gray-500 text-xs mt-0.5">{log.timestamp}</span>
                    {getLogIcon(log.type)}
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'terminal' && (
              <div className="p-4 font-mono text-sm">
                <div className="text-[#5eead4]">~/my-ai-ide $</div>
                <div className="text-gray-400 mt-2">Ready for commands...</div>
              </div>
            )}

            {activeTab === 'problems' && (
              <div className="p-4 space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <XCircle size={16} className="text-red-400 mt-0.5" />
                  <div>
                    <div className="text-red-300 text-sm font-medium">TypeError in App.jsx</div>
                    <div className="text-gray-400 text-xs mt-1">Line 15: Cannot read property 'map' of undefined</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  delay={0.1}
                  className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                >
                  <AlertCircle size={16} className="text-yellow-400 mt-0.5" />
                  <div>
                    <div className="text-yellow-300 text-sm font-medium">Unused variable</div>
                    <div className="text-gray-400 text-xs mt-1">Line 8: Variable 'temp' is declared but never used</div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'output' && (
              <div className="p-4 font-mono text-sm">
                <div className="text-gray-400">No output to display</div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
