"use client";

import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { AnimatedLink } from "../AnimatedLink";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

// --- Color Configuration ---
const componentColors = {
  light: {
    text: "#111111",
    subtleText: "#4B5563",
    glow: "#4169E1",
    image: "/Background/LightThemeHomeHeroBackground.PNG",
  },
  dark: {
    text: "#FFFFFF",
    subtleText: "#9CA3AF",
    glow: "#FFD300",
    image: "/Background/DarkThemeHomeHeroBackground.JPG",
  },
};

// --- MAIN COMPONENT ---
export function ImmersiveIntro() {
  const { resolvedTheme } = useTheme();
  const targetRef = useRef<HTMLDivElement | null>(null);

  // Scroll-based transforms (for desktop parallax)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const currentColors =
    resolvedTheme === "dark" ? componentColors.dark : componentColors.light;
  const backgroundImage = `url(${currentColors.image})`;

  const headingText = "Welcome to Bytedocker";
  const headingText2 =
    "your trusted technology partner dedicated to transforming businesses through powerful digital solutions.";
  const captionText =
    "Our passion for design, coding, and interactive experiences uniquely positions us in the web development landscape.";

  return (
    <>
      {/* Custom Fonts */}
      <style jsx global>{`
        @font-face {
          font-family: "Quicksand Bold";
          src: url("/fonts/Quicksand-Bold.ttf") format("truetype");
          font-weight: bold;
          font-style: normal;
        }
        @font-face {
          font-family: "Quicksand Medium";
          src: url("/fonts/Quicksand-Medium.ttf") format("truetype");
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: "Quicksand Light";
          src: url("/fonts/Quicksand-Light.ttf") format("truetype");
          font-weight: 300;
          font-style: normal;
        }
      `}</style>

      {/* Desktop View */}
      <section ref={targetRef} className="relative hidden h-screen sm:block">
        <div className="sticky top-0 flex h-full items-center justify-center overflow-hidden">
          {/* Background with parallax */}
          <motion.div
            style={{ backgroundImage, scale: backgroundScale }}
            className="absolute inset-0 z-0 bg-cover bg-center"
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </motion.div>

          {/* Foreground text */}
          <motion.div
            style={{ y: textY }}
            className="relative z-20 text-center px-8"
          >
            <div className="mx-auto max-w-4xl text-white">
              <HoverSpotlightHeading text={headingText} />

              <h4
                className="text-4xl leading-tight drop-shadow-lg"
                style={{ fontFamily: "'Quicksand Medium', sans-serif" }}
              >
                {headingText2}
              </h4>

              <p
                className="mt-8 text-lg leading-relaxed text-neutral-200 drop-shadow-md"
                style={{ fontFamily: "'Quicksand Medium', sans-serif" }}
              >
                {captionText}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row justify-center">
              <GlowingButton href="/about" title="About">
                About Us
              </GlowingButton>
              <GlowingButton href="/contact" title="Contact">
                Contact Us
              </GlowingButton>
            </div>
          </motion.div>

          {/* Marquee */}
          <div className="pointer-events-none absolute bottom-10 left-0 z-10 w-full">
            <MarqueeText color={currentColors.text} />
          </div>
        </div>
      </section>

      {/* Mobile View */}
      <MobileView />
    </>
  );
}

// --- MOBILE VIEW ---
function MobileView() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="relative h-screen w-full" />;

  const currentConfig =
    resolvedTheme === "dark" ? componentColors.dark : componentColors.light;

  const mainHeading = "Welcome to ByteDocker";
  const semiCaption =
    "Your trusted technology partner dedicated to transforming businesses through powerful digital solutions.";
  const smallCaption =
    "Our passion for design, coding, and interactive experiences uniquely positions us in the web development landscape.";

  const FADE_UP_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" } },
  };

  return (
    <section className="relative flex h-screen w-full flex-col justify-center overflow-hidden sm:hidden">
      {/* Static background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${currentConfig.image})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Animated text content */}
      <motion.div
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
        }}
        className="relative z-20 flex flex-col items-center justify-center px-4 text-center"
      >
        <motion.h1
          variants={FADE_UP_VARIANTS}
          className="text-4xl leading-tight text-white drop-shadow-lg"
          style={{ fontFamily: "'Quicksand Bold', sans-serif" }}
        >
          {mainHeading}
        </motion.h1>
        <motion.p
          variants={FADE_UP_VARIANTS}
          className="mt-6 max-w-md text-base leading-relaxed text-neutral-200 drop-shadow-md"
          style={{ fontFamily: "'Quicksand Medium', sans-serif" }}
        >
          {semiCaption}
        </motion.p>
        

        {/* Buttons */}
        <motion.div
          variants={FADE_UP_VARIANTS}
          className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
        >
          <GlowingButton href="/about" title="About">
            About Us
          </GlowingButton>
          <GlowingButton href="/contact" title="Contact">
            Contact Us
          </GlowingButton>
        </motion.div>
      </motion.div>

      {/* Marquee */}
      <div className="pointer-events-none absolute bottom-4 left-0 z-10 w-full">
        <MarqueeText color={currentConfig.text} />
      </div>
    </section>
  );
}

// --- HELPER COMPONENTS ---
const GlowingButton = ({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) => {
  const { resolvedTheme } = useTheme();
  const glowColor =
    resolvedTheme === "dark"
      ? componentColors.dark.glow
      : componentColors.light.glow;

  return (
    <AnimatedLink
      href={href}
      title={title}
      className="relative inline-flex items-center justify-center rounded-full border border-white/30 bg-black/40 px-8 py-3 text-lg font-medium text-white backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_0_20px] hover:shadow-white/30"
      style={{ fontFamily: "'Quicksand Medium', sans-serif" }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 0px ${glowColor}, inset 0 0 0px ${glowColor}`,
          transition: "box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      <span className="relative">{children}</span>
    </AnimatedLink>
  );
};

const MarqueeText = ({ color }: { color: string }) => {
  const marqueeVariants: Variants = {
    animate: {
      x: ["0%", "-100%"],
      transition: {
        x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" },
      },
    },
  };

  return (
    <div className="flex w-full overflow-hidden">
      <motion.div
        className="flex flex-shrink-0"
        variants={marqueeVariants}
        animate="animate"
      >
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex whitespace-nowrap">
            {[...Array(2)].map((_, j) => (
              <span
                key={j}
                className="mx-12 block text-9xl font-extrabold uppercase opacity-10"
                style={{ color }}
              >
                BYTEDOCKER
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

function HoverSpotlightHeading({ text }: { text: string }) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLHeadingElement | null>(null);
  const overlayRef = useRef<HTMLSpanElement | null>(null);

  const [hoverColor, setHoverColor] = useState("#cdb749de");
  const [baseColor, setBaseColor] = useState("#111111");

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setHoverColor("#4169E1");
      setBaseColor("#FFFFFF");
    } else {
      setHoverColor("#cdb749de");
      setBaseColor("#FFFFFF");
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const el = containerRef.current;
    const overlay = overlayRef.current;
    if (!el || !overlay) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      raf = requestAnimationFrame(() => {
        overlay.style.setProperty("--x", `${x}px`);
        overlay.style.setProperty("--y", `${y}px`);
      });
    };

    const onLeave = () => {
      overlay.style.setProperty("--x", `-9999px`);
      overlay.style.setProperty("--y", `-9999px`);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="flex justify-center items-center w-full">
      <h1
        ref={containerRef}
        className="relative inline-flex whitespace-nowrap text-8xl leading-tight drop-shadow-lg select-none text-center"
        style={{ fontFamily: "'Quicksand Bold', sans-serif", color: baseColor }}
      >
        {text}
        <span
          ref={overlayRef}
          aria-hidden
          className="absolute inset-0 pointer-events-none hidden md:block"
          style={{
            WebkitMaskImage:
              "radial-gradient(150px circle at var(--x, -9999px) var(--y, -9999px), rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)",
            maskImage:
              "radial-gradient(150px circle at var(--x, -9999px) var(--y, -9999px), rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)",
            backgroundImage: `linear-gradient(${hoverColor}, ${hoverColor})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 12px ${hoverColor}90)`,
            transition:
              "mask-position 0.25s ease, -webkit-mask-position 0.25s ease, filter 0.3s ease",
          }}
        >
          {text}
        </span>
      </h1>
    </div>
  );
}
