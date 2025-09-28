"use client";

import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { AnimatedLink } from "../AnimatedLink";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

// --- Color Configuration (Updated) ---
const componentColors = {
  light: {
    text: "#111111",
    subtleText: "#4B5563",
    glow: "#4169E1",
    video: "/Background/beige.mp4",
    loaderBg: "#FFFFFF",
    loaderText: "#111111",
  },
  dark: {
    text: "#FFFFFF",
    subtleText: "#9CA3AF",
    glow: "#FFD300",
    video: "/Background/Dark.mp4",
    loaderBg: "#000000",
    loaderText: "#FFFFFF",
  },
};

// --- MAIN COMPONENT ---
export function ImmersiveIntro() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isVideoLoaded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isVideoLoaded]);

  // Effect to reset loading state on theme change
  useEffect(() => {
    // When the theme changes, the video source will change.
    // This resets the loading state to false, triggering the loading screen
    // until the new video's onCanPlay event fires.
    setIsVideoLoaded(false);
  }, [resolvedTheme]);


  const currentColors =
    resolvedTheme === "dark" ? componentColors.dark : componentColors.light;

  const headingText = "Welcome to Bytedocker";
  const headingText2 =
    "your trusted technology partner dedicated to transforming businesses through powerful digital solutions.";
  const captionText =
    "Our passion for design, coding, and interactive experiences uniquely positions us in the web development landscape.";

  return (
    <>
      {!isVideoLoaded && (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: mounted ? currentColors.loaderBg : (resolvedTheme === 'dark' ? '#000' : '#FFF'),
        }}>
          <p style={{
              fontFamily: "'Quicksand Medium', sans-serif",
              fontSize: '1.25rem',
              color: mounted ? currentColors.loaderText : (resolvedTheme === 'dark' ? '#FFF' : '#000'),
          }}>
            Loading Experience...
          </p>
        </div>
      )}

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
      <section
        ref={targetRef}
        className="relative hidden h-screen sm:block"
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMouse({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onMouseLeave={() => setMouse(null)}
      >
        {mounted ? (
          <div className="sticky top-0 flex h-full items-center justify-center overflow-hidden">
            <motion.div
              style={{ scale: backgroundScale }}
              className="absolute inset-0 z-0"
            >
              <video
                key={currentColors.video} 
                autoPlay
                loop
                muted
                playsInline
                onCanPlay={() => setIsVideoLoaded(true)}
                className="absolute h-full w-full object-cover"
              >
                <source src={currentColors.video} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/40"></div>
            </motion.div>

            <motion.div
              style={{ y: textY }}
              className="relative z-20 text-center px-8"
            >
              <div className="mx-auto max-w-4xl text-white">
                <HoverSpotlightHeading text={headingText} mouse={mouse} />

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

              <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row justify-center">
                <GlowingButton href="/about" title="About">
                  About Us
                </GlowingButton>
                <GlowingButton href="/projects" title="Projects">
                  Our Projects
                </GlowingButton>
              </div>
            </motion.div>

            <div className="pointer-events-none absolute bottom-10 left-0 z-10 w-full">
              <MarqueeText color={currentColors.text} />
            </div>
          </div>
        ) : (
          <div className="relative h-screen w-full" />
        )}
      </section>

      {/* Mobile View */}
      <MobileView onVideoLoad={() => setIsVideoLoaded(true)} />
    </>
  );
}

// --- MOBILE VIEW ---
function MobileView({ onVideoLoad }: { onVideoLoad: () => void }) {
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
      <div className="absolute inset-0 z-0">
          <video
            key={currentConfig.video}
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={onVideoLoad}
            className="absolute h-full w-full object-cover"
          >
            <source src={currentConfig.video} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40"></div>
      </div>

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
        
        <motion.div
          variants={FADE_UP_VARIANTS}
          className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
        >
          <GlowingButton href="/about" title="About">
            About Us
          </GlowingButton>
          <GlowingButton href="/projects" title="Projects">
            Our Projects
          </GlowingButton>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute bottom-4 left-0 z-10 w-full">
        <MarqueeText color={currentConfig.text} />
      </div>
    </section>
  );
}

// --- HELPER COMPONENTS (No changes needed below this line) ---
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

function HoverSpotlightHeading({
  text,
  mouse,
}: {
  text: string;
  mouse?: { x: number; y: number } | null;
}) {
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
    const overlay = overlayRef.current;
    if (!overlay) return;

    if (mouse) {
      overlay.style.setProperty("--x", `${mouse.x}px`);
      overlay.style.setProperty("--y", `${mouse.y}px`);
    } else {
      overlay.style.setProperty("--x", `-9999px`);
      overlay.style.setProperty("--y", `-9999px`);
    }
  }, [mouse]);

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