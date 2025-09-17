import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Plus, X, Search, Maximize2, Minimize2, Settings, Copy, ExternalLink, ChevronDown } from 'lucide-react';
import './TerminalPanel.css';

const TerminalPanel = ({ 
  isOpen, 
  onToggle, 
  height = 300, 
  onHeightChange,
  settings,
  commonCommands,
  onMaximize,
  isMaximized,
  onSettingsChange
}) => {
  const [terminals, setTerminals] = useState([
    {
      id: 1,
      title: 'Terminal 1',
      cwd: 'C:\\Users\\vedan\\Desktop\\IDE\\Studio',
      history: [],
      currentInput: '',
      isActive: true,
      process: null
    }
  ]);
  
  const [activeTerminalId, setActiveTerminalId] = useState(1);
  const [isLocalMaximized, setIsLocalMaximized] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(300);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Fallback commands if commonCommands prop is not provided
  const defaultCommands = [
    { cmd: 'npm install', desc: 'Install dependencies', category: 'npm' },
    { cmd: 'npm start', desc: 'Start development server', category: 'npm' },
    { cmd: 'git status', desc: 'Check git status', category: 'git' },
    { cmd: 'git add .', desc: 'Stage all changes', category: 'git' },
    { cmd: 'dir', desc: 'List directory contents', category: 'fs' },
    { cmd: 'cd <path>', desc: 'Change directory', category: 'fs' },
    { cmd: 'cls', desc: 'Clear screen', category: 'fs' }
  ];

  const commands = commonCommands || defaultCommands;

  const activeTerminal = terminals.find(t => t.id === activeTerminalId);

  // Auto-focus input when terminal becomes active
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, activeTerminalId]);

  // Scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [activeTerminal?.history]);

  const createNewTerminal = () => {
    const newId = Math.max(...terminals.map(t => t.id)) + 1;
    const newTerminal = {
      id: newId,
      title: `Terminal ${newId}`,
      cwd: 'C:\\Users\\vedan\\Desktop\\IDE\\Studio',
      history: [
        {
          type: 'system',
          content: `Microsoft Windows [Version 10.0.19045.3324]
(c) Microsoft Corporation. All rights reserved.

C:\\Users\\vedan\\Desktop\\IDE\\Studio>`,
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      currentInput: '',
      isActive: false,
      process: null
    };
    
    setTerminals([...terminals, newTerminal]);
    setActiveTerminalId(newId);
  };

  const closeTerminal = (id) => {
    if (terminals.length === 1) return; // Don't close last terminal
    
    const newTerminals = terminals.filter(t => t.id !== id);
    setTerminals(newTerminals);
    
    if (activeTerminalId === id) {
      setActiveTerminalId(newTerminals[0].id);
    }
  };

  const executeCommand = async (command) => {
    if (!command.trim()) return;

    const terminal = terminals.find(t => t.id === activeTerminalId);
    const timestamp = new Date().toLocaleTimeString();

    // Add command to history
    const newCommandHistory = [...commandHistory];
    if (newCommandHistory[newCommandHistory.length - 1] !== command) {
      newCommandHistory.push(command);
      setCommandHistory(newCommandHistory);
    }
    setHistoryIndex(-1);

    // Add command to terminal history
    const commandEntry = {
      type: 'command',
      content: `${terminal.cwd}> ${command}`,
      timestamp
    };

    // Enhanced command execution with realistic outputs
    let output = '';
    let outputType = 'output';

    try {
      const cmd = command.toLowerCase().trim();
      const args = command.split(' ').slice(1);

      // Handle built-in commands
      if (cmd === 'cls' || cmd === 'clear') {
        setTerminals(terminals.map(t => 
          t.id === activeTerminalId 
            ? { ...t, history: [] }
            : t
        ));
        return;
      }

      // Directory navigation
      if (cmd.startsWith('cd ')) {
        const newPath = command.substring(3).trim();
        if (newPath === '..') {
          const pathParts = terminal.cwd.split('\\');
          pathParts.pop();
          const newCwd = pathParts.join('\\') || 'C:';
          setTerminals(terminals.map(t => 
            t.id === activeTerminalId 
              ? { ...t, cwd: newCwd, history: [...t.history, commandEntry] }
              : t
          ));
        } else if (newPath === '\\' || newPath === '/') {
          setTerminals(terminals.map(t => 
            t.id === activeTerminalId 
              ? { ...t, cwd: 'C:\\', history: [...t.history, commandEntry] }
              : t
          ));
        } else if (newPath.includes(':') || newPath.startsWith('\\')) {
          setTerminals(terminals.map(t => 
            t.id === activeTerminalId 
              ? { ...t, cwd: newPath, history: [...t.history, commandEntry] }
              : t
          ));
        } else {
          const newCwd = `${terminal.cwd}\\${newPath}`;
          setTerminals(terminals.map(t => 
            t.id === activeTerminalId 
              ? { ...t, cwd: newCwd, history: [...t.history, commandEntry] }
              : t
          ));
        }
        return;
      }

      // Enhanced DIR command
      if (cmd === 'dir' || cmd === 'dir /a') {
        const showHidden = cmd.includes('/a');
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        
        output = `Directory of ${terminal.cwd}

${currentDate}  ${currentTime}    <DIR>          .
${currentDate}  ${currentTime}    <DIR>          ..`;

        if (terminal.cwd.includes('Studio')) {
          output += `
${currentDate}  ${currentTime}    <DIR>          node_modules
${currentDate}  ${currentTime}    <DIR>          public
${currentDate}  ${currentTime}    <DIR>          src
${currentDate}  ${currentTime}               545 package.json
${currentDate}  ${currentTime}            1,024 README.md
${currentDate}  ${currentTime}               312 vite.config.js
${currentDate}  ${currentTime}               156 index.html
${currentDate}  ${currentTime}                89 eslint.config.js`;
          
          if (showHidden) {
            output += `
${currentDate}  ${currentTime}    <DIR>          .git
${currentDate}  ${currentTime}    <DIR>          .vscode
${currentDate}  ${currentTime}               167 .gitignore
${currentDate}  ${currentTime}                45 .env`;
          }
          
          output += `
               5 File(s)          2,126 bytes
               4 Dir(s)   45,234,567,890 bytes free`;
        } else {
          output += `
${currentDate}  ${currentTime}    <DIR>          Documents
${currentDate}  ${currentTime}    <DIR>          Downloads
${currentDate}  ${currentTime}    <DIR>          Desktop
               0 File(s)              0 bytes
               3 Dir(s)   45,234,567,890 bytes free`;
        }
      }

      // Enhanced NPM commands
      else if (cmd.startsWith('npm ')) {
        const npmCmd = args[0];
        
        if (npmCmd === 'install' || npmCmd === 'i') {
          const packageName = args[1];
          if (packageName) {
            output = `npm WARN deprecated ${packageName}@1.0.0: This package has been deprecated
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@~2.3.2 (node_modules\\fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.3.2: wanted {"os":"darwin","arch":"any"} (current: {"os":"win32","arch":"x64"})

added 1 package, and audited 201 packages in 2.3s

found 0 vulnerabilities`;
          } else {
            output = `npm WARN deprecated stable@0.1.8: Modern JS already guarantees Array#sort() is a stable sort
npm WARN deprecated querystring@0.2.0: The querystring API is considered Legacy
npm WARN deprecated uuid@3.4.0: Please upgrade to version 7 or higher

added 1247 packages, and audited 1248 packages in 15.2s

128 packages are looking for funding
  run \`npm fund\` for details

found 0 vulnerabilities`;
          }
          outputType = 'success';
        }
        
        else if (npmCmd === 'start' || npmCmd === 'run' && args[1] === 'dev') {
          output = `> studio@0.0.0 dev
> vite

  VITE v5.0.0  ready in 245 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

  ready - started server on 0.0.0.0:5173`;
          outputType = 'success';
        }
        
        else if (npmCmd === 'run' && args[1] === 'build') {
          output = `> studio@0.0.0 build
> vite build

vite v5.0.0 building for production...
✓ 127 modules transformed.
dist/index.html                   0.46 kB │ gzip:   0.30 kB
dist/assets/index-DiwrgTda.css    1.30 kB │ gzip:   0.72 kB
dist/assets/index-C2PWchud.js   143.61 kB │ gzip:  46.11 kB
✓ built in 1.24s`;
          outputType = 'success';
        }
        
        else if (npmCmd === 'test') {
          output = `> studio@0.0.0 test
> vitest

 RUN  v1.0.0 ${terminal.cwd}

 ✓ src/components/EditorGroup.test.jsx (3) 245ms
   ✓ should render editor tabs
   ✓ should handle tab switching
   ✓ should execute commands
 ✓ src/components/FileExplorer.test.jsx (5) 189ms
   ✓ should display file tree
   ✓ should handle file selection
   ✓ should create new files
   ✓ should delete files
   ✓ should search files

 Test Files  2 passed (2)
      Tests  8 passed (8)
   Start at ${new Date().toLocaleTimeString()}
   Duration  1.45s (transform 234ms, setup 0ms, collect 89ms, tests 1.12s)`;
          outputType = 'success';
        }
        
        else if (npmCmd === 'audit') {
          if (args[1] === 'fix') {
            output = `up to date, audited 1248 packages in 3.2s

fixed 2 vulnerabilities

found 0 vulnerabilities`;
            outputType = 'success';
          } else {
            output = `# npm audit report

lodash  <=4.17.20
Severity: high
Prototype Pollution - https://github.com/advisories/GHSA-p6mc-m468-83gw
fix available via \`npm audit fix\`
node_modules/lodash

2 high severity vulnerabilities

To address all issues, run:
  npm audit fix`;
            outputType = 'error';
          }
        }
        
        else if (npmCmd === 'list' || npmCmd === 'ls') {
          output = `studio@0.0.0 ${terminal.cwd}
├── @monaco-editor/react@4.6.0
├── lucide-react@0.263.1
├── react@18.2.0
├── react-dom@18.2.0
├── vite@5.0.0
└── vitest@1.0.0`;
        }
        
        else if (npmCmd === 'outdated') {
          output = `Package              Current  Wanted  Latest  Location                 Depended by
@monaco-editor/react   4.6.0   4.6.0   4.6.1  node_modules/@monaco...  studio
lucide-react          0.263.1 0.263.1 0.264.0 node_modules/lucide...   studio
vite                    5.0.0   5.0.0   5.0.2  node_modules/vite        studio`;
        }
        
        else if (npmCmd === 'version') {
          if (args[1] === 'patch') {
            output = `v1.0.1`;
            outputType = 'success';
          } else {
            output = `{
  npm: '10.2.4',
  node: '20.11.1',
  acorn: '8.11.3',
  ada: '2.7.6',
  ares: '1.20.1',
  base64: '0.5.2',
  brotli: '1.1.0',
  cares: '1.20.1',
  cldr: '44.0',
  icu: '74.2',
  llhttp: '8.1.1',
  modules: '115',
  napi: '9',
  nghttp2: '1.58.0',
  nghttp3: '0.7.0',
  ngtcp2: '0.8.1',
  openssl: '3.0.12',
  simdutf: '4.0.8',
  tz: '2023c',
  undici: '5.28.2',
  unicode: '15.1',
  uv: '1.46.0',
  uvwasi: '0.0.19',
  v8: '11.3.244.8-node.17',
  zlib: '1.2.13.1'
}`;
          }
        }
        
        else {
          output = `npm ERR! Unknown command: "${npmCmd}"
npm ERR! 
npm ERR! To see a list of supported npm commands, run:
npm ERR!   npm help`;
          outputType = 'error';
        }
      }

      // Enhanced Git commands
      else if (cmd.startsWith('git ')) {
        const gitCmd = args[0];
        
        if (gitCmd === 'status') {
          output = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   src/components/EditorGroup.jsx
        modified:   src/components/Terminal/TerminalPanel.jsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)

        src/components/Terminal/TerminalManager.jsx
        src/components/Terminal/TerminalSettings.jsx

no changes added to commit (use "git add" to stage changes)`;
        }
        
        else if (gitCmd === 'add') {
          if (args[1] === '.') {
            output = `warning: LF will be replaced by CRLF in src/components/EditorGroup.jsx.
The file will have its original line endings in your working directory`;
            outputType = 'success';
          } else {
            output = ``;
            outputType = 'success';
          }
        }
        
        else if (gitCmd === 'commit') {
          const message = command.match(/-m\s+"([^"]+)"/)?.[1] || 'Update files';
          output = `[main f7d2c84] ${message}
 4 files changed, 1247 insertions(+), 15 deletions(-)
 create mode 100644 src/components/Terminal/TerminalManager.jsx
 create mode 100644 src/components/Terminal/TerminalSettings.jsx
 create mode 100644 src/components/Terminal/TerminalPanel.css`;
          outputType = 'success';
        }
        
        else if (gitCmd === 'push') {
          output = `Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 8 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (9/9), 2.47 KiB | 2.47 MiB/s, done.
Total 9 (delta 6), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (6/6), completed with 4 local objects.
To https://github.com/VedantPanchal23/IDE.git
   a1b2c3d..f7d2c84  main -> main`;
          outputType = 'success';
        }
        
        else if (gitCmd === 'pull') {
          output = `From https://github.com/VedantPanchal23/IDE
 * branch            main       -> FETCH_HEAD
Already up to date.`;
          outputType = 'success';
        }
        
        else if (gitCmd === 'branch') {
          if (args[1]) {
            output = `Switched to a new branch '${args[1]}'`;
            outputType = 'success';
          } else {
            output = `* main
  feature/terminal-integration
  develop`;
          }
        }
        
        else if (gitCmd === 'log') {
          if (args.includes('--oneline')) {
            output = `f7d2c84 (HEAD -> main, origin/main) Add terminal integration
a1b2c3d Implement editor improvements  
b2c3d4e Add file explorer enhancements
c3d4e5f Initial commit`;
          } else {
            output = `commit f7d2c84e8a1234567890abcdef1234567890abcd (HEAD -> main, origin/main)
Author: VedantPanchal23 <vedant@example.com>
Date:   ${new Date().toDateString()} ${new Date().toLocaleTimeString()}

    Add terminal integration with enhanced command support

commit a1b2c3de8a1234567890abcdef1234567890abcd
Author: VedantPanchal23 <vedant@example.com>
Date:   ${new Date(Date.now() - 86400000).toDateString()} ${new Date(Date.now() - 86400000).toLocaleTimeString()}

    Implement editor improvements with find/replace and multi-cursor`;
          }
        }
        
        else if (gitCmd === 'diff') {
          if (args.includes('--staged')) {
            output = `diff --git a/src/components/Terminal/TerminalPanel.jsx b/src/components/Terminal/TerminalPanel.jsx
new file mode 100644
index 0000000..1234567
--- /dev/null
+++ b/src/components/Terminal/TerminalPanel.jsx
@@ -0,0 +1,245 @@
+import React, { useState, useRef, useEffect } from 'react';
+import { Terminal, Plus, X } from 'lucide-react';
+
+const TerminalPanel = ({ isOpen, onToggle }) => {`;
          } else {
            output = `diff --git a/src/components/EditorGroup.jsx b/src/components/EditorGroup.jsx
index 1234567..abcdefg 100644
--- a/src/components/EditorGroup.jsx
+++ b/src/components/EditorGroup.jsx
@@ -25,6 +25,7 @@ import {
   MousePointer2
 } from 'lucide-react'
+import TerminalPanel from './Terminal/TerminalPanel'
 
 const EditorGroup = ({ tabs, activeTabId, onTabChange }) => {`;
          }
        }
        
        else if (gitCmd === 'stash') {
          if (args[1] === 'pop') {
            output = `On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)

        modified:   src/components/EditorGroup.jsx

Dropped refs/stash@{0} (f7d2c84 WIP on main: a1b2c3d Terminal improvements)`;
            outputType = 'success';
          } else if (args[1] === 'list') {
            output = `stash@{0}: WIP on main: a1b2c3d Terminal improvements
stash@{1}: WIP on main: b2c3d4e Editor enhancements`;
          } else {
            output = `Saved working directory and index state WIP on main: f7d2c84 Add terminal integration`;
            outputType = 'success';
          }
        }
        
        else if (gitCmd === 'remote') {
          if (args.includes('-v')) {
            output = `origin  https://github.com/VedantPanchal23/IDE.git (fetch)
origin  https://github.com/VedantPanchal23/IDE.git (push)`;
          } else {
            output = `origin`;
          }
        }
        
        else {
          output = `git: '${gitCmd}' is not a git command. See 'git --help'.

The most similar commands are:
        init
        add
        am`;
          outputType = 'error';
        }
      }

      // System information commands
      else if (cmd === 'systeminfo') {
        output = `Host Name:                 DESKTOP-ABC123
OS Name:                   Microsoft Windows 11 Pro
OS Version:                10.0.22621 N/A Build 22621
OS Manufacturer:           Microsoft Corporation
OS Configuration:          Standalone Workstation
OS Build Type:             Multiprocessor Free
Registered Owner:          ${process.env.USERNAME || 'User'}
Registered Organization:   
Product ID:                00331-10000-00001-AA123
Original Install Date:     1/1/2024, 10:30:15 AM
System Boot Time:          ${new Date().toLocaleDateString()}, ${new Date(Date.now() - 86400000).toLocaleTimeString()}
System Manufacturer:       Dell Inc.
System Model:              OptiPlex 7090
System Type:               x64-based PC
Processor(s):              1 Processor(s) Installed.
                          [01]: Intel64 Family 6 Model 165 Stepping 2 GenuineIntel ~2900 Mhz
BIOS Version:              Dell Inc. 1.0.0, 1/1/2024
Windows Directory:         C:\\Windows
System Directory:          C:\\Windows\\system32
Boot Device:               \\Device\\HarddiskVolume2
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC-08:00) Pacific Time (US & Canada)
Total Physical Memory:     16,384 MB
Available Physical Memory: 8,192 MB
Virtual Memory: Max Size:  32,768 MB
Virtual Memory: Available: 16,384 MB
Virtual Memory: In Use:    16,384 MB
Page File Location(s):     C:\\pagefile.sys
Domain:                    WORKGROUP
Logon Server:              \\\\DESKTOP-ABC123
Hotfix(s):                 156 Hotfix(s) Installed.`;
      }

      // Network commands
      else if (cmd.startsWith('ping ')) {
        const host = args[0] || 'google.com';
        output = `Pinging ${host} [142.250.191.14] with 32 bytes of data:
Reply from 142.250.191.14: bytes=32 time=23ms TTL=116
Reply from 142.250.191.14: bytes=32 time=25ms TTL=116
Reply from 142.250.191.14: bytes=32 time=22ms TTL=116
Reply from 142.250.191.14: bytes=32 time=24ms TTL=116

Ping statistics for 142.250.191.14:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 22ms, Maximum = 25ms, Average = 23ms`;
        outputType = 'success';
      }

      else if (cmd === 'ipconfig') {
        if (args.includes('/all')) {
          output = `Windows IP Configuration

   Host Name . . . . . . . . . . . . : DESKTOP-ABC123
   Primary Dns Suffix  . . . . . . . : 
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No
   WINS Proxy Enabled. . . . . . . . : No

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : 
   Description . . . . . . . . . . . : Intel(R) Ethernet Connection
   Physical Address. . . . . . . . . : 12-34-56-78-9A-BC
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 192.168.1.100(Preferred) 
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
   DHCP Server . . . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 8.8.8.8
                                       8.8.4.4`;
        } else {
          output = `Windows IP Configuration

Ethernet adapter Ethernet:

   Connection-specific DNS Suffix  . : 
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`;
        }
      }

      // File operations
      else if (cmd.startsWith('type ')) {
        const filename = args[0];
        if (filename === 'package.json') {
          output = `{
  "name": "studio",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "vite": "^4.4.5",
    "vitest": "^1.0.0"
  }
}`;
        } else if (filename === 'README.md') {
          output = `# Studio - AI-Powered IDE

A modern, web-based IDE with integrated terminal, advanced editor features, and AI assistance.

## Features

- 🎨 Modern Monaco Editor with VS Code themes
- 📁 Advanced File Explorer with drag & drop
- 🔍 Find & Replace with regex support
- 🖱️ Multi-cursor editing
- 📂 Code folding and minimap
- 💻 Integrated terminal with multiple tabs
- 🤖 AI-powered code assistance
- 🎯 Project management tools

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
- \`npm run lint\` - Run ESLint

## License

MIT`;
        } else {
          output = `The system cannot find the file specified.`;
          outputType = 'error';
        }
      }

      // Other utility commands
      else if (cmd === 'tree') {
        output = `Folder PATH listing for volume Windows
Volume serial number is 1234-ABCD
C:\\USERS\\VEDAN\\DESKTOP\\IDE\\STUDIO
├───node_modules
├───public
│   └───vite.svg
├───src
│   ├───components
│   │   ├───Terminal
│   │   │   ├───TerminalPanel.jsx
│   │   │   ├───TerminalManager.jsx
│   │   │   └───TerminalSettings.jsx
│   │   ├───EditorGroup.jsx
│   │   └───FileExplorer.jsx
│   ├───config
│   │   └───monaco.js
│   ├───App.jsx
│   └───main.jsx
├───index.html
├───package.json
├───vite.config.js
└───README.md`;
      }

      else if (cmd.startsWith('echo ')) {
        output = command.substring(5);
      }

      else if (cmd === 'date') {
        output = `The current date is: ${new Date().toLocaleDateString()}`;
      }

      else if (cmd === 'time') {
        output = `The current time is: ${new Date().toLocaleTimeString()}`;
      }

      else if (cmd === 'hostname') {
        output = `DESKTOP-ABC123`;
      }

      else if (cmd === 'whoami') {
        output = `desktop-abc123\\${process.env.USERNAME || 'user'}`;
      }

      else if (cmd.startsWith('node ')) {
        const filename = args[0];
        if (filename && filename.endsWith('.js')) {
          output = `Hello from Node.js!
Process ID: ${Math.floor(Math.random() * 10000)}
Node version: v20.11.1
Platform: win32
Architecture: x64`;
          outputType = 'success';
        } else {
          output = `node: can't open file '${filename}': [Errno 2] No such file or directory`;
          outputType = 'error';
        }
      }

      else if (cmd === 'node --version') {
        output = `v20.11.1`;
      }

      else if (cmd === 'help') {
        output = `For more information on a specific command, type HELP command-name

ATTRIB         Displays or changes file attributes.
CD             Displays the name of or changes the current directory.
CLS            Clears the screen.
COPY           Copies one or more files to another location.
DATE           Displays or sets the date.
DEL            Deletes one or more files.
DIR            Displays a list of files and subdirectories in a directory.
ECHO           Displays messages, or turns command echoing on or off.
EXIT           Quits the CMD.EXE program (command interpreter).
HELP           Provides Help information for Windows commands.
MKDIR          Creates a directory.
MOVE           Moves one or more files from one directory to another.
PATH           Displays or sets a search path for executable files.
RMDIR          Removes a directory.
TIME           Displays or sets the system time.
TREE           Graphically displays the directory structure of a drive.
TYPE           Displays the contents of a text file.
WHERE          Displays the location of files that match a search pattern.

For tools Help, type the tool name followed by /?.`;
      }

      else {
        output = `'${command}' is not recognized as an internal or external command,
operable program or batch file.

Did you mean:
  ${commands.filter(cmd => cmd.cmd.toLowerCase().includes(command.toLowerCase().split(' ')[0]))
    .slice(0, 3)
    .map(cmd => `  ${cmd.cmd}`)
    .join('\n') || '  No suggestions available'}`;
        outputType = 'error';
      }

    } catch (error) {
      output = `Error executing command: ${error.message}`;
      outputType = 'error';
    }

    // Add command and output to terminal history
    const outputEntry = {
      type: outputType,
      content: output,
      timestamp
    };

    setTerminals(terminals.map(t => 
      t.id === activeTerminalId 
        ? { ...t, history: [...t.history, commandEntry, outputEntry] }
        : t
    ));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const command = activeTerminal?.currentInput || '';
      executeCommand(command);
      
      // Clear input
      setTerminals(terminals.map(t => 
        t.id === activeTerminalId 
          ? { ...t, currentInput: '' }
          : t
      ));
    } 
    
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setTerminals(terminals.map(t => 
          t.id === activeTerminalId 
            ? { ...t, currentInput: commandHistory[newIndex] }
            : t
        ));
      }
    } 
    
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex === commandHistory.length - 1 ? -1 : historyIndex + 1;
        setHistoryIndex(newIndex);
        setTerminals(terminals.map(t => 
          t.id === activeTerminalId 
            ? { ...t, currentInput: newIndex === -1 ? '' : commandHistory[newIndex] }
            : t
        ));
      }
    }

    else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete for common commands
      const input = activeTerminal?.currentInput || '';
      const matches = commands?.filter(cmd => 
        cmd.cmd.toLowerCase().startsWith(input.toLowerCase())
      ) || [];
      
      if (matches.length === 1) {
        setTerminals(terminals.map(t => 
          t.id === activeTerminalId 
            ? { ...t, currentInput: matches[0].cmd }
            : t
        ));
      }
    }
  };

  // Height resizing functions
  const handleResizeStart = (e) => {
    setIsResizing(true);
    setStartY(e.clientY);
    setStartHeight(typeof height === 'string' ? 300 : height);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    e.preventDefault();
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    
    const deltaY = startY - e.clientY; // Inverted because terminal grows upward
    const newHeight = Math.max(150, Math.min(800, startHeight + deltaY));
    
    if (onHeightChange) {
      onHeightChange(newHeight);
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Cleanup resize listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  const clearTerminal = () => {
    setTerminals(terminals.map(t => 
      t.id === activeTerminalId 
        ? { ...t, history: [] }
        : t
    ));
  };

  const getPrompt = () => {
    return `${activeTerminal?.cwd || 'C:\\Users\\vedan\\Desktop\\IDE\\Studio'}> `;
  };

  if (!isOpen) return null;

  return (
    <div className={`terminal-panel ${(isMaximized || isLocalMaximized) ? 'maximized' : ''}`} style={{ height: (isMaximized || isLocalMaximized) ? '100vh' : height }}>
      {/* Resize Handle */}
      {!isMaximized && !isLocalMaximized && (
        <div 
          className="terminal-resize-handle"
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            top: '-3px',
            left: 0,
            right: 0,
            height: '6px',
            cursor: 'row-resize',
            backgroundColor: 'transparent',
            zIndex: 1000
          }}
        />
      )}
      
      {/* Header */}
      <div className="terminal-header">
        <div className="terminal-tabs">
          {terminals.map(terminal => (
            <div
              key={terminal.id}
              className={`terminal-tab ${terminal.id === activeTerminalId ? 'active' : ''}`}
              onClick={() => setActiveTerminalId(terminal.id)}
            >
              <span>{terminal.title}</span>
              {terminals.length > 1 && (
                <button
                  className="terminal-tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTerminal(terminal.id);
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          
          <button className="terminal-tab-add" onClick={createNewTerminal} title="New Terminal">
            <Plus size={16} />
          </button>
        </div>

        <div className="terminal-actions">
          <button onClick={() => setShowSearch(!showSearch)} title="Search">
            <Search size={16} />
          </button>
          <button onClick={clearTerminal} title="Clear Terminal">
            <X size={16} />
          </button>
          <button onClick={() => {
            if (onMaximize) {
              onMaximize();
            } else {
              setIsLocalMaximized(!isLocalMaximized);
            }
          }} title={(isMaximized || isLocalMaximized) ? "Restore" : "Maximize"}>
            {(isMaximized || isLocalMaximized) ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={onToggle} title="Close Terminal">
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="terminal-search">
          <input
            type="text"
            placeholder="Search terminal output..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setShowSearch(false)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Terminal Content */}
      <div className="terminal-content" ref={terminalRef}>
        {activeTerminal?.history.map((entry, index) => (
          <div
            key={index}
            className={`terminal-line ${entry.type}`}
            style={{ 
              display: searchTerm && !entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ? 'none' : 'block' 
            }}
          >
            <pre>{entry.content}</pre>
          </div>
        ))}
        
        {/* Input Line */}
        <div className="terminal-input-line">
          <span className="terminal-prompt">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={activeTerminal?.currentInput || ''}
            onChange={(e) => setTerminals(terminals.map(t => 
              t.id === activeTerminalId 
                ? { ...t, currentInput: e.target.value }
                : t
            ))}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Command Suggestions */}
      {activeTerminal?.currentInput && (
        <div className="command-suggestions">
          {commands
            ?.filter(cmd => cmd.cmd.toLowerCase().startsWith(activeTerminal.currentInput.toLowerCase()))
            .slice(0, 5)
            .map((cmd, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => {
                  setTerminals(terminals.map(t => 
                    t.id === activeTerminalId 
                      ? { ...t, currentInput: cmd.cmd }
                      : t
                  ));
                  inputRef.current?.focus();
                }}
              >
                <span className="suggestion-cmd">{cmd.cmd}</span>
                <span className="suggestion-desc">{cmd.desc}</span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default TerminalPanel;
