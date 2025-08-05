import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { X, Play, Save, Upload } from 'lucide-react';

export default function CodeEditor() {
  const [files, setFiles] = useState([
    { id: 1, name: 'App.jsx', language: 'javascript', content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World!</h1>\n    </div>\n  );\n}\n\nexport default App;`, active: true },
    { id: 2, name: 'styles.css', language: 'css', content: `.App {\n  text-align: center;\n  padding: 20px;\n}\n\nh1 {\n  color: #7f5af0;\n  font-family: 'Inter', sans-serif;\n}`, active: false },
  ]);

  const [activeFile, setActiveFile] = useState(files.find(f => f.active));
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure Monaco theme
    monaco.editor.defineTheme('cyberpunk', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: '7f5af0' },
        { token: 'string', foreground: '5eead4' },
        { token: 'number', foreground: 'ff79c6' },
        { token: 'function', foreground: '50fa7b' },
      ],
      colors: {
        'editor.background': '#0f0f11',
        'editor.foreground': '#f8f8f2',
        'editor.lineHighlightBackground': '#1e1e24',
        'editor.selectionBackground': '#7f5af0',
        'editorCursor.foreground': '#5eead4',
      }
    });
    
    monaco.editor.setTheme('cyberpunk');
  };

  const switchFile = (file) => {
    setFiles(prev => prev.map(f => ({ ...f, active: f.id === file.id })));
    setActiveFile(file);
  };

  const closeFile = (fileId) => {
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    
    if (activeFile.id === fileId && newFiles.length > 0) {
      const newActive = newFiles[0];
      setActiveFile(newActive);
      setFiles(prev => prev.map(f => ({ ...f, active: f.id === newActive.id })));
    }
  };

  const handleCodeChange = (value) => {
    setFiles(prev => prev.map(f => 
      f.id === activeFile.id ? { ...f, content: value } : f
    ));
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-[#0f0f11] to-[#1e1e24] relative">
      {/* Floating Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 z-20"
      >
        <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#7f5af0] to-[#5eead4] text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <Play size={16} />
            <span>Run</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <Save size={16} />
            <span>Save</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <Upload size={16} />
            <span>Deploy</span>
          </motion.button>
        </div>
      </motion.div>

      {/* File Tabs */}
      <div className="flex items-center bg-[#0f0f11]/50 backdrop-blur-sm border-b border-white/10">
        <div className="flex overflow-x-auto">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center space-x-2 px-4 py-3 border-r border-white/10 cursor-pointer transition-colors group ${
                file.active
                  ? 'bg-gradient-to-r from-[#7f5af0]/20 to-[#5eead4]/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => switchFile(file)}
            >
              <span className="text-sm font-medium">{file.name}</span>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
              >
                <X size={14} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={activeFile?.language || 'javascript'}
          value={activeFile?.content || ''}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            theme: 'cyberpunk',
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            lineNumbers: 'on',
            wordWrap: 'on',
            minimap: { enabled: true, scale: 0.5 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            smoothScrolling: true,
          }}
        />
        
        {/* Glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#7f5af0]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#5eead4]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>
    </div>
  );
}
