"use client"

import { useEffect, useRef, useState } from 'react';

// ... (interface and easing function remain the same) ...
interface AutomatedTextPressureProps {
  text: string;
  textColor: string;
  duration?: number;
}
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;


const AutomatedTextPressure: React.FC<AutomatedTextPressureProps> = ({
  text,
  textColor,
  duration = 2000,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  const virtualCursorRef = useRef({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(24);
  const chars = text.split('');

  // ... (dist function and other effects remain the same) ...
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    const setSize = () => {
      if (!containerRef.current || !titleRef.current) return;
      const { width: containerW } = containerRef.current.getBoundingClientRect();
      const newFontSize = Math.max(containerW / (chars.length / 1.5), 24);
      setFontSize(newFontSize);
    };

    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [text]);

  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      const elapsedTime = performance.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      if (titleRef.current) {
        const titleRect = titleRef.current.getBoundingClientRect();
        const maxDist = titleRect.width / 2;

        virtualCursorRef.current.x = titleRect.left + (titleRect.width * easedProgress);
        virtualCursorRef.current.y = titleRect.top + titleRect.height / 2;

        spansRef.current.forEach((span) => {
          if (!span) return;
          const rect = span.getBoundingClientRect();
          const charCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          const d = dist(virtualCursorRef.current, charCenter);

          const getAttr = (distance: number, minVal: number, maxVal: number) => {
            const val = maxVal - Math.abs((maxVal * distance) / maxDist);
            return Math.max(minVal, val + minVal);
          };

          const wdth = Math.floor(getAttr(d, 5, 150));
          const wght = Math.floor(getAttr(d, 100, 900));

          span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
        });
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [duration, fontSize]);

  return (
    // The only change is removing height: '100%' to fix centering
    <div ref={containerRef} style={{ width: '100%' }}>
      <style>{`
        @font-face {
          font-family: 'Compressa VF';
          src: url('https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2');
          font-style: normal;
        }
      `}</style>
      <h1
        ref={titleRef}
        className="flex justify-between"
        style={{
          fontFamily: 'Compressa VF',
          fontSize: fontSize,
          lineHeight: 1,
          margin: 0,
          textAlign: 'center',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          width: '100%',
          color: textColor,
        }}
      >
        {chars.map((char, i) => (
          <span key={i} ref={(el) => { spansRef.current[i] = el; }} style={{ display: 'inline-block' }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default AutomatedTextPressure;