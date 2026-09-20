import React, { useEffect, useRef, useState } from "react"

import characterImg from "../assets/about/character.png"
import khelotsavTitle from "../assets/about/KHELOTSAV.png"

export default function AboutSection() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .about-character-col { display: none !important; }
        .about-text-col { padding: clamp(3rem, 8vw, 5rem) clamp(1.5rem, 6vw, 4rem) !important; }
        .about-title-img { width: 90% !important; }
        .about-body-text { font-size: clamp(1.2rem, 4.5vw, 1.6rem) !important; line-height: 1.9 !important; }
      }
    `}</style>
    <section
      ref={sectionRef}
      id="about"
      style={{
        backgroundColor: "#3731AB",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        minHeight: "100vh",
      }}
    >
      {/* ── LEFT: character fills full height, lighten blend removes grey ── */}
      <div
        className="about-character-col"
        style={{
          position: "relative",
          flexShrink: 0,
          width: "47%",
          minHeight: "100vh",
          overflow: "hidden",
          transition: "opacity 0.95s ease-out, transform 0.95s ease-out",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateX(0)" : "translateX(-56px)",
        }}
      >
        <img
          src={characterImg}
          alt="Khelotsav Sports Character"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            /*
             * objectPosition "20% center": shifts the crop window so the
             * illustrated character (left ~40% of the wide PNG) fills the
             * column, not the blank grey right half.
             */
            objectPosition: "20% center",
            userSelect: "none",
            mixBlendMode: "lighten",
          }}
          draggable={false}
        />
      </div>

      {/* ── RIGHT: KHELOTSAV logo + yellow body text, vertically centered ── */}
      <div
        className="about-text-col"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(2rem, 4vw, 5rem) clamp(2rem, 5vw, 6rem)",
          transition: "opacity 0.95s ease-out 0.15s, transform 0.95s ease-out 0.15s",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateX(0)" : "translateX(56px)",
        }}
      >
        {/* KHELOTSAV title logo — sized to match mockup proportions */}
        <img
          className="about-title-img"
          src={khelotsavTitle}
          alt="KHELOTSAV"
          style={{
            width: "min(520px, 90%)",
            height: "auto",
            objectFit: "contain",
            marginBottom: "clamp(1.5rem, 3.5vw, 3rem)",
            userSelect: "none",
          }}
          draggable={false}
        />

        {/* Body paragraph — #FABF01, Poppins semibold, large, centered */}
        <p
          className="about-body-text"
          style={{
            color: "#FABF01",
            fontFamily: "Poppins, Montserrat, Inter, sans-serif",
            fontWeight: 600,
            fontSize: "clamp(1.05rem, 1.75vw, 1.75rem)",
            lineHeight: 1.8,
            textAlign: "center",
            maxWidth: "580px",
            margin: 0,
          }}
        >
          Khelotsav, is a day wrapped up with sports, games and a lot more fun.
          From indoors to the mega outdoor events, everything comes under one roof.
          Khelotsav is an opportunity to shine on the field and promises to be a day
          filled with a lineup of exhilarating games, competitiveness and sportsmanship.
        </p>
      </div>

    </section>
    </>
  )
}
