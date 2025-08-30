"use client"

import { useState, useEffect, useRef } from "react"
import { ThemeToggle } from "./theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { useMotion } from "@/context/MotionContext"
import { useTheme } from "next-themes"
import { AnimatedBrand } from "./AnimatedBrand"
import { AnimatedNavLink } from "./AnimatedNavLink"
import { AnimatedLink } from "./AnimatedLink"

const menuColors = {
  light: {
    highlight: "#4169E1",
    text: "#000000",
    icon: "#111111",
    background: "#FFFFFF",
  },
  dark: {
    highlight: "#FFD300",
    text: "#FFFFFF",
    icon: "#FFFFFF",
    background: "#1A1A1A",
  },
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showFloating, setShowFloating] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [headerHeight, setHeaderHeight] = useState(0)

  const headerRef = useRef<HTMLElement | null>(null)

  const motionSafe = useMotion()
  const { resolvedTheme } = useTheme()

  const currentColors = resolvedTheme === "dark" ? menuColors.dark : menuColors.light

  const navLinks = [
    { name: "Services", href: "/services" },
    { name: "Clients", href: "/clients" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Capture original header height
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [mounted])

  // Scroll detection logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
        // scrolling down -> hide floating
        setShowFloating(false)
      } else if (currentScrollY < lastScrollY && currentScrollY > headerHeight) {
        // scrolling up -> show floating
        setShowFloating(true)
      } else if (currentScrollY <= headerHeight) {
        // when original header is visible
        setShowFloating(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY, headerHeight])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const menuVariants = {
    hidden: { y: "-100%" },
    visible: { y: "0%" },
  }

  if (!mounted) {
    return (
      <header className="w-full p-6">
        <div className="flex items-center justify-between">
          <div className="text-4xl font-bold text-transparent">ByteDocker</div>
        </div>
      </header>
    )
  }

  return (
    <>
      {/* Original header (scrolls away with page) */}
      <header
        ref={headerRef}
        className="w-full p-6"
        style={{ backgroundColor: currentColors.background }}
      >
        <div className="flex items-center justify-between">
          <AnimatedBrand highlightColor={currentColors.highlight} textColor={currentColors.icon} />

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <AnimatedNavLink
                key={link.name}
                href={link.href}
                title={link.name}
                highlightColor={currentColors.highlight}
              >
                {link.name}
              </AnimatedNavLink>
            ))}
            <ThemeToggle />
          </nav>

          <button
            onClick={toggleMenu}
            className="md:hidden z-50"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5" style={{ backgroundColor: currentColors.icon }}></span>
              <span className="block w-6 h-0.5" style={{ backgroundColor: currentColors.icon }}></span>
              <span className="block w-6 h-0.5" style={{ backgroundColor: currentColors.icon }}></span>
            </div>
          </button>
        </div>
      </header>

      {/* Floating header (appears only when scrolling up) */}
      <AnimatePresence>
        {showFloating && (
          <motion.header
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: motionSafe ? 0.3 : 0 }}
            className="fixed top-0 left-0 w-full p-6 z-50 shadow-md"
            style={{ backgroundColor: currentColors.background }}
          >
            <div className="flex items-center justify-between">
              <AnimatedBrand highlightColor={currentColors.highlight} textColor={currentColors.icon} />

              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <AnimatedNavLink
                    key={link.name}
                    href={link.href}
                    title={link.name}
                    highlightColor={currentColors.highlight}
                  >
                    {link.name}
                  </AnimatedNavLink>
                ))}
                <ThemeToggle />
              </nav>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            style={{ backgroundColor: currentColors.highlight }}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: motionSafe ? 0.3 : 0, ease: "easeInOut" }}
          >
            <nav className="flex flex-col items-center gap-8" style={{ color: currentColors.text }}>
              {navLinks.map((link) => (
                <AnimatedLink
                  key={link.name}
                  title={link.name}
                  href={link.href}
                  className="text-4xl"
                  onClick={toggleMenu}
                >
                  {link.name}
                </AnimatedLink>
              ))}
              <div className="mt-8">
                <ThemeToggle />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
