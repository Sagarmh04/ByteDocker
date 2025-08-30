"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedLink } from "./AnimatedLink";

interface AnimatedNavLinkProps {
  href: string;
  title: string; // Add this prop
  children: React.ReactNode;
  highlightColor: string;
}

export const AnimatedNavLink: React.FC<AnimatedNavLinkProps> = ({ href, title, children, highlightColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AnimatedLink href={href} title={title}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative text-lg"
      >
        <motion.span
          animate={{ filter: isHovered ? "brightness(1.2)" : "brightness(1)" }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.span>
        
        {/* Fluid Underline */}
        <motion.div
          className="absolute bottom-[-4px] left-0 right-0 h-[2px]"
          style={{ backgroundColor: highlightColor, transformOrigin: 'left' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.6, 0.01, -0.05, 0.95] }}
        />
      </motion.div>
    </AnimatedLink>
  );
};