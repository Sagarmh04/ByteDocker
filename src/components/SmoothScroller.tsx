"use client"

import { useEffect } from "react"
import { useLenis } from "@/context/LenisContext"

export function SmoothScroller() {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return

    function raf(time: number) {
      lenis?.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }, [lenis])

  return null
}