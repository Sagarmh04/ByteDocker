"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface HoverInvertTextProps {
  text: string;
  baseColor: string;
  invertColor: string;
}

const HOVER_RADIUS = 80; // Controls the size of the invert effect circle

export function HoverInvertText({ text, baseColor, invertColor }: HoverInvertTextProps) {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative grid cursor-pointer place-items-center"
      onMouseLeave={() => setMousePosition({ x: -1000, y: -1000 })}
    >
      {/* Layer 1: The static base text */}
      <h1
        className="col-start-1 row-start-1 text-4xl leading-tight drop-shadow-lg lg:text-5xl"
        style={{ fontFamily: "'Quicksand Bold', sans-serif", color: baseColor }}
      >
        {text}
      </h1>

      {/* Layer 2: The inverted text, revealed by the circular clip-path */}
      <h1
        className="col-start-1 row-start-1 text-4xl leading-tight drop-shadow-lg lg:text-5xl"
        style={{
          fontFamily: "'Quicksand Bold', sans-serif",
          color: invertColor,
          clipPath: `circle(${HOVER_RADIUS}px at ${mousePosition.x}px ${mousePosition.y}px)`,
          transition: "clip-path 0.1s ease-out", // Smooths the circle's movement
        }}
      >
        {text}
      </h1>
    </div>
  );
}