import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/barlow/latin-400.css'
import '@fontsource/barlow-condensed/latin-600.css'
import 'lenis/dist/lenis.css'
import './index.css'
import App from './App.tsx'
import { SmoothScroll } from './features/helmet/SmoothScroll'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScroll><App /></SmoothScroll>
  </StrictMode>,
)
