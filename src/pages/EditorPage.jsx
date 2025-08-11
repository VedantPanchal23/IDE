import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from '../components/editor/CodeEditor';
import LeftSidebar from '../components/editor/LeftSidebar';
import AIAssistant from '../components/editor/AIAssistant';
import OutputPanel from '../components/editor/OutputPanel';
import MagicAIButton from '../components/editor/MagicAIButton';
import { 
  Play, 
  Square, 
  Settings, 
  Maximize2, 
  Minimize2,
  GitBranch,
  Users,
  Wifi
} from 'lucide-react';

export default function EditorLayout() {
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(350);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(null);

  // Handle resize functionality
  const handleMouseDown = (panel) => {
    setIsResizing(panel);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      if (isResizing === 'left') {
        const newWidth = Math.max(200, Math.min(500, e.clientX));
        setLeftSidebarWidth(newWidth);
      } else if (isResizing === 'right') {
        const newWidth = Math.max(250, Math.min(600, window.innerWidth - e.clientX));
        setRightSidebarWidth(newWidth);
      } else if (isResizing === 'bottom') {
        const newHeight = Math.max(150, Math.min(400, window.innerHeight - e.clientY));
        setBottomPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleAICommand = (command) => {
    console.log('AI Command:', command);
    // Handle AI command execution here
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Top Status Bar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-8 bg-[#0f0f11] border-b border-white/10 flex items-center justify-between px-4 text-xs"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400">Connected</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <GitBranch size={12} />
            <span>main</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-400">
            <Users size={12} />
            <span>2 collaborators</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-400">
            <Wifi size={12} />
            <span>AI Assistant</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Editor Area */}
      <div className="flex h-[calc(100vh-2rem)]">
        {/* Left Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ width: leftSidebarWidth }}
          className="relative bg-[#0d0d0f]/80 backdrop-blur-sm border-r border-white/10"
        >
          <LeftSidebar />
          
          {/* Left Resize Handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-[#7f5af0]/50 transition-colors group"
            onMouseDown={() => handleMouseDown('left')}
          >
            <div className="w-full h-full group-hover:bg-[#7f5af0] transition-colors" />
          </div>
        </motion.div>

        {/* Center Area */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 relative"
          >
            <CodeEditor />
            
            {/* Floating Quick Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute top-4 right-4 flex items-center space-x-2"
            >
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <Play size={16} />
                <span className="text-sm">Run</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Settings size={16} />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Bottom Panel */}
          <AnimatePresence>
            {isBottomPanelOpen && (
              <motion.div
                initial={{ y: bottomPanelHeight, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: bottomPanelHeight, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ height: bottomPanelHeight }}
                className="relative bg-[#0d0d0f]/90 backdrop-blur-sm border-t border-white/10"
              >
                <OutputPanel onClose={() => setIsBottomPanelOpen(false)} />
                
                {/* Bottom Resize Handle */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 cursor-row-resize bg-transparent hover:bg-[#7f5af0]/50 transition-colors group"
                  onMouseDown={() => handleMouseDown('bottom')}
                >
                  <div className="w-full h-full group-hover:bg-[#7f5af0] transition-colors" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - AI Assistant */}
        <AnimatePresence>
          {isAIAssistantOpen && (
            <motion.div
              initial={{ x: 350, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 350, opacity: 0 }}
              transition={{ delay: 0.3 }}
              style={{ width: rightSidebarWidth }}
              className="relative bg-[#0d0d0f]/80 backdrop-blur-sm border-l border-white/10"
            >
              <AIAssistant onClose={() => setIsAIAssistantOpen(false)} />
              
              {/* Right Resize Handle */}
              <div
                className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-[#7f5af0]/50 transition-colors group"
                onMouseDown={() => handleMouseDown('right')}
              >
                <div className="w-full h-full group-hover:bg-[#7f5af0] transition-colors" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Magic AI Button */}
      <MagicAIButton onCommandSelect={handleAICommand} />

      {/* Floating Panels Toggle */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed top-1/2 right-4 transform -translate-y-1/2 space-y-2 z-40"
      >
        {!isBottomPanelOpen && (
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsBottomPanelOpen(true)}
            className="bg-[#7f5af0]/20 backdrop-blur-sm border border-[#7f5af0]/50 rounded-lg p-2 text-[#7f5af0] hover:bg-[#7f5af0]/30 transition-colors"
            title="Show Console"
          >
            <Square size={16} />
          </motion.button>
        )}
        
        {!isAIAssistantOpen && (
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAIAssistantOpen(true)}
            className="bg-[#5eead4]/20 backdrop-blur-sm border border-[#5eead4]/50 rounded-lg p-2 text-[#5eead4] hover:bg-[#5eead4]/30 transition-colors"
            title="Show AI Assistant"
          >
            <Users size={16} />
          </motion.button>
        )}
      </motion.div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Ambient Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7f5af0]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#5eead4]/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
