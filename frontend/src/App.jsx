import React from 'react'
import Home from './pages/Home'
import AboutSection from './components/AboutSection'
import TextLoop from './components/TextEffect'
import CircularGallery from './components/CircularGallery'
import khelotsavGalleryItems from './data/khelotsavPosts'

// ─────────────────────────────────────────────────────────────
// Root App — renders all sections in scroll order
// ─────────────────────────────────────────────────────────────
function App() {
  return (
    <>
      <Home />

      <TextLoop
        speed={90}
        direction="forward"
        ribbonColor="#1F1D66"
        ribbonHeight={110}
        imageHeight={56}
        gap={64}
        pauseOnHover
      />
      <AboutSection />
      <div style={{ height: '700px', position: 'relative', backgroundColor: '#1F1D66' }}>
        <CircularGallery
          items={khelotsavGalleryItems}
          bend={2}
          textColor="#ffffff"
          borderRadius={0.06}
          scrollEase={0.05}
          fontUrl="https://fonts.googleapis.com/css2?family=Poppins:wght@400&display=swap"
          font="400 26px Poppins"
          scrollSpeed={2}
        />
      </div>
    </>
  )
}

export default App
