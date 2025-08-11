const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'vscode-dark': '#1e1e1e',
        'vscode-secondary': '#2d2d30',
        'vscode-border': '#3e3e42',
        'vscode-blue': '#007acc',
        'vscode-green': '#4ec9b0',
        'vscode-yellow': '#ffcc02',
        'vscode-red': '#f14c4c',
        'vscode-purple': '#c586c0',
      },
      fontFamily: {
        sans: ['Geist Sans', ...defaultTheme.fontFamily.sans],
        mono: ['Geist Mono', ...defaultTheme.fontFamily.mono],
        pacifico: ['Pacifico', 'cursive'],
      },
    },
  },
  plugins: [],
}