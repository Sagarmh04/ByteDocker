'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

// Firebase Imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, limit, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import {db} from '@/services/firebase'
// Component Imports
import PixelTransition from '@/components/ui/pixel-transition';
import '@/components/ui/PixelTransition.css';
import MobileProjectDetailModal from '@/components/MobileProjectDetailModal';


// --- Type Definition for a Project ---
interface Project {
  id: string;
  clientName: string;
  projectType: string;
  year: number;
  imageUrl: string;
  description: string;
}

// --- Theme-based Color Palettes ---
const colorPalettes = {
  light: {
    bg: 'bg-slate-50',
    text: 'text-slate-900',
    cardBg: 'bg-white',
    accent: 'text-cyan-600',
    muted: 'text-slate-600',
    navBg: 'bg-white/80 backdrop-blur-sm',
    footerBg: 'bg-slate-100',
  },
  dark: {
    bg: 'bg-gray-900',
    text: 'text-gray-100',
    cardBg: 'bg-gray-800',
    accent: 'text-cyan-400',
    muted: 'text-gray-400',
    navBg: 'bg-gray-900/80 backdrop-blur-sm',
    footerBg: 'bg-gray-800',
  },
};

const PROJECTS_PER_PAGE = 6;

// --- Project Card Component ---
const ProjectCard = ({ project, colors, onClick }: { project: Project; colors: any; onClick: () => void; }) => {
  const firstContent = (
    <div className="relative w-full h-full">
        {/* Replaced Next/Image with standard img tag */}
        <img
            src={project.imageUrl}
            alt={`Project for ${project.clientName}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading={parseInt(project.id) > PROJECTS_PER_PAGE ? 'lazy' : 'eager'}
        />
    </div>
  );

  const secondContent = (
    <div className="relative w-full h-full">
       {/* Replaced Next/Image with standard img tag */}
      <img
        src={project.imageUrl}
        alt={`Project for ${project.clientName}`}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className={`absolute top-0 left-0 w-full p-3 text-left ${colors.cardBg} bg-opacity-80`}>
        <h3 className="font-bold text-lg">{project.clientName}</h3>
        <p className={`text-sm ${colors.accent}`}>{project.projectType} - {project.year}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-auto cursor-pointer" onClick={onClick}>
      <PixelTransition
        firstContent={firstContent}
        secondContent={secondContent}
        gridSize={10}
        pixelColor="#000"
        animationStepDuration={0.4}
        aspectRatio="100%"
      />
    </div>
  );
};

// --- Main Projects Page Component ---
export default function ProjectsPage() {
  const { resolvedTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Effect to wait for theme to be resolved before rendering content
  useEffect(() => {
    if (resolvedTheme) {
      setThemeReady(true);
    }
  }, [resolvedTheme]);

  const colors = themeReady ? colorPalettes[resolvedTheme as keyof typeof colorPalettes] : colorPalettes.dark;

  // --- Data Fetching and Seeding Logic ---
  const fetchProjects = useCallback(async (initial = false) => {
    if (!hasMore && !initial) return;
    setLoading(true);

    try {
      const projectsRef = collection(db, "projects");
      let q;

      if (initial) {
        // Check if collection is empty
        const initialSnapshot = await getDocs(query(projectsRef, limit(1)));
        if (initialSnapshot.empty) {
          console.log("No projects found. Seeding database...");
          await seedDatabase();
        }
        q = query(projectsRef, limit(PROJECTS_PER_PAGE));
      } else if (lastVisible) {
        q = query(projectsRef, startAfter(lastVisible), limit(PROJECTS_PER_PAGE));
      } else {
        setLoading(false);
        return; // Should not happen after initial load
      }

      const documentSnapshots = await getDocs(q);
      const newProjects = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      
      const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      setLastVisible(lastDoc);

      if (documentSnapshots.empty || newProjects.length < PROJECTS_PER_PAGE) {
        setHasMore(false);
      }
      
      setProjects(prev => initial ? newProjects : [...prev, ...newProjects]);

    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [lastVisible, hasMore]);

  // Initial fetch on component mount
  useEffect(() => {
    if (themeReady) {
        fetchProjects(true);
    }
  }, [themeReady]); // Dependency on themeReady ensures it runs after theme is known

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProjects();
        }
      },
      { rootMargin: '0px 0px 200px 0px' }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [hasMore, loading, fetchProjects]);
  
  const handleProjectClick = (project: Project) => {
    if (window.innerWidth < 768) { // Trigger modal only on smaller screens
      setSelectedProject(project);
    }
  };

  // Render a loading state until the theme and initial data are ready
  if (!themeReady || (loading && projects.length === 0)) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${colors.bg}`}>
        <p className={colors.text}>Loading Projects...</p>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} ${colors.text} min-h-screen`}>
      <MobileProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} colors={colors} />
      

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-extrabold text-center mb-12">Our Work</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} colors={colors} onClick={() => handleProjectClick(project)} />
          ))}
        </div>

        <div ref={loaderRef} className="text-center py-10">
          {loading && <p>Loading more...</p>}
          {!hasMore && projects.length > 0 && <p>You've seen all our work!</p>}
        </div>
      </main>
      
    </div>
  );
}

// --- Function to Seed Database with Initial Data ---
async function seedDatabase() {
  const mockProjects = [
    {
      clientName: "PharmaCare Inc.",
      projectType: "Pharmacy",
      year: 2023,
      imageUrl: `https://picsum.photos/seed/pharma/600/600`,
      description: "A comprehensive inventory and prescription management system for a chain of pharmacies, improving efficiency by 40%."
    },
    {
      clientName: "Apex Properties",
      projectType: "Real Estate",
      year: 2022,
      imageUrl: `https://picsum.photos/seed/estate/600/600`,
      description: "A client-facing portal with virtual tours and a secure document handling system for a luxury real estate agency."
    },
    {
      clientName: "Swift Logistics",
      projectType: "Logistics",
      year: 2024,
      imageUrl: `https://picsum.photos/seed/logistics/600/600`,
      description: "Real-time fleet tracking and route optimization software that reduced fuel costs and improved delivery times."
    },
    {
      clientName: "The Digital Shelf",
      projectType: "E-commerce",
      year: 2023,
      imageUrl: `https://picsum.photos/seed/ecomm/600/600`,
      description: "A scalable e-commerce platform with a custom recommendation engine, boosting average order value by 15%."
    },
    {
      clientName: "Wellness Tracker",
      projectType: "Healthcare",
      year: 2021,
      imageUrl: `https://picsum.photos/seed/health/600/600`,
      description: "A mobile app for patients to track symptoms and communicate securely with their healthcare providers."
    }
  ];

  const projectsRef = collection(db, "projects");
  for (const project of mockProjects) {
    await addDoc(projectsRef, project);
  }
  console.log("Database seeded successfully with 5 projects.");
}

