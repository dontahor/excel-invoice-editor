import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import './index.css'
import App from './App.jsx'

// Polyfill global for xlsx-populate
if (typeof window !== 'undefined') {
  window.global = window;
  window.Buffer = Buffer;
}
globalThis.Buffer = Buffer;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
