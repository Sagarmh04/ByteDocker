import { Variants } from "framer-motion";

// Variant for fading in elements
export const fadeIn = (
  direction: "up" | "down" | "left" | "right",
  type: "spring" | "tween" | "inertia", // Corrected type (removed "just")
  delay: number,
  duration: number
): Variants => {
  return {
    hidden: {
      y: direction === "up" ? 80 : direction === "down" ? -80 : 0,
      x: direction === "left" ? 80 : direction === "right" ? -80 : 0,
      opacity: 0,
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: "easeOut",
      },
    },
  };
};

// Variant for sliding in from left
export const slideInFromLeft = (
  type: "spring" | "tween" | "inertia", // Corrected type (removed "just")
  delay: number,
  duration: number
): Variants => {
  return {
    hidden: { x: -100, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: "easeOut",
      },
    },
  };
};

// Variant for sliding in from right
export const slideInFromRight = (
  type: "spring" | "tween" | "inertia", // Corrected type (removed "just")
  delay: number,
  duration: number
): Variants => {
  return {
    hidden: { x: 100, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: {
        type: type,
        delay: delay,
        duration: duration,
        ease: "easeOut",
      },
    },
  };
};

// Variant for staggered children animation (if needed for lists/grids)
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};