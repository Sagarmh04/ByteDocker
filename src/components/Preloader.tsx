"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { useTheme } from "next-themes"
import AutomatedTextPressure from "./AutomatedTextPressure"

// --- Animation Control Variables ---
const TEXT_ANIMATION_DURATION = 2000; 
const PRELOADER_EXIT_SPEED = 2500;   

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const preloaderColors = {
    light: {
      background: "#4169E1",
      text: "#F8F9FA",
    },
    dark: {
      background: "#FFD300",
      text: "#000000",
    },
  }

  const currentColors = resolvedTheme === 'dark' ? preloaderColors.dark : preloaderColors.light

  useEffect(() => {
    if (!mounted) return
    if (sessionStorage.getItem("visited")) {
      setIsLoading(false)
      return
    }

    const timer = setTimeout(() => {
      setIsLoading(false)
      sessionStorage.setItem("visited", "true")
    }, TEXT_ANIMATION_DURATION)

    return () => clearTimeout(timer)
  }, [mounted])

  const slideUp: Variants = {
    initial: { y: 0 },
    exit: {
      y: "-100%",
      transition: {
        duration: PRELOADER_EXIT_SPEED / 1000,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  }

  // Only render after mounted to avoid hydration mismatch
  if (!mounted) return null

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[100] p-4"
          style={{ backgroundColor: currentColors.background }}
          variants={slideUp}
          initial="initial"
          exit="exit"
        >
          <AutomatedTextPressure
            text="ByteDocker"
            textColor={currentColors.text}
            duration={TEXT_ANIMATION_DURATION}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}