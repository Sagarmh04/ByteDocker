"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import React, { useState, useEffect, CSSProperties } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation"; // Import the router
import { BookOpen, Layers } from "lucide-react";
import Servics from "@/components/Services/Services";
import { db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";

// Placeholder for mobile view. It will be rendered within a themed container.
const Services = () => (
    <div style={{ textAlign: 'center' }}>
        <Servics/>
    </div>
);

// --- MOCK FIRESTORE DATA (used as a fallback) ---
const MOCK_SERVICES_DATA = {
  cards: [
    { id: "it-consultation", title: "IT Consultation and Support", alt: "Consultation & Support", description: "Expert integrations and development of backends with frontends. We also assist with implementing authentication and other secure data management protocols.", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4-0.3.2" },
    { id: "web-dev", title: "Web & Mobile App Development", alt: "Web & Mobile Development", description: "We build high-performance, responsive, and scalable web and mobile applications tailored to your business needs using the latest technologies.", src: "https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4-0.3.2" },
    { id: "ui-ux-design", title: "UI/UX Design", alt: "UI/UX Design", description: "Crafting intuitive and beautiful user interfaces. Our design process is user-centric, ensuring a seamless and engaging experience for your audience.", src: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4-0.3.2" },
    { id: "cloud-solutions", title: "Cloud Solutions & DevOps", alt: "Cloud & DevOps", description: "Optimize your infrastructure with our cloud solutions. We provide services for cloud migration, management, and CI/CD pipeline implementation.", src: "https://images.unsplash.com/photo-1544256718-3b62ff04b2cb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4-0.3.2" },
  ],
};

const fetchServicesFromFirestore = async () => {
  try {
    const docRef = doc(db, "content", "services");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("No services data found.");
    }
    const cards = docSnap.data().cards;
    if (!Array.isArray(cards)) {
      throw new Error("Cards data is not an array.");
    }
    return cards;
  } catch (err) {
    console.error("Error fetching services:", err);
    return []; // Return empty on error, fallback will be handled in the component
  }
};


// --- TYPE DEFINITIONS ---
type Service = { id: string; title: string; alt: string; description: string; src: string; };
type GalleryImage = { id: string; src: string; alt: string; code: string; }; // Added 'id'

type Theme = {
  container: CSSProperties;
  title: CSSProperties;
  subtitle: CSSProperties;
  description: CSSProperties;
  card: CSSProperties;
  icon: CSSProperties;
  loader: { primary: string; secondary: string; };
  gallery: { gradient: string; textColor: string; };
};

// --- DYNAMIC THEME STYLES ---
const themes: { light: Theme; dark: Theme } = {
  light: {
    container: { background: '#f5f4f3', color: '#2D3748' },
    title: { color: '#2D3748' },
    subtitle: { color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.1em' },
    description: { color: '#4A5568' },
    card: { background: 'rgba(255, 255, 255, 0.7)' },
    icon: { color: '#3B82F6' },
    loader: { primary: '#3B82F6', secondary: '#E2E8F0' },
    gallery: { gradient: 'rgba(0, 0, 0, 0.7)', textColor: '#FFFFFF' },
  },
  dark: {
    container: { background: '#000000ff', color: '#E2E8F0' },
    title: { color: '#ffffffff' },
    subtitle: { color: '#63B3ED', textTransform: 'uppercase', letterSpacing: '0.1em' },
    description: { color: '#eef6ffff' },
    card: { background: 'rgba(2, 29, 76, 0.7)' },
    icon: { color: '#63B3ED' },
    loader: { primary: '#63B3ED', secondary: '#4A5568' },
    gallery: { gradient: 'rgba(0, 0, 0, 0.8)', textColor: '#FFFFFF' },
  }
};


// ============================================================================
// # 1. MAIN PAGE COMPONENT
// ============================================================================
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (resolvedTheme) setThemeLoaded(true);
  }, [resolvedTheme]);

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      let data = await fetchServicesFromFirestore();
      // Fallback to mock data if Firestore fetch fails or returns empty
      if (!data || data.length === 0) {
        console.warn("Firestore data not found, using mock data as a fallback.");
        data = MOCK_SERVICES_DATA.cards as Service[];
      }
      setServices(data);
      setIsDataLoading(false);
    };
    loadData();
  }, []);

  const activeService = services[activeIndex];
  // Pass the ID to the gallery images
  const galleryImages: GalleryImage[] = services.map(s => ({ id: s.id, src: s.src, alt: s.alt, code: s.title }));
  const currentStyles = themes[resolvedTheme as keyof typeof themes] || themes.light;

  if (!themeLoaded || isDataLoading) {
    return <LoadingState styles={currentStyles} />;
  }

  return (
    <section style={{ height: '100vh', width: '100%', fontFamily: 'sans-serif', transition: 'background 0.3s, color 0.3s', ...currentStyles.container }}>
      {isDesktop ? (
        <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', padding: '2.5rem' }}>
          <ServiceDetails key={activeService?.id} service={activeService} styles={currentStyles} />
          <HoverExpand_001 images={galleryImages} activeImage={activeIndex} setActiveImage={setActiveIndex} styles={currentStyles} />
        </div>
      ) : (
        <div style={{ padding: '1rem' }}>
          <Services />
        </div>
      )}
    </section>
  );
}

// ============================================================================
// # 2. LOADING STATE COMPONENT
// ============================================================================
const LoadingState = ({ styles }: { styles: Theme }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', ...styles.container }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      style={{
        marginBottom: '1rem', height: '3rem', width: '3rem', borderRadius: '50%',
        border: `4px solid ${styles.loader.secondary}`,
        borderTopColor: styles.loader.primary,
      }}
    />
    <p style={{ color: styles.description.color }}>Loading Our Services...</p>
  </div>
);

// ============================================================================
// # 3. SERVICE DETAILS COMPONENT
// ============================================================================
const ServiceDetails = ({ service, styles }: { service: Service; styles: Theme }) => {
  if (!service) return null;

  const detailItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" } }),
  };

  return (
    <div style={{ width: '100%', maxWidth: '32rem' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={service.id} initial="hidden" animate="visible" exit={{ opacity: 0, transition: { duration: 0.2 } }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <motion.div custom={0} variants={detailItemVariants} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={32} style={styles.icon} />
            <p style={{ fontSize: '0.875rem', fontWeight: 600, ...styles.subtitle }}>Our Services</p>
          </motion.div>
          <motion.h1 custom={1} variants={detailItemVariants} style={{ fontSize: '3rem', fontWeight: 'bold', ...styles.title }}>
            {service.title}
          </motion.h1>
          <motion.div custom={2} variants={detailItemVariants} style={{ marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', borderRadius: '0.5rem', ...styles.card }}>
            <BookOpen size={24} style={{ flexShrink: 0, ...styles.description }} />
            <p style={{ fontSize: '1rem', ...styles.description }}>{service.description}</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// # 4. IMAGE GALLERY COMPONENT (UPGRADED)
// ============================================================================
const HoverExpand_001 = ({ images, activeImage, setActiveImage, styles }: { images: GalleryImage[]; activeImage: number | null; setActiveImage: (index: number) => void; styles: Theme; }) => {
  const router = useRouter(); // Initialize the router

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
      style={{ position: 'relative', width: '100%', maxWidth: '36rem' }}>
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            initial={{ width: "5rem", height: "26rem" }}
            animate={{ width: activeImage === index ? "20rem" : "5rem", height: "26rem" }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            onHoverStart={() => setActiveImage(index)}
            onClick={() => router.push(`/services/${image.id}`)} // Add onClick handler
          >
            <AnimatePresence>
              {activeImage === index && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'absolute', height: '100%', width: '100%', background: `linear-gradient(to top, ${styles.gallery.gradient}, transparent)` }}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {activeImage === index && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: 0.2 }}
                  style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: styles.gallery.textColor }}>{image.alt}</h3>
                </motion.div>
              )}
            </AnimatePresence>
            <img src={image.src} alt={image.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};