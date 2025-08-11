import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Import fonts to be used globally
import '@fontsource/geist-sans';
import '@fontsource/geist-mono';
import '@fontsource/pacifico';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);