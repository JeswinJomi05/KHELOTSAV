import React from 'react'
import Home from './pages/Home'
import AboutSection from './components/AboutSection'

// ─────────────────────────────────────────────────────────────
// Root App — renders all sections in scroll order
// ─────────────────────────────────────────────────────────────
function App() {
  return (
    <>
      <Home />
      <AboutSection />
    </>
  )
}

export default App
