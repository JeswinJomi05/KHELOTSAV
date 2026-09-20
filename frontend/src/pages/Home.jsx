import React, { useState } from 'react'

// =============================================================================
// ASSET IMPORTS (Home Section)
// =============================================================================
import bgImg from '../assets/Home/bg.png'
import khelotsavBg from '../assets/Home/KHELOTSAV_BG.png'
import khelotsavTitle from '../assets/Home/KHELOTSAV.png'
import dateOverlay from '../assets/Home/date.png'
import dhwaniLogo from '../assets/Home/dhwani26.png'
import lanternL1 from '../assets/Home/L1.png'
import lanternL2 from '../assets/Home/L2.png'
import lanternL4 from '../assets/Home/L4.png'
import musicalNotes from '../assets/Home/musicalnotes.png'
import carnavaleLogo from '../assets/Home/carnavale.png'

// Blue/Cyan cloud sprites
import cyanCloud1 from '../assets/Home/cyan_cloud_1.png'
import cyanCloud2 from '../assets/Home/cyan_cloud_2.png'
import cyanCloud3 from '../assets/Home/cyan_cloud_3.png'
import cyanCloud4 from '../assets/Home/cyan_cloud_4.png'
import cyanCloud5 from '../assets/Home/cyan_cloud_5.png'

function Home() {
  const [activeModal, setActiveModal] = useState(null)
  const [lanternIgnited, setLanternIgnited] = useState(false)

  // Always use blue/cyan cloud sprites
  const clouds = { c1: cyanCloud1, c2: cyanCloud2, c3: cyanCloud3, c4: cyanCloud4, c5: cyanCloud5 }

  const handleLanternClick = () => {
    setLanternIgnited(true)
    setTimeout(() => setLanternIgnited(false), 1500)
  }

  return (
    <div
      className="min-h-screen w-full overflow-hidden flex flex-col justify-between relative select-none font-sans bg-[#590729]"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Subtle vignette & ambient lighting gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300/10 via-transparent to-black/35 pointer-events-none z-0" />

      {/* Floating Star/Sparkle Particles in sky */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[14%] left-[9%] w-2 h-2 bg-yellow-200 rounded-full animate-ping opacity-60" />
        <div className="absolute top-[20%] right-[17%] w-2 h-2 bg-yellow-100 rounded-full animate-pulse opacity-75" />
        <div className="absolute top-[50%] left-[6%] w-1.5 h-1.5 bg-amber-300 rounded-full animate-ping opacity-50" />
        <div className="absolute top-[38%] right-[29%] w-2 h-2 bg-white rounded-full animate-pulse opacity-80" />
        <div className="absolute top-[65%] right-[7%] w-1.5 h-1.5 bg-amber-200 rounded-full animate-ping opacity-60" />
      </div>

      {/* ========================================================================= */}
      {/* B. TOP & HEADER SECTION                                                    */}
      {/* ========================================================================= */}
      <header className="relative w-full pt-3 sm:pt-5 md:pt-7 px-4 z-20 flex flex-col items-center">
        {/* Top Centered Brand Logo: DHWANI 26 */}
        <div className="relative z-20 group">
          <img
            src={dhwaniLogo}
            alt="DHWANI 26 Logo"
            className="w-32 sm:w-40 md:w-48 lg:w-56 h-auto object-contain transition-all duration-300 transform group-hover:scale-105 filter drop-shadow-[0_4px_16px_rgba(250,192,17,0.55)] cursor-pointer"
            onClick={() => setActiveModal({
              title: "DHWANI '26 FESTIVAL",
              tagline: "The Grand Annual Cultural & Sports Extravaganza",
              content: "Dhwani '26 welcomes you to an electrifying celebration of sportsmanship, art, music, and carnival excitement. Join thousands of students as they compete, celebrate, and create memories of a lifetime!"
            })}
          />
        </div>

        {/* Decorative Floating Clouds: Top-Left (Cloud 2) */}
        <div className="absolute top-1 sm:top-3 -left-30 sm:-left-26 w-52 sm:w-64 md:w-80 lg:w-96 pointer-events-none z-10 animate-float-slow">
          <img
            src={clouds.c2}
            alt="Decorative Top Left Cloud"
            className="w-full h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
          />
        </div>

        {/* Decorative Floating Clouds: Top-Right (Cloud 1) */}
        <div className="absolute -top-4 sm:-top-6 right-0 sm:right-4 w-28 sm:w-36 md:w-48 lg:w-56 pointer-events-none z-10 animate-float-reverse rotate-350">
          <img
            src={clouds.c1}
            alt="Decorative Top Right Cloud"
            className="w-full h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
          />
        </div>

        {/* Floating Musical Notes with slight rotation & opacity */}
        <div className="absolute top-10 sm:top-12 md:top-14 left-[20%] sm:left-[26%] md:left-[29%] pointer-events-none z-10 animate-note-float">
          <img
            src={musicalNotes}
            alt="Musical Note Left"
            className="w-8 sm:w-11 md:w-13 h-auto object-contain filter drop-shadow-[0_0_12px_rgba(255,0,118,0.7)]"
          />
        </div>

        <div className="absolute top-8 sm:top-11 md:top-13 right-[22%] sm:right-[27%] md:right-[30%] pointer-events-none z-10 animate-note-float [animation-delay:1.6s]">
          <img
            src={musicalNotes}
            alt="Musical Note Right"
            className="w-7 sm:w-10 md:w-12 h-auto object-contain filter drop-shadow-[0_0_12px_rgba(255,0,118,0.7)] transform scale-x-[-1]"
          />
        </div>

        {/* Glowing Sky Lantern 2 (Top Left Floating) */}
        <div
          onClick={handleLanternClick}
          className="absolute top-8 sm:top-11 md:top-14 left-[13%] sm:left-[16%] md:left-[18%] z-20 cursor-pointer animate-float-sway transition-transform duration-300 hover:scale-110"
          title="Click to illuminate sky lantern"
        >
          <img
            src={lanternL2}
            alt="Glowing Sky Lantern Top Left"
            className={`w-11 sm:w-15 md:w-19 lg:w-22 h-auto object-contain transition-all duration-300 ${lanternIgnited
              ? 'filter drop-shadow-[0_0_40px_rgba(255,230,80,1)] brightness-125'
              : 'filter drop-shadow-[0_0_20px_rgba(255,200,40,0.85)]'
              }`}
          />
        </div>

        {/* Glowing Sky Lantern 3 (Top Right Floating with Long Ribbons) */}
        <div
          onClick={handleLanternClick}
          className="absolute top-3 sm:top-5 md:top-7 right-[8%] sm:right-[11%] md:right-[13%] z-20 cursor-pointer animate-float-sway [animation-delay:2.4s] transition-transform duration-300 hover:scale-110"
          title="Click to illuminate sky lantern"
        >
          <img
            src={lanternL4}
            alt="Glowing Sky Lantern Top Right with Ribbons"
            className={`w-16 sm:w-22 md:w-28 lg:w-34 h-auto object-contain transition-all duration-300 ${lanternIgnited
              ? 'filter drop-shadow-[0_0_40px_rgba(255,230,80,1)] brightness-125'
              : 'filter drop-shadow-[0_0_22px_rgba(255,200,40,0.85)]'
              }`}
          />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* C. CENTRAL MAIN HERO BANNER                                                */}
      {/* ========================================================================= */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-2 sm:px-6 my-auto w-full z-10">
        {/* Banner Card Arch Container */}
        <div className="relative w-full max-w-[880px] lg:max-w-[980px] flex flex-col items-center justify-center mx-auto">

          {/* Overlapping Cloud: Top-Center above Arch (Cloud 3) */}
          <div className="absolute -top-8 sm:-top-12 md:-top-16 left-[22%] sm:left-[26%] md:left-[29%] w-24 sm:w-34 md:w-44 pointer-events-none z-20 animate-float">
            <img
              src={clouds.c3}
              alt="Cloud Above Arch"
              className="w-full h-auto object-contain filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.4)]"
            />
          </div>

          {/* Main Central Container Card: Wooden Arch & Dark Blue Side Pillars */}
          <div className="relative w-full flex items-center justify-center">
            <img
              src={khelotsavBg}
              alt="Khelotsav Banner Frame"
              className="w-full scale-[1.2] h-auto object-contain filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.7)] select-none pointer-events-none"
            />

            {/* Title Overlay: Centered "KHELOTSAV" prominently inside/over the center frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src={khelotsavTitle}
                alt="KHELOTSAV Main Title"
                className="w-[82%] sm:w-[85%] md:w-[87%] lg:w-[88%] max-w-[780px] h-auto object-contain filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.7)] pointer-events-auto cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-95"
                onClick={() => setActiveModal({
                  title: "KHELOTSAV '26",
                  tagline: "The Ultimate Sports Arena",
                  content: "Khelotsav is a day wrapped up with sports, games and a lot more fun. From indoors to the mega outdoor events, everything comes under one roof. Khelotsav is an opportunity to shine on the field and promises to be a day filled with a lineup of exhilarating games, competitiveness and sportsmanship."
                })}
              />
            </div>
          </div>

          {/* Date Overlay: Directly below "KHELOTSAV", horizontally centered */}
          <div className="relative -mt-6 sm:-mt-8 md:-mt-11 lg:-mt-13 z-20 flex flex-col items-center justify-center">
            <img
              src={dateOverlay}
              alt="October 2nd to 4th"
              className="w-52 sm:w-68 md:w-88 lg:w-[410px] h-auto object-contain animate-date-pulse cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setActiveModal({
                title: "EVENT DATES & SCHEDULE",
                tagline: "October 2nd to 4th, 2026",
                content: "Mark your calendars! 3 days of non-stop adrenaline, high-stakes matches, and electrifying sports action. Inauguration starts Oct 2nd at 9:00 AM. Tournament finals and Grand Gala on Oct 4th evening."
              })}
            />
          </div>

          {/* Overlapping Cloud: Bottom-Left below Arch (Cloud 5) */}
          <div className="absolute -bottom-8 sm:-bottom-11 md:-bottom-14 left-[2%] sm:left-[12%] md:left-[15%] w-32 sm:w-44 md:w-56 pointer-events-none z-20 animate-float-slow" style={{ transform: 'translateX(-50px)' }}>
            <img
              src={clouds.c5}
              alt="Cloud Bottom Left"
              className="w-full h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
            />
          </div>

          {/* Overlapping Cloud: Bottom-Right overlapping Pillar (Cloud 4) */}
          <div className="absolute -bottom-7 sm:-bottom-10 md:-bottom-13 right-[-1%] sm:right-[1%] md:right-[3%] w-28 sm:w-38 md:w-50 pointer-events-none z-20 animate-float-reverse">
            <img
              src={clouds.c4}
              alt="Cloud Bottom Right"
              className="w-full h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
            />
          </div>

          {/* Glowing Sky Lantern 1 (Bottom Left): Large glowing lantern anchored at bottom-left edge */}
          <div
            onClick={handleLanternClick}
            className="absolute top-[25px] -left-[180px] sm:-left-[204px] md:-left-[220px] lg:-left-[236px] z-30 cursor-pointer animate-float transition-all duration-300 hover:scale-110 group"
            title="Click to ignite lantern"
          >
            <img
              src={lanternL1}
              alt="Glowing Sky Lantern Bottom Left"
              className={`w-24 sm:w-32 md:w-42 lg:w-48 h-auto object-contain -rotate-[14deg] transition-all duration-300 ${lanternIgnited
                ? 'filter drop-shadow-[0_0_45px_rgba(255,230,80,1)] brightness-125'
                : 'filter drop-shadow-[0_0_28px_rgba(255,200,30,0.9)] group-hover:drop-shadow-[0_0_42px_rgba(255,225,60,1)]'
                }`}
            />
          </div>

        </div>
      </main>

      

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL POPUP                                                   */}
      {/* ========================================================================= */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-gradient-to-b from-[#221c5e] to-[#12113e] border-2 border-amber-400/60 rounded-2xl max-w-lg w-full p-6 sm:p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] transform transition-all animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-amber-300 hover:text-white bg-black/30 hover:bg-amber-500/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Header */}
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-wider mb-1 uppercase">
              {activeModal.title}
            </h3>
            <p className="text-sm font-semibold text-cyan-300 tracking-wide mb-4 uppercase">
              {activeModal.tagline}
            </p>

            {/* Body */}
            <div className="border-t border-amber-400/20 pt-4 text-sm sm:text-base text-gray-200 leading-relaxed">
              {activeModal.content}
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold tracking-wide shadow-md transition-all transform hover:scale-105 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
