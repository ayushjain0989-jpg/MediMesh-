import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { MeshProvider } from './state/MeshContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MeshProvider>
      <App />
    </MeshProvider>
  </StrictMode>,
)
