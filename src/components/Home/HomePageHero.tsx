"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Main Hero Section Component ---
export function HomePageHero() {
  const FADE_IN_ANIMATION_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    // 1. The main container is now relative to position its children
    <section className="relative w-full h-[80vh] min-h-[700px] flex items-center justify-center">
      
      {/* 2. The marquee now acts as the background layer */}
      <div className="absolute inset-0 z-0">
        <ThreeDMarqueeInternal />
      </div>

      {/* 3. The caption is now absolutely positioned and centered on top */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Subtle background scrim for readability */}
        
        <motion.div
          initial="hidden"
          animate="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } },
          }}
          className="relative z-10 flex flex-col items-center justify-center text-center"
        >
          <motion.h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
            variants={FADE_IN_ANIMATION_VARIANTS}
          >
            Welcome to Bytedocker
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300"
            variants={FADE_IN_ANIMATION_VARIANTS}
          >
            Your trusted technology partner dedicated to transforming businesses
            through powerful digital solutions.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// --- 3D Marquee Component (Integrated) ---
const ThreeDMarqueeInternal = () => {
  const images = [
      "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
      "https://assets.aceternity.com/animated-modal.png",
      "https://assets.aceternity.com/animated-testimonials.webp",
      // ... rest of your image URLs
  ];
  const chunkSize = Math.ceil(images.length / 4);
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize;
    return images.slice(start, start + chunkSize);
  });

  return (
    <div className="size-full overflow-hidden">
      <div className="flex size-full items-center justify-center">
        <div className="size-[1720px] shrink-0 scale-50 sm:scale-75 lg:scale-90">
          <div
            style={{ transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)" }}
            className="relative top-96 right-[50%] grid size-full origin-top-left grid-cols-4 gap-8 [transform-style:preserve-3d]"
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                animate={{ y: colIndex % 2 === 0 ? 100 : -100 }}
                transition={{
                  duration: colIndex % 2 === 0 ? 10 : 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                key={colIndex + "marquee"}
                className="flex flex-col items-start gap-8"
              >
                {subarray.map((image, imageIndex) => (
                  <motion.img
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    key={imageIndex + image}
                    src={image}
                    alt={`Image ${imageIndex + 1}`}
                    className="aspect-[970/700] rounded-lg object-cover ring-1 ring-black/10 hover:shadow-2xl"
                    width={970}
                    height={700}
                  />
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};