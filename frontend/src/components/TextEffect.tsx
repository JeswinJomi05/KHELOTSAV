import { CSSProperties, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import carnavale from '../../assets/Home/carnavale.png';
import dhwani26 from '../../assets/Home/dhwani26.png';
import khelotsav from '../../assets/Home/KHELOTSAV.png';

export type TextLoopDirection = 'forward' | 'reverse';

export interface TextLoopProps {
  speed?: number;
  direction?: TextLoopDirection;
  ribbonColor?: string;
  ribbonHeight?: number;
  imageHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ─── images that scroll in the ribbon ────────────────────────────────────────
const IMAGES = [
  { src: carnavale,  alt: 'Carnavale' },
  { src: dhwani26,   alt: 'Dhwani 26' },
  { src: khelotsav,  alt: 'Khelotsav' },
];

// Duplicate items enough times to fill the track and loop seamlessly
const REPEATS = 6;

const TextLoop = ({
  speed       = 90,
  direction   = 'forward',
  ribbonColor = '#1F1D66',
  ribbonHeight = 110,
  imageHeight  = 56,
  gap          = 64,
  pauseOnHover = true,
  className    = '',
  style        = {},
}: TextLoopProps) => {
  const rootRef  = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Wait one frame so the browser has rendered the items and we can measure
    const raf = requestAnimationFrame(() => {
      // Measure the exact pixel distance from the start of item[0] to item[IMAGES.length].
      // This is the true "one set width" inclusive of all gaps, regardless of padding.
      const item0 = track.children[0] as HTMLElement | null;
      const itemN = track.children[IMAGES.length] as HTMLElement | null;
      if (!item0 || !itemN) return;

      const oneSetWidth = itemN.offsetLeft - item0.offsetLeft;
      if (!oneSetWidth) return;

      const duration = oneSetWidth / speed;

      // Start at 0 and animate exactly one set width so the loop is pixel-perfect
      gsap.set(track, { x: 0 });

      const tween = gsap.to(track, {
        x: direction === 'reverse' ? oneSetWidth : -oneSetWidth,
        duration,
        ease: 'none',
        repeat: -1,
      });

      tweenRef.current = tween;

      const root = rootRef.current;
      const pause  = () => tween.pause();
      const resume = () => tween.resume();

      if (pauseOnHover && root) {
        root.addEventListener('pointerenter', pause);
        root.addEventListener('pointerleave', resume);
      }

      return () => {
        tween.kill();
        if (pauseOnHover && root) {
          root.removeEventListener('pointerenter', pause);
          root.removeEventListener('pointerleave', resume);
        }
      };
    });

    return () => cancelAnimationFrame(raf);
  }, [speed, direction, pauseOnHover]);

  // Build a flat list of items repeated REPEATS times
  const items = Array.from({ length: REPEATS }, (_, i) =>
    IMAGES.map((img, j) => ({ ...img, key: `${i}-${j}` }))
  ).flat();

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden select-none ${className}`.trim()}
      style={{
        background: ribbonColor,
        height: ribbonHeight,
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
      aria-label="Image marquee"
    >
      {/* subtle edge fade masks */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
          background: `linear-gradient(to right, ${ribbonColor} 0%, transparent 8%, transparent 92%, ${ribbonColor} 100%)`,
        }}
      />

      {/* scrolling track */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${gap}px`,
          willChange: 'transform',
          paddingInline: `${gap}px`,
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {items.map(({ src, alt, key }) => (
          <img
            key={key}
            src={src}
            alt={alt}
            style={{
              height: imageHeight,
              width: 'auto',
              objectFit: 'contain',
              flexShrink: 0,
              display: 'inline-block',
              filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.4))',
            }}
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
};

export default TextLoop;
