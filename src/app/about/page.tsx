"use client";

import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

// --- Helper Icon Components (self-contained) ---
const MapPinIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.75rem' }}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.75rem' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.75rem' }}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);



const AboutPage: NextPage = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // --- Theme Color Palettes (No external CSS) ---
  const colors = {
    dark: {
      background: '#0f172a', 
      card: '#1e293b', 
      textPrimary: '#e2e8f0', 
      textSecondary: '#94a3b8', 
      accent1: '#60a5fa', 
      accent2: '#4ade80', 
      accent3: '#f87171', 
      ring: 'rgba(255, 255, 255, 0.1)'
    },
    light: {
      background: '#f1f5f9', 
      card: '#ffffff',
      textPrimary: '#1e293b', 
      textSecondary: '#64748b', 
      accent1: '#3b82f6', 
      accent2: '#22c55e', 
      accent3: '#ef4444', 
      ring: 'rgba(0, 0, 0, 0.1)'
    }
  };

  const currentTheme = theme === 'light' ? colors.light : colors.dark;

  // --- Map Locations (API Key Free) ---
  const locations = [
    {
      name: 'Cubbon Park, Bengaluru',
      address: 'Kasturba Road, Bengaluru, 560001',
      embedUrl: "https://maps.google.com/maps?q=Cubbon%20Park,Bengaluru&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: 'Lalbagh Botanical Garden',
      address: 'Mavalli, Bengaluru, 560004',
      embedUrl: "https://maps.google.com/maps?q=Lalbagh%20Botanical%20Garden,Bengaluru&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    {
      name: 'Vidhana Soudha',
      address: 'Ambedkar Veedhi, Bengaluru, 560001',
      embedUrl: "https://maps.google.com/maps?q=Vidhana%20Soudha,Bengaluru&t=&z=15&ie=UTF8&iwloc=&output=embed"
    }
  ];
  
  const [activeMapUrl, setActiveMapUrl] = useState(locations[0].embedUrl);

  // Effect to ensure theme is applied only after client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevents theme mismatch on initial render
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}></div>;
  }

  return (
    <div style={{ 
        backgroundColor: currentTheme.background, 
        color: currentTheme.textPrimary, 
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        transition: 'background-color 0.3s, color 0.3s'
    }}>
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        
        {/* --- Header Section with Theme Toggle --- */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
            About <span style={{ color: currentTheme.accent1 }}>Bytedocker</span>
          </h1>
          <p style={{ color: currentTheme.textSecondary, marginTop: '1rem', maxWidth: '600px', margin: '1rem auto 0', fontSize: '1.125rem' }}>
            Your trusted technology partner dedicated to transforming businesses.
          </p>
           
        </div>

        {/* --- Introduction Section --- */}
        <div style={{ backgroundColor: currentTheme.card, border: `1px solid ${currentTheme.ring}`, borderRadius: '0.75rem', padding: '2rem', marginBottom: '3rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' }}>
          <p style={{ color: currentTheme.textSecondary, fontSize: '1.125rem', lineHeight: '1.75' }}>
            Welcome to Bytedocker, we specialize in designing and developing ERP and CRM systems, creating seamless e-commerce platforms, and crafting customized applications for clients across various industries. At Bytedocker, innovation meets execution to deliver results that drive growth, efficiency, and customer satisfaction.
          </p>
        </div>

        {/* --- Mission and Vision Grid --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div style={{ backgroundColor: currentTheme.card, borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: currentTheme.accent1, fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem' }}>Our Mission</h2>
            <p style={{ color: currentTheme.textSecondary, lineHeight: '1.75' }}>
              To deliver high-quality, affordable technology solutions that address our client's unique needs, combining technical expertise with a deep understanding of industry trends to create products that are both functional and future-ready.
            </p>
          </div>
          <div style={{ backgroundColor: currentTheme.card, borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: currentTheme.accent2, fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem' }}>Our Vision</h2>
            <p style={{ color: currentTheme.textSecondary, lineHeight: '1.75' }}>
              To be the premier technology partner for businesses worldwide, empowering them to achieve operational excellence and expand their digital presence through cutting-edge solutions that inspire growth and innovation.
            </p>
          </div>
        </div>

        {/* --- Contact and Location Section --- */}
        <div style={{ backgroundColor: currentTheme.card, border: `1px solid ${currentTheme.ring}`, borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700', textAlign: 'center', marginBottom: '2rem' }}>Get In Touch</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
            
            {/* --- Location & Map --- */}
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <MapPinIcon color={currentTheme.accent1} /> Our Offices
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {locations.map((location) => (
                  <div key={location.name}>
                    <p style={{ fontWeight: '600' }}>{location.name}</p>
                    <p style={{ color: currentTheme.textSecondary, marginBottom: '0.5rem' }}>{location.address}</p>
                    <button
                      onClick={() => setActiveMapUrl(location.embedUrl)}
                      style={{
                          display: 'inline-block',
                          color: 'white',
                          fontWeight: '700',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s',
                          fontSize: '0.875rem',
                          backgroundColor: activeMapUrl === location.embedUrl ? currentTheme.accent1 : '#64748b'
                      }}
                    >
                      Show on Map
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', height: '320px' }}>
                <iframe
                  src={activeMapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bytedocker Office Locations"
                ></iframe>
              </div>
            </div>

            {/* --- Contact Details --- */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon color={currentTheme.accent2} />
                <div>
                  <h4 style={{ fontWeight: '600' }}>Phone</h4>
                  <a href="tel:+919980936762" style={{ color: currentTheme.textSecondary, textDecoration: 'none' }}>
                    +91 99809 36762
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <MailIcon color={currentTheme.accent3} />
                <div>
                  <h4 style={{ fontWeight: '600' }}>Email</h4>
                  <a href="mailto:management@bytedocker.com" style={{ color: currentTheme.textSecondary, textDecoration: 'none' }}>
                    management@bytedocker.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;