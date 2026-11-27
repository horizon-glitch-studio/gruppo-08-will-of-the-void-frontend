import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/index.css'
import { applyPreferences, storedPreferences } from '@/shared/preferences'
import App from './App'

// Settings of the last visit, before the first paint: no animation runs before the API confirms them
const preferences = storedPreferences()
if (preferences) applyPreferences(preferences)

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
