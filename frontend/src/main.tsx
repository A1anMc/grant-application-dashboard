import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.working'
import './index.css'

console.log('main.tsx: Starting React initialization...')

// Add error handling for the entire script
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  document.getElementById('root')!.innerHTML = `<div style="padding: 20px; color: red;"><h1>JavaScript Error</h1><pre>${event.error?.stack || event.error}</pre></div>`
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  document.getElementById('root')!.innerHTML = `<div style="padding: 20px; color: red;"><h1>Promise Rejection</h1><pre>${event.reason}</pre></div>`
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('main.tsx: Failed to find root element')
  document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: Root element not found</h1></div>'
  throw new Error('Failed to find root element')
}

console.log('main.tsx: Root element found, creating React root...')

try {
  const root = ReactDOM.createRoot(rootElement)
  console.log('main.tsx: React root created, rendering app...')
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  
  console.log('main.tsx: React app rendered successfully')
  
  // Check if React actually mounted after a delay
  setTimeout(() => {
    const rootContent = rootElement.innerHTML
    if (rootContent === 'Loading...') {
      console.error('React failed to mount - still showing Loading...')
      rootElement.innerHTML = '<div style="padding: 20px; color: orange;"><h1>React Failed to Mount</h1><p>React was called but did not replace the Loading... text</p></div>'
    } else {
      console.log('React mounted successfully - content changed from Loading...')
    }
  }, 1000)
  
} catch (error) {
  console.error('main.tsx: Error rendering React app:', error)
  rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>React Render Error</h1><pre>${error}</pre></div>`
}
