"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

type ParallaxImageProps = {
  src: string;
  alt: string;
};

export default function ParallaxImage({ src, alt }: ParallaxImageProps) {
  // 1. Create a reference to the container element
  const ref = useRef(null);

  // 2. Track scroll progress relative to the container
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"], // Animate from when the top of the element hits the bottom of the viewport, to when the bottom of the element hits the top.
  });

  // 3. Transform the scroll progress (0 to 1) into a translateY value
  // The image will move from -20% to 20% of its height as it scrolls through the viewport.
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <div
      ref={ref}
      className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg"
    >
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}