import React, { useState, useEffect } from 'react'
import Home from './pages/Home'
import AboutSection from './components/AboutSection'
import CircularGallery from './components/CircularGallery'
import khelotsavGalleryItems from './data/khelotsavPosts'

// ─────────────────────────────────────────────────────────────
// Root App — renders all sections in scroll order
// ─────────────────────────────────────────────────────────────
function App() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <>
      <Home />


      <AboutSection />
      <div style={{
        height: isMobile ? '520px' : '700px',
        position: 'relative',
        backgroundColor: '#1F1D66'
      }}>
        <CircularGallery
          items={khelotsavGalleryItems}
          bend={isMobile ? 1.5 : 2}
          textColor="#ffffff"
          borderRadius={0.06}
          scrollEase={0.05}
          fontUrl="https://fonts.googleapis.com/css2?family=Poppins:wght@400&display=swap"
          font={isMobile ? '400 20px Poppins' : '400 26px Poppins'}
          scrollSpeed={2}
        />
      </div>
    </>
  )
}

export default App
