import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <-- এই লাইনটি সবচেয়ে জরুরি!

// Native Desktop Polish: Disable default context menu unless inside a text field
document.addEventListener('contextmenu', (e) => {
  const tagName = e.target.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable;
  const isSelectableText = window.getSelection().toString().length > 0 && e.target.closest('.selectable-text');

  if (!isInput && !isSelectableText) {
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
