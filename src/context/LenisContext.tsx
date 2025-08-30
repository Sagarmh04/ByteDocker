"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from "react"
import Lenis from "lenis"

const LenisContext = createContext<Lenis | null>(null)

export const useLenis = () => useContext(LenisContext)

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const newLenis = new Lenis()
    setLenis(newLenis)

    return () => {
      newLenis.destroy()
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  )
}