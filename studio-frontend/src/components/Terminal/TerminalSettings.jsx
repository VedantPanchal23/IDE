import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Save, 
  RotateCcw, 
  Monitor, 
  Type, 
  Palette, 
  Terminal,
  History,
  Zap
} from 'lucide-react';
import './TerminalSettings.css';

const TerminalSettings = ({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'behavior', label: 'Behavior', icon: Zap },
    { id: 'shortcuts', label: 'Shortcuts', icon: Type }
  ];

  const fontFamilies = [
    'Cascadia Code',
    'Fira Code',
    'JetBrains Mono',
    'Source Code Pro',
    'Monaco',
    'Menlo',
    'Consolas',
    'Courier New'
  ];

  const themes = [
    { id: 'dark', name: 'Dark', preview: '#1e1e1e' },
    { id: 'light', name: 'Light', preview: '#ffffff' },
    { id: 'high-contrast', name: 'High Contrast', preview: '#000000' },
    { id: 'solarized-dark', name: 'Solarized Dark', preview: '#002b36' },
    { id: 'solarized-light', name: 'Solarized Light', preview: '#fdf6e3' },
    { id: 'monokai', name: 'Monokai', preview: '#272822' },
    { id: 'dracula', name: 'Dracula', preview: '#282a36' }
  ];

  const shells = [
    { id: 'cmd', name: 'Command Prompt', path: 'cmd.exe' },
    { id: 'powershell', name: 'PowerShell', path: 'powershell.exe' },
    { id: 'pwsh', name: 'PowerShell Core', path: 'pwsh.exe' },
    { id: 'bash', name: 'Git Bash', path: 'bash.exe' },
    { id: 'wsl', name: 'WSL', path: 'wsl.exe' }
  ];

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      fontSize: 14,
      fontFamily: 'Cascadia Code',
      theme: 'dark',
      shell: 'cmd',
      startupCommands: [],
      autoComplete: true,
      historySize: 1000,
      wordWrap: false,
      cursorStyle: 'block',
      cursorBlinking: true,
      smoothScrolling: true,
      fastScrollSensitivity: 5,
      scrollback: 1000,
      bellStyle: 'none',
      copyOnSelect: false,
      pasteOnRightClick: true,
      confirmBeforeClosing: true,
      shellIntegration: true
    };
    setLocalSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="terminal-settings-overlay">
      <div className="terminal-settings-modal">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title">
            <Settings size={20} />
            <span>Terminal Settings</span>
          </div>
          <button className="settings-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Sidebar */}
          <div className="settings-sidebar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="settings-main">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="settings-section">
                <h3>General Settings</h3>
                
                <div className="setting-item">
                  <label>Default Shell</label>
                  <select 
                    value={localSettings.shell}
                    onChange={(e) => handleSettingChange('shell', e.target.value)}
                  >
                    {shells.map(shell => (
                      <option key={shell.id} value={shell.id}>
                        {shell.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <label>Startup Commands</label>
                  <textarea
                    value={localSettings.startupCommands?.join('\n') || ''}
                    onChange={(e) => handleSettingChange('startupCommands', e.target.value.split('\n').filter(cmd => cmd.trim()))}
                    placeholder="Enter commands to run on terminal startup (one per line)"
                    rows={4}
                  />
                </div>

                <div className="setting-item">
                  <label>History Size</label>
                  <input
                    type="number"
                    value={localSettings.historySize}
                    onChange={(e) => handleSettingChange('historySize', parseInt(e.target.value))}
                    min="100"
                    max="10000"
                    step="100"
                  />
                </div>

                <div className="setting-item">
                  <label>Scrollback Buffer</label>
                  <input
                    type="number"
                    value={localSettings.scrollback}
                    onChange={(e) => handleSettingChange('scrollback', parseInt(e.target.value))}
                    min="100"
                    max="10000"
                    step="100"
                  />
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h3>Appearance Settings</h3>
                
                <div className="setting-item">
                  <label>Font Family</label>
                  <select 
                    value={localSettings.fontFamily}
                    onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  >
                    {fontFamilies.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="setting-item">
                  <label>Font Size</label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={localSettings.fontSize}
                    onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                  />
                  <span className="range-value">{localSettings.fontSize}px</span>
                </div>

                <div className="setting-item">
                  <label>Theme</label>
                  <div className="theme-grid">
                    {themes.map(theme => (
                      <div
                        key={theme.id}
                        className={`theme-option ${localSettings.theme === theme.id ? 'selected' : ''}`}
                        onClick={() => handleSettingChange('theme', theme.id)}
                      >
                        <div 
                          className="theme-preview" 
                          style={{ backgroundColor: theme.preview }}
                        />
                        <span>{theme.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="setting-item">
                  <label>Cursor Style</label>
                  <select 
                    value={localSettings.cursorStyle}
                    onChange={(e) => handleSettingChange('cursorStyle', e.target.value)}
                  >
                    <option value="block">Block</option>
                    <option value="line">Line</option>
                    <option value="underline">Underline</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="cursorBlinking"
                      checked={localSettings.cursorBlinking}
                      onChange={(e) => handleSettingChange('cursorBlinking', e.target.checked)}
                    />
                    <label htmlFor="cursorBlinking">Cursor Blinking</label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="wordWrap"
                      checked={localSettings.wordWrap}
                      onChange={(e) => handleSettingChange('wordWrap', e.target.checked)}
                    />
                    <label htmlFor="wordWrap">Word Wrap</label>
                  </div>
                </div>
              </div>
            )}

            {/* Behavior Settings */}
            {activeTab === 'behavior' && (
              <div className="settings-section">
                <h3>Behavior Settings</h3>
                
                <div className="setting-item">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="autoComplete"
                      checked={localSettings.autoComplete}
                      onChange={(e) => handleSettingChange('autoComplete', e.target.checked)}
                    />
                    <label htmlFor="autoComplete">Enable Auto-complete</label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="smoothScrolling"
                      checked={localSettings.smoothScrolling}
                      onChange={(e) => handleSettingChange('smoothScrolling', e.target.checked)}
                    />
                    <label htmlFor="smoothScrolling">Smooth Scrolling</label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="copyOnSelect"
                      checked={localSettings.copyOnSelect}
                      onChange={(e) => handleSettingChange('copyOnSelect', e.target.checked)}
                    />
                    <label htmlFor="copyOnSelect">Copy on Select</label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="pasteOnRightClick"
                      checked={localSettings.pasteOnRightClick}
                      onChange={(e) => handleSettingChange('pasteOnRightClick', e.target.checked)}
                    />
                    <label htmlFor="pasteOnRightClick">Paste on Right Click</label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="confirmBeforeClosing"
                      checked={localSettings.confirmBeforeClosing}
                      onChange={(e) => handleSettingChange('confirmBeforeClosing', e.target.checked)}
                    />
                    <label htmlFor="confirmBeforeClosing">Confirm Before Closing</label>
                  </div>
                </div>

                <div className="setting-item">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="shellIntegration"
                      checked={localSettings.shellIntegration}
                      onChange={(e) => handleSettingChange('shellIntegration', e.target.checked)}
                    />
                    <label htmlFor="shellIntegration">Shell Integration</label>
                  </div>
                </div>

                <div className="setting-item">
                  <label>Bell Style</label>
                  <select 
                    value={localSettings.bellStyle}
                    onChange={(e) => handleSettingChange('bellStyle', e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="sound">Sound</option>
                    <option value="visual">Visual</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>Fast Scroll Sensitivity</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={localSettings.fastScrollSensitivity}
                    onChange={(e) => handleSettingChange('fastScrollSensitivity', parseInt(e.target.value))}
                  />
                  <span className="range-value">{localSettings.fastScrollSensitivity}</span>
                </div>
              </div>
            )}

            {/* Shortcuts Settings */}
            {activeTab === 'shortcuts' && (
              <div className="settings-section">
                <h3>Keyboard Shortcuts</h3>
                
                <div className="shortcuts-list">
                  <div className="shortcut-item">
                    <span className="shortcut-action">New Terminal</span>
                    <kbd>Ctrl+Shift+`</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Close Terminal</span>
                    <kbd>Ctrl+Shift+W</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Next Terminal</span>
                    <kbd>Ctrl+PageDown</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Previous Terminal</span>
                    <kbd>Ctrl+PageUp</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Clear Terminal</span>
                    <kbd>Ctrl+L</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Copy Selection</span>
                    <kbd>Ctrl+C</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Paste</span>
                    <kbd>Ctrl+V</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Find in Terminal</span>
                    <kbd>Ctrl+F</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Toggle Terminal</span>
                    <kbd>Ctrl+`</kbd>
                  </div>
                  <div className="shortcut-item">
                    <span className="shortcut-action">Maximize Terminal</span>
                    <kbd>Ctrl+Shift+M</kbd>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="settings-footer">
          <button className="settings-button secondary" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
          <div className="footer-actions">
            <button className="settings-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="settings-button primary" onClick={handleSave}>
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalSettings;
