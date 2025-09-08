"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { db } from "@/services/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import CustomMarkdownRenderer from "@/components/CustomMarkdownRenderer";
import ParallaxImage from "@/components/ParallaxImage";

// A custom hook to check for screen size for responsiveness
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
};

// Colors remain the same
const stylePalettes = {
  light: {
    background: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    error: '#EF4444',
    cardBackground: '#F3F4F6',
    gradient1_start: '#8B5CF6',
    gradient1_end: '#EC4899',
    gradient2_start: '#3B82F6',
    gradient2_end: '#A855F7',
    accent1: '#EC4899',
    accent2: '#60A5FA',
    techPillBg: 'rgba(229, 231, 235, 0.5)',
    techPillBorder: '#D1D5DB',
  },
  dark: {
    background: '#000000',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    error: '#F87171',
    cardBackground: '#1F2937',
    gradient1_start: '#A78BFA',
    gradient1_end: '#F472B6',
    gradient2_start: '#60A5FA',
    gradient2_end: '#C4B5FD',
    accent1: '#F472B6',
    accent2: '#3B82F6',
    techPillBg: 'rgba(55, 65, 81, 0.5)',
    techPillBorder: '#4B5563',
  }
};

interface ServiceDetail {
  id: string;
  title: string;
  src: string;
  images: string[];
  description: string;
  techStack: string[];
  updatedAt: number;
}
interface LogoItem {
  id: string;
  title: string;
  url: string;
}
// Create a specific type from your existing stylePalettes object.
// This ensures the type is always in sync with your colors.
type ColorPalette = typeof stylePalettes.light;

// A simple, styled loading component with the correct type
const LoadingComponent = ({ colors }: { colors: ColorPalette }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: colors.background, color: colors.textPrimary }}>
    <p style={{ fontSize: '1.25rem' }}>Loading premium service details...</p>
  </div>
);

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const [detail, setDetail] = useState<ServiceDetail | null>(null);
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // This now only sets mounted to true. It's the key to fixing the hydration error.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!slug) return;
    async function fetchData() {
      setLoading(true);
      try {
        const docRef = doc(db, "serviceDetails", slug);
        const snap = await getDoc(docRef);
        if (snap.exists()) setDetail(snap.data() as ServiceDetail);
        
        const logosSnap = await getDocs(collection(db, "logos"));
        setLogos(logosSnap.docs.map(d => ({ id: d.id, ...d.data() } as LogoItem)));
      } catch (err) {
        console.error("Error loading service page:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  // FIX: Return null on the server and before mounting on the client.
  // This completely prevents the hydration mismatch error.
  if (!mounted) {
    return null;
  }

  const colors = stylePalettes[resolvedTheme === 'dark' ? 'dark' : 'light'];

  if (loading) {
    return <LoadingComponent colors={colors} />;
  }

  if (!detail) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: colors.background, color: colors.error }}>
        <p style={{ fontSize: '1.25rem' }}>Service not found.</p>
      </div>
    );
  }

  const selectedLogos = logos.filter((l) => (detail.techStack ?? []).includes(l.id));

  return (
    <div style={{ backgroundColor: colors.background, color: colors.textPrimary, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '2rem 1rem' : '4rem 1rem', display: 'flex', flexDirection: 'column', gap: isMobile ? '3rem' : '4rem' }}>
        
        {/* LAYOUT FIX: Thumbnail is now at the top */}
        <div style={{ width: '100%', maxWidth: '1024px', margin: '0 auto', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', aspectRatio: "16/9" }}>
          <ParallaxImage src={detail.src} alt={detail.title} />
        </div>

        <section style={{ textAlign: 'center' }}>
<h1
  style={{
    // RESPONSIVE FIX: Title size is now smaller on mobile
    fontSize: isMobile ? '2.25rem' : '3.5rem',
    fontWeight: 800,
    letterSpacing: '-0.05em',
  }}
>
  {detail.title}
</h1>
        </section>

        <section style={{
            position: 'relative',
            // RESPONSIVE FIX: Added more padding to the description
            padding: isMobile ? '2rem 1.5rem' : '3rem 2.5rem',
            backgroundColor: colors.cardBackground,
            borderRadius: '1.5rem',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          }}>
          <div style={{ color: colors.textSecondary, wordWrap: 'break-word' }}>
            <CustomMarkdownRenderer content={detail.description} colors={colors} />
          </div>
        </section>

        {selectedLogos.length > 0 && (
          <section style={{ padding: '3rem 1rem', background: `linear-gradient(to bottom right, ${colors.gradient2_start}, ${colors.gradient2_end})`, borderRadius: '1.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 'bold', marginBottom: '3rem', color: '#FFFFFF' }}>
              Technologies We Master
              <span style={{ display: 'block', width: '6rem', height: '4px', backgroundColor: colors.accent2, margin: '1rem auto 0', borderRadius: '2px' }}></span>
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
              {selectedLogos.map((logo) => (
                <div key={logo.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', backgroundColor: colors.techPillBg, backdropFilter: 'blur(10px)', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: `1px solid ${colors.techPillBorder}` }}>
                  <div style={{ width: '3rem', height: '3rem', position: 'relative' }}>
                    <Image src={logo.url} alt={logo.title} fill style={{ objectFit: 'contain' }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#FFFFFF', marginTop: '0.25rem' }}>{logo.title}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {detail.images && detail.images.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 'bold', textAlign: 'center', color: colors.accent1 }}>
              Our Creative Vision
              <span style={{ display: 'block', width: '6rem', height: '4px', backgroundColor: colors.accent1, margin: '1rem auto 0', borderRadius: '2px' }}></span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
              {detail.images.map((img, i) => (
                <div key={i} style={{ width: '100%', maxWidth: '1024px' }}>
                  <ParallaxImage src={img} alt={`Gallery image ${i + 1}`} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}