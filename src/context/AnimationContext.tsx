"use client"

import { createContext, useState, useContext, ReactNode, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AnimationContextType {
  isAnimating: boolean
  pageTitle: string
  playTransition: (href: string, title: string) => void
  completeTransition: () => void
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [pageTitle, setPageTitle] = useState("")
  const [nextRoute, setNextRoute] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  // Effect to hide the curtain once the route has changed
  useEffect(() => {
    if (isAnimating && pathname === nextRoute) {
      setIsAnimating(false)
    }
  }, [pathname, nextRoute, isAnimating])

  const playTransition = (href: string, title: string) => {
    if (pathname === href) return // Don't animate if clicking the current page
    setIsAnimating(true)
    setPageTitle(title)
    setNextRoute(href)
  }

  const completeTransition = () => {
    // This is called by the curtain's onAnimationComplete
    if (nextRoute) {
      router.push(nextRoute)
    }
  }

  return (
    <AnimationContext.Provider value={{ isAnimating, pageTitle, playTransition, completeTransition }}>
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider")
  }
  return context
}