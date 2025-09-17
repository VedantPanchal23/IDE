import React, { useState, useCallback } from 'react';
import TerminalPanel from './TerminalPanel';
import { Terminal, Plus, Settings, Maximize2 } from 'lucide-react';

const TerminalManager = ({ 
  isVisible = true, 
  onToggle, 
  height = 300,
  onHeightChange 
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 14,
    fontFamily: 'Cascadia Code',
    theme: 'dark',
    shell: 'cmd',
    startupCommands: [],
    autoComplete: true,
    historySize: 1000
  });

  const [terminalInstances, setTerminalInstances] = useState([]);

  const handleTerminalToggle = useCallback(() => {
    if (onToggle) {
      onToggle();
    }
  }, [onToggle]);

  const handleMaximize = useCallback(() => {
    setIsMaximized(!isMaximized);
  }, [isMaximized]);

  const createTerminalInstance = useCallback(() => {
    const newInstance = {
      id: Date.now(),
      title: `Terminal ${terminalInstances.length + 1}`,
      cwd: process.cwd || 'C:\\Users\\vedan\\Desktop\\IDE\\Studio',
      type: settings.shell,
      created: new Date(),
      lastActivity: new Date()
    };
    
    setTerminalInstances(prev => [...prev, newInstance]);
    return newInstance;
  }, [terminalInstances.length, settings.shell]);

  const closeTerminalInstance = useCallback((id) => {
    setTerminalInstances(prev => prev.filter(instance => instance.id !== id));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Common terminal commands for autocomplete
  const commonCommands = [
    // NPM Commands
    { cmd: 'npm install', category: 'npm', desc: 'Install all dependencies' },
    { cmd: 'npm install <package>', category: 'npm', desc: 'Install a specific package' },
    { cmd: 'npm start', category: 'npm', desc: 'Start the development server' },
    { cmd: 'npm run build', category: 'npm', desc: 'Build the project for production' },
    { cmd: 'npm run dev', category: 'npm', desc: 'Start development server' },
    { cmd: 'npm test', category: 'npm', desc: 'Run tests' },
    { cmd: 'npm run lint', category: 'npm', desc: 'Run linter' },
    { cmd: 'npm audit', category: 'npm', desc: 'Check for vulnerabilities' },
    { cmd: 'npm update', category: 'npm', desc: 'Update packages' },
    { cmd: 'npm outdated', category: 'npm', desc: 'Check for outdated packages' },
    
    // Git Commands
    { cmd: 'git status', category: 'git', desc: 'Show the working tree status' },
    { cmd: 'git add .', category: 'git', desc: 'Stage all changes' },
    { cmd: 'git add <file>', category: 'git', desc: 'Stage specific file' },
    { cmd: 'git commit -m "message"', category: 'git', desc: 'Commit staged changes' },
    { cmd: 'git push', category: 'git', desc: 'Push changes to remote' },
    { cmd: 'git pull', category: 'git', desc: 'Pull changes from remote' },
    { cmd: 'git branch', category: 'git', desc: 'List branches' },
    { cmd: 'git checkout <branch>', category: 'git', desc: 'Switch to branch' },
    { cmd: 'git checkout -b <branch>', category: 'git', desc: 'Create and switch to new branch' },
    { cmd: 'git merge <branch>', category: 'git', desc: 'Merge branch' },
    { cmd: 'git log', category: 'git', desc: 'Show commit history' },
    { cmd: 'git diff', category: 'git', desc: 'Show changes' },
    { cmd: 'git stash', category: 'git', desc: 'Stash changes' },
    { cmd: 'git stash pop', category: 'git', desc: 'Apply stashed changes' },
    { cmd: 'git reset --hard', category: 'git', desc: 'Reset to last commit' },
    { cmd: 'git clone <url>', category: 'git', desc: 'Clone repository' },
    
    // File System Commands (Windows)
    { cmd: 'dir', category: 'fs', desc: 'List directory contents' },
    { cmd: 'cd <path>', category: 'fs', desc: 'Change directory' },
    { cmd: 'cd..', category: 'fs', desc: 'Go up one directory' },
    { cmd: 'mkdir <name>', category: 'fs', desc: 'Create directory' },
    { cmd: 'rmdir <name>', category: 'fs', desc: 'Remove directory' },
    { cmd: 'del <file>', category: 'fs', desc: 'Delete file' },
    { cmd: 'copy <source> <dest>', category: 'fs', desc: 'Copy file' },
    { cmd: 'move <source> <dest>', category: 'fs', desc: 'Move file' },
    { cmd: 'type <file>', category: 'fs', desc: 'Display file contents' },
    { cmd: 'cls', category: 'fs', desc: 'Clear screen' },
    { cmd: 'echo <text>', category: 'fs', desc: 'Display text' },
    
    // File System Commands (Unix/Linux)
    { cmd: 'ls', category: 'fs', desc: 'List directory contents' },
    { cmd: 'ls -la', category: 'fs', desc: 'List all files with details' },
    { cmd: 'pwd', category: 'fs', desc: 'Print working directory' },
    { cmd: 'cp <source> <dest>', category: 'fs', desc: 'Copy file' },
    { cmd: 'mv <source> <dest>', category: 'fs', desc: 'Move file' },
    { cmd: 'rm <file>', category: 'fs', desc: 'Remove file' },
    { cmd: 'rm -rf <dir>', category: 'fs', desc: 'Remove directory recursively' },
    { cmd: 'cat <file>', category: 'fs', desc: 'Display file contents' },
    { cmd: 'clear', category: 'fs', desc: 'Clear screen' },
    { cmd: 'touch <file>', category: 'fs', desc: 'Create empty file' },
    { cmd: 'chmod +x <file>', category: 'fs', desc: 'Make file executable' },
    
    // Development Commands
    { cmd: 'code .', category: 'dev', desc: 'Open VS Code in current directory' },
    { cmd: 'code <file>', category: 'dev', desc: 'Open file in VS Code' },
    { cmd: 'node <file>', category: 'dev', desc: 'Run Node.js file' },
    { cmd: 'python <file>', category: 'dev', desc: 'Run Python file' },
    { cmd: 'python -m pip install <package>', category: 'dev', desc: 'Install Python package' },
    { cmd: 'pip install <package>', category: 'dev', desc: 'Install Python package' },
    { cmd: 'pip list', category: 'dev', desc: 'List installed Python packages' },
    { cmd: 'python -m venv <name>', category: 'dev', desc: 'Create virtual environment' },
    
    // System Commands
    { cmd: 'tasklist', category: 'system', desc: 'List running processes (Windows)' },
    { cmd: 'taskkill /im <process>', category: 'system', desc: 'Kill process (Windows)' },
    { cmd: 'ps aux', category: 'system', desc: 'List running processes (Unix)' },
    { cmd: 'kill <pid>', category: 'system', desc: 'Kill process (Unix)' },
    { cmd: 'systeminfo', category: 'system', desc: 'Display system information (Windows)' },
    { cmd: 'uname -a', category: 'system', desc: 'Display system information (Unix)' },
    { cmd: 'ipconfig', category: 'system', desc: 'Display network configuration (Windows)' },
    { cmd: 'ifconfig', category: 'system', desc: 'Display network configuration (Unix)' },
    { cmd: 'ping <host>', category: 'system', desc: 'Ping a host' },
    { cmd: 'netstat -an', category: 'system', desc: 'Display network connections' },
    
    // Package Managers
    { cmd: 'yarn install', category: 'yarn', desc: 'Install dependencies with Yarn' },
    { cmd: 'yarn start', category: 'yarn', desc: 'Start development server with Yarn' },
    { cmd: 'yarn build', category: 'yarn', desc: 'Build project with Yarn' },
    { cmd: 'yarn add <package>', category: 'yarn', desc: 'Add package with Yarn' },
    { cmd: 'pnpm install', category: 'pnpm', desc: 'Install dependencies with pnpm' },
    { cmd: 'pnpm start', category: 'pnpm', desc: 'Start development server with pnpm' },
    { cmd: 'pnpm build', category: 'pnpm', desc: 'Build project with pnpm' },
    { cmd: 'pnpm add <package>', category: 'pnpm', desc: 'Add package with pnpm' }
  ];

  const getCommandsByCategory = (category) => {
    return commonCommands.filter(cmd => cmd.category === category);
  };

  const searchCommands = (query) => {
    return commonCommands.filter(cmd => 
      cmd.cmd.toLowerCase().includes(query.toLowerCase()) ||
      cmd.desc.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <div className="terminal-manager">
      {isVisible && (
        <TerminalPanel
          isOpen={isVisible}
          onToggle={handleTerminalToggle}
          height={isMaximized ? '100vh' : height}
          onHeightChange={onHeightChange}
          settings={settings}
          commonCommands={commonCommands}
          onMaximize={handleMaximize}
          isMaximized={isMaximized}
          onSettingsChange={updateSettings}
        />
      )}
    </div>
  );
};

export default TerminalManager;
