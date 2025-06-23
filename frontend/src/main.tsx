import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('main.tsx: Starting React initialization...')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('main.tsx: Failed to find root element')
  throw new Error('Failed to find root element')
}

console.log('main.tsx: Root element found, creating React root...')

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('main.tsx: React app rendered successfully')
} catch (error) {
  console.error('main.tsx: Error rendering React app:', error)
}
