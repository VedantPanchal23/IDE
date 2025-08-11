import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, 
  FileText, 
  Terminal, 
  Settings, 
  Search,
  GitBranch,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export default function LeftSidebar({ isOpen, onToggle }) {
  const [activeTab, setActiveTab] = useState('files');
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src']));

  const tabs = [
    { id: 'files', icon: FolderOpen, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'git', icon: GitBranch, label: 'Source Control' },
    { id: 'terminal', icon: Terminal, label: 'Terminal' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const fileTree = {
    name: 'my-ai-ide',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'App.jsx', type: 'file', language: 'javascript' },
          { name: 'main.jsx', type: 'file', language: 'javascript' },
          { name: 'index.css', type: 'file', language: 'css' },
          {
            name: 'components',
            type: 'folder',
            children: [
              { name: 'Header.jsx', type: 'file', language: 'javascript' },
              { name: 'Sidebar.jsx', type: 'file', language: 'javascript' },
              { name: 'CodeEditor.jsx', type: 'file', language: 'javascript' },
            ]
          }
        ]
      },
      { name: 'package.json', type: 'file', language: 'json' },
      { name: 'vite.config.js', type: 'file', language: 'javascript' },
      { name: 'README.md', type: 'file', language: 'markdown' },
    ]
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  const renderFileTree = (node, level = 0) => {
    const isExpanded = expandedFolders.has(node.name);
    
    return (
      <div key={node.name}>
        <motion.div
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          className={`flex items-center space-x-2 py-1 px-2 cursor-pointer rounded transition-colors`}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => node.type === 'folder' && toggleFolder(node.name)}
        >
          {node.type === 'folder' && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-gray-400" />
            </motion.div>
          )}
          
          {node.type === 'folder' ? (
            <FolderOpen size={16} className="text-[#5eead4]" />
          ) : (
            <FileText size={16} className="text-gray-400" />
          )}
          
          <span className="text-sm text-gray-300 select-none">{node.name}</span>
        </motion.div>
        
        <AnimatePresence>
          {node.type === 'folder' && isExpanded && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {node.children.map(child => renderFileTree(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-[#0f0f11]/80 backdrop-blur-md border-r border-white/10 flex flex-col overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center p-3 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-b from-[#7f5af0]/20 to-transparent border-b-2 border-[#7f5af0]'
                    : 'text-gray-400 hover:text-white'
                }`}
                title={tab.label}
              >
                <tab.icon size={18} />
              </motion.button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'files' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3"
              >
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                  Explorer
                </div>
                {renderFileTree(fileTree)}
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3"
              >
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                  Search
                </div>
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#7f5af0] transition-colors"
                />
              </motion.div>
            )}

            {activeTab === 'git' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3"
              >
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                  Source Control
                </div>
                <div className="text-sm text-gray-300">
                  <div className="mb-2">• main branch</div>
                  <div className="mb-2">• 3 changes</div>
                  <div className="text-xs text-gray-500">No commits yet</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'terminal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3"
              >
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                  Terminal
                </div>
                <div className="bg-black/40 rounded p-3 font-mono text-sm">
                  <div className="text-[#5eead4]">$ npm run dev</div>
                  <div className="text-gray-400 mt-1">Server running on port 3000</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3"
              >
                <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                  Settings
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Theme</span>
                    <span className="text-[#7f5af0]">Cyberpunk</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Font Size</span>
                    <span className="text-gray-400">14px</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Auto Save</span>
                    <span className="text-[#5eead4]">On</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
