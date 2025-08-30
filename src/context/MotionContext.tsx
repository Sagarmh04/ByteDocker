"use client"

import { createContext, useContext, ReactNode } from "react"
import { useReducedMotion } from "framer-motion"

const MotionContext = createContext<boolean | undefined>(undefined)

export const useMotion = () => {
  const context = useContext(MotionContext)
  if (context === undefined) {
    throw new Error("useMotion must be used within a MotionProvider")
  }
  return context
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion()
  const motionSafe = !prefersReducedMotion

  return (
    <MotionContext.Provider value={motionSafe}>
      {children}
    </MotionContext.Provider>
  )
}