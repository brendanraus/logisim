import React from 'react'
import ReactDOM from 'react-dom/client'
import Logisim from './logisim.tsx'

const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body { overflow-x: hidden; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0a0f1a; }
  ::-webkit-scrollbar-thumb { background: #1e2a3a; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #2d3f56; }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Logisim />
  </React.StrictMode>
)
