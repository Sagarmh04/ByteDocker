"use client";

import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

// --- Helper Icon Components ---
const MapPinIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.75rem' }}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.75rem' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81 .7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = ({ color }: { color: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.75rem' }}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

// --- Component ---
const AboutPage: NextPage = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeMemberIndex, setActiveMemberIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mapType, setMapType] = useState('m'); // 'm' for map, 'k' for satellite

  // --- Theme Colors ---
  const colors = {
    light: {
      background: '#f8fafc',
      card: '#ffffff',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      accent1: '#2563eb',
      accent2: '#16a34a',
      accent3: '#dc2626',
      border: '#e2e8f0'
    },
    dark: {
      background: '#111827',
      card: '#1f2937',
      textPrimary: '#f9fafb',
      textSecondary: '#9ca3af',
      accent1: '#60a5fa',
      accent2: '#4ade80',
      accent3: '#f87171',
      border: '#374151'
    }
  };

  const currentTheme = theme === 'light' ? colors.light : colors.dark;

  // --- Team Member Data ---
  const teamMembers = [
    {
      name: 'Priya Sharma',
      designation: 'Founder & CEO',
      description: 'The visionary leader steering Bytedocker towards becoming a global technology powerhouse.',
      experience: '15+ Years',
      joiningYear: 2018,
      imageUrl: 'https://i.ibb.co/L8yC8sS/Premium-Photo-A-woman-with-a-blue-shirt-and-a-blue-background.jpg'
    },
    {
      name: 'Rohan Mehta',
      designation: 'Chief Technology Officer (CTO)',
      description: 'The architectural mastermind behind our robust and scalable solutions.',
      experience: '12 Years',
      joiningYear: 2019,
      imageUrl: 'https://i.ibb.co/r7Jt70F/Businessman-at-the-office.jpg'
    },
    {
      name: 'Anjali Verma',
      designation: 'Lead Project Manager',
      description: 'The organizational force ensuring seamless project delivery and client satisfaction.',
      experience: '10 Years',
      joiningYear: 2020,
      imageUrl: 'https://i.ibb.co/3k5fVQt/Beautiful-young-woman-with-long-hair-and-a-red-lipstick.jpg'
    },
    {
      name: 'Vikram Singh',
      designation: 'Senior Software Engineer',
      description: 'A core developer who transforms complex business logic into clean, efficient code.',
      experience: '8 Years',
      joiningYear: 2021,
      imageUrl: 'https://i.ibb.co/8Y5B3kX/A-man-in-a-suit-and-tie-stands-in-front-of-a-dark.jpg'
    },
    {
      name: 'Sneha Gupta',
      designation: 'UI/UX Designer',
      description: 'The creative artist who crafts intuitive, user-centric, and visually stunning interfaces.',
      experience: '6 Years',
      joiningYear: 2022,
      imageUrl: 'https://i.ibb.co/Wc4q8wT/A-woman-with-black-hair-and-a-white-shirt.jpg'
    }
  ];

  // --- Map Locations with Coordinates for better accuracy ---
  const locations = [
    {
      name: 'Corporate Office 1',
      address: 'Residency Road, Bengaluru 560025',
      lat: 12.9720,
      lon: 77.6085
    },
    {
      name: 'Corporate Office 2',
      address: 'Bull Temple Road, Basavanagudi, Bengaluru 560019',
      lat: 12.9420,
      lon: 77.5700
    },
    {
      name: 'Registered Office',
      address: 'Kanakapura Road, Bengaluru 560062',
      lat: 12.9000,
      lon: 77.5600
    }
  ];

  const [activeLocation, setActiveLocation] = useState(locations[0]);

  // Dynamically create the map URL based on the active location and map type
  const mapEmbedUrl = `https://maps.google.com/maps?q=${activeLocation.lat},${activeLocation.lon}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`;

  // --- Effects ---
  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}></div>;
  }

  return (
    <div style={{ backgroundColor: currentTheme.background, color: currentTheme.textPrimary, fontFamily: 'sans-serif', transition: 'background-color 0.5s, color 0.5s' }}>
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        
        {/* --- Header Section --- */}
        <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
            About <span style={{ color: currentTheme.accent1 }}>ByteDocker</span>
          </h1>
          <p style={{ color: currentTheme.textSecondary, marginTop: '1rem', maxWidth: '700px', margin: '1rem auto 0', fontSize: '1.125rem' }}>
            We are a team of innovators and problem-solvers dedicated to crafting digital solutions that drive growth and efficiency.
          </p>
        </div>

        {/* --- Mission and Vision --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
          <div style={{ backgroundColor: currentTheme.card, border: `1px solid ${currentTheme.border}`, borderRadius: '0.75rem', padding: '2rem' }}>
            <h2 style={{ color: currentTheme.accent1, fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem' }}>Our Mission</h2>
            <p style={{ color: currentTheme.textSecondary, lineHeight: '1.75' }}>
              To deliver high-quality, affordable technology solutions that address our client's unique needs, combining technical expertise with a deep understanding of industry trends to create products that are both functional and future-ready.
            </p>
          </div>
          <div style={{ backgroundColor: currentTheme.card, border: `1px solid ${currentTheme.border}`, borderRadius: '0.75rem', padding: '2rem' }}>
            <h2 style={{ color: currentTheme.accent2, fontSize: '1.875rem', fontWeight: '700', marginBottom: '1rem' }}>Our Vision</h2>
            <p style={{ color: currentTheme.textSecondary, lineHeight: '1.75' }}>
              To be the premier technology partner for businesses worldwide, empowering them to achieve operational excellence and expand their digital presence through cutting-edge solutions that inspire growth and innovation.
            </p>
          </div>
        </div>

        {/* --- Meet Our Team Section --- */}
        <div style={{ marginBottom: '6rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: '700', marginBottom: '3rem' }}>
             Meet Our Team
          </h2>
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isDesktop ? '1fr 2fr' : '1fr', 
              gap: '2rem', 
              backgroundColor: currentTheme.card, 
              border: `1px solid ${currentTheme.border}`, 
              borderRadius: '0.75rem', 
              padding: '2rem', 
              alignItems: 'center' 
            }}
          >
            {/* Left Column: Member List with Images */}
            <div style={{ borderRight: isDesktop ? `1px solid ${currentTheme.border}` : 'none', paddingRight: isDesktop ? '2rem' : '0' }}>
              {teamMembers.map((member, index) => (
                <div 
                  key={member.name} 
                  onMouseEnter={() => setActiveMemberIndex(index)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '0.75rem', 
                    borderRadius: '0.5rem', 
                    cursor: 'pointer', 
                    marginBottom: '0.5rem', 
                    backgroundColor: index === activeMemberIndex ? currentTheme.accent1 : 'transparent', 
                    color: index === activeMemberIndex ? '#ffffff' : currentTheme.textPrimary, 
                    transition: 'background-color 0.3s' 
                  }}
                >
                  <img 
                    src={member.imageUrl} 
                    alt={member.name} 
                    style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '50%', 
                      objectFit: 'cover', 
                      marginRight: '1rem',
                      border: `2px solid ${index === activeMemberIndex ? '#ffffff' : currentTheme.border}`
                    }} 
                  />
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{member.name}</p>
                    <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>{member.designation}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Right Column: Active Member Display */}
            <div style={{ textAlign: 'center', marginTop: isDesktop ? '0' : '2rem' }}>
              <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 1.5rem auto', borderRadius: '50%', overflow: 'hidden', border: `4px solid ${currentTheme.accent1}` }}>
                  <img src={teamMembers[activeMemberIndex].imageUrl} alt={teamMembers[activeMemberIndex].name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700' }}>{teamMembers[activeMemberIndex].name}</h3>
              <p style={{ color: currentTheme.accent2, fontWeight: '500', marginBottom: '1rem' }}>{teamMembers[activeMemberIndex].designation}</p>
              <p style={{ color: currentTheme.textSecondary, maxWidth: '400px', margin: '0 auto 1rem auto', lineHeight: '1.6' }}>{teamMembers[activeMemberIndex].description}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', color: currentTheme.textSecondary }}>
                <span><strong>Experience:</strong> {teamMembers[activeMemberIndex].experience}</span>
                <span><strong>Joined:</strong> {teamMembers[activeMemberIndex].joiningYear}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* --- Contact and Location Section --- */}
        <div style={{ backgroundColor: currentTheme.card, border: `1px solid ${currentTheme.border}`, borderRadius: '0.75rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem' }}>Find Us</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
                <MapPinIcon color={currentTheme.accent1} /> Our Offices
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {locations.map((location) => (
                  <div key={location.name}>
                    <p style={{ fontWeight: '600' }}>{location.name}</p>
                    <p style={{ color: currentTheme.textSecondary, marginBottom: '0.5rem' }}>{location.address}</p>
                    <button onClick={() => setActiveLocation(location)} style={{ display: 'inline-block', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', transition: 'background-color 0.3s', backgroundColor: activeLocation.name === location.name ? currentTheme.accent1 : '#94a3b8' }}>
                      Show on Map
                    </button>
                  </div>
                ))}
              </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon color={currentTheme.accent2} />
                    <div>
                      <h4 style={{ fontWeight: '600' }}>Phone</h4>
                      <a href="tel:+919980936762" style={{ color: currentTheme.textSecondary, textDecoration: 'none' }}>+91 9980936762</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <MailIcon color={currentTheme.accent3} />
                    <div>
                      <h4 style={{ fontWeight: '600' }}>Email</h4>
                      <a href="mailto:management@bytedocker.com" style={{ color: currentTheme.textSecondary, textDecoration: 'none' }}>management@bytedocker.com</a>
                    </div>
                  </div>
              </div>
            </div>
            <div style={{ borderRadius: '0.5rem', overflow: 'hidden', minHeight: '500px', width: '100%' }}>
              <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3846.32643138582!2d75.63388437512226!3d15.412923185175487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8f944f7cb2301%3A0xe39ea5d1d5e09e33!2sTontadarya%20College%20of%20Engineering%2C%20Gadag!5e0!3m2!1sen!2sin!4v1758557421812!5m2!1sen!2sin"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;