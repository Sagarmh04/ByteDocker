"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div>
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md ${theme === 'light' ? 'bg-secondary' : 'bg-transparent'}`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md ${theme === 'dark' ? 'bg-secondary' : 'bg-transparent'}`}
      >
        Dark
      </button>
    </div>
  )
}