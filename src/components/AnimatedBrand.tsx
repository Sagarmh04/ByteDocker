"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedLink } from "./AnimatedLink";

interface AnimatedBrandProps {
  highlightColor: string;
  textColor: string;
}

export const AnimatedBrand: React.FC<AnimatedBrandProps> = ({ highlightColor, textColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AnimatedLink href="/" title="">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        // Use grid and place-items-center for robust centering
        className="relative grid place-items-center text-4xl font-bold cursor-pointer"
      >
        {/* Layer 1: The static base text */}
        <span
          // Added py-1 and leading-none for precise vertical alignment
          className="col-start-1 row-start-1 py-1 leading-none"
          style={{ color: textColor }}
        >
          ByteDocker
        </span>

        {/* Layer 2: The animated gradient wave */}
        <motion.span
          // Ensure styles are identical on this layer
          className="col-start-1 row-start-1 pointer-events-none py-1 leading-none"
          style={{
            backgroundImage: `linear-gradient(90deg, ${highlightColor}, ${highlightColor})`,
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{
            backgroundSize: "0% 100%",
            backgroundPosition: "left",
          }}
          animate={{
            backgroundSize: isHovered ? "100% 100%" : "0% 100%",
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          ByteDocker
        </motion.span>
      </div>
    </AnimatedLink>
  );
};