// VS Code Theme Configuration
export const vscodeTheme = {
  colors: {
    // Editor
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editor.lineHighlightBackground': '#2a2a2a',
    'editor.selectionBackground': '#264f78',
    'editor.selectionHighlightBackground': '#add6ff26',
    'editorCursor.foreground': '#aeafad',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#c6c6c6',
    'editorIndentGuide.background': '#404040',
    'editorIndentGuide.activeBackground': '#707070',
    'editorWhitespace.foreground': '#404040',
    
    // Sidebar
    'sideBar.background': '#252526',
    'sideBar.foreground': '#cccccc',
    'sideBar.border': '#2d2d30',
    
    // Activity Bar
    'activityBar.background': '#2f3129',
    'activityBar.foreground': '#ffffff',
    'activityBar.activeBorder': '#007acc',
    
    // Status Bar
    'statusBar.background': '#007acc',
    'statusBar.foreground': '#ffffff',
    'statusBar.noFolderBackground': '#68217a',
    
    // Title Bar
    'titleBar.activeBackground': '#3c3c3c',
    'titleBar.activeForeground': '#cccccc',
    'titleBar.inactiveBackground': '#3c3c3c',
    'titleBar.inactiveForeground': '#999999',
    
    // Tabs
    'tab.activeBackground': '#1e1e1e',
    'tab.activeForeground': '#ffffff',
    'tab.inactiveBackground': '#2d2d2d',
    'tab.inactiveForeground': '#969696',
    'tab.border': '#252526',
    
    // Panel
    'panel.background': '#1e1e1e',
    'panel.border': '#2d2d30',
    
    // Lists
    'list.activeSelectionBackground': '#094771',
    'list.activeSelectionForeground': '#ffffff',
    'list.hoverBackground': '#2a2d2e',
    'list.focusBackground': '#062f4a',
    
    // Buttons
    'button.background': '#0e639c',
    'button.foreground': '#ffffff',
    'button.hoverBackground': '#1177bb',
    
    // Input
    'input.background': '#3c3c3c',
    'input.foreground': '#cccccc',
    'input.border': '#3c3c3c',
    
    // Focus
    'focusBorder': '#007acc',
    
    // Scrollbar
    'scrollbar.shadow': '#000000',
    'widget.shadow': 'rgba(0, 0, 0, 0.36)'
  },
  
  fonts: {
    editor: "'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace",
    ui: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  
  sizes: {
    fontSize: '13px',
    editorFontSize: '14px',
    titleBarHeight: '30px',
    activityBarWidth: '48px',
    statusBarHeight: '22px'
  }
}

export const syntaxHighlighting = {
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'regexp', foreground: 'D16969' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'class', foreground: '4EC9B0' },
    { token: 'function', foreground: 'DCDCAA' },
    { token: 'variable', foreground: '9CDCFE' },
    { token: 'property', foreground: '9CDCFE' },
  ]
}
