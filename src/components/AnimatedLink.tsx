"use client"

import Link from "next/link"
import { useAnimation } from "@/context/AnimationContext"
import React from "react"

interface AnimatedLinkProps {
  href: string
  title: string; // Changed from inferring to an explicit prop
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

export function AnimatedLink({ href, title, children, className, onClick }: AnimatedLinkProps) {
  const { playTransition } = useAnimation()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (onClick) {
      onClick(e)
    }
    // Now uses the explicit title prop, no more guesswork
    playTransition(href, title)
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}