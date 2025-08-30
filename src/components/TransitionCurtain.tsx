"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useAnimation } from "@/context/AnimationContext"
import { useMotion } from "@/context/MotionContext"
import { useTheme } from "next-themes"

const curtainColors = {
  light: {
    highlight: "#4169E1",
    text: "#F8F9FA",
  },
  dark: {
    highlight: "#FFD300",
    text: "#000000",
  },
}

export function TransitionCurtain() {
  const { isAnimating, pageTitle, completeTransition } = useAnimation()
  const motionSafe = useMotion()
  const { resolvedTheme } = useTheme()

  const currentColors = resolvedTheme === "dark" ? curtainColors.dark : curtainColors.light

  const textClipVariants = {
    hidden: { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
    visible: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
    exit: { clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)" },
  }

  const panelVariants = {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
    exit: { x: "100%" },
  }

  return (
    <AnimatePresence>
      {isAnimating && (
        <>
          {/* 1. The Inverted Text Layer */}
<motion.div
            className="fixed top-1 left-0 w-full p-6 z-[1000] pointer-events-none"
            style={{ color: currentColors.text }}
            variants={textClipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              duration: motionSafe ? 0.5 : 0,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            {/* Add py-1 and leading-none to perfectly match the original brand's style */}
            <span className="text-4xl font-bold py-1 leading-none">ByteDocker</span>
          </motion.div>

          {/* 2. The Sliding Curtain Layer */}
          <motion.div
            // Increased z-index to sit just below the inverted text
            className="fixed top-0 left-0 w-full h-full z-[999] flex items-center justify-center"
            style={{ backgroundColor: currentColors.highlight }}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={() => completeTransition()}
            transition={{
              duration: motionSafe ? 0.5 : 0,
              ease: [0.76, 0, 0.24, 1],
            }}
          >
            {/* Centered Page Title */}
            <motion.p
              // Added relative and z-10 to stack it above its parent's background
              className="relative z-[999] text-6xl md:text-8xl font-bold text-center"
              style={{ color: currentColors.text }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: motionSafe ? 0.3 : 0,
                delay: motionSafe ? 0.2 : 0,
              }}
            >
              {pageTitle === "" ? "ByteDocker" : pageTitle}
            </motion.p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}