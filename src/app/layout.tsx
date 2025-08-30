import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { AnimationProvider } from "@/context/AnimationContext"
import { TransitionCurtain } from "@/components/TransitionCurtain"
import { SmoothScroller } from "@/components/SmoothScroller"
import { Preloader } from "@/components/Preloader"
import { LenisProvider } from "@/context/LenisContext"
import { MotionProvider } from "@/context/MotionContext"

export const metadata: Metadata = {
  title: {
    template: '%s | ByteDocker',
    default: 'ByteDocker - Innovative Software Solutions',
  },
  description: 'ByteDocker provides cutting-edge software development and consulting services to scale your business.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MotionProvider>
            <AnimationProvider>
              <Preloader />
              <LenisProvider>
                <SmoothScroller />
                <Header />
                <main>{children}</main>
                <Footer />
              </LenisProvider>
              <TransitionCurtain />
            </AnimationProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}