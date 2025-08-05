import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, actualTheme, changeTheme } = useTheme();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    {
      id: 'light',
      name: 'Light',
      icon: 'ri-sun-line'
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: 'ri-moon-line'
    },
    {
      id: 'system',
      name: 'System',
      icon: 'ri-computer-line'
    }
  ];

  const getCurrentThemeIcon = () => {
    if (theme === 'system') {
      return actualTheme === 'dark' ? 'ri-moon-line' : 'ri-sun-line';
    }
    return themes.find(t => t.id === theme)?.icon || 'ri-sun-line';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Select theme"
      >
        <i className={`${getCurrentThemeIcon()} text-lg`}></i>
        <i className={`ri-arrow-down-s-line text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => {
                changeTheme(themeOption.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                theme === themeOption.id 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <i className={`${themeOption.icon} text-lg`}></i>
              <span className="text-sm font-medium">{themeOption.name}</span>
              {theme === themeOption.id && (
                <i className="ri-check-line text-sm ml-auto"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
