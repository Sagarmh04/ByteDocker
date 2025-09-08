'use client';

import React from 'react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import PixelTransition from '@/components/ui/pixel-transition'; // Adjust path if needed
import '@/components/ui/PixelTransition.css'; // Make sure the CSS file is accessible

// --- Define the structure for a single project ---
interface Project {
  id: number;
  clientName: string;
  projectType: string;
  year: number;
  imageUrl: string;
}

// --- Mock Project Data (Replace with your actual data) ---
const allProjects: Project[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  clientName: `Client ${String.fromCharCode(65 + i)}`, // Client A, Client B, etc.
  projectType: ['Real Estate', 'Pharmacy', 'Logistics', 'E-commerce', 'Healthcare'][i % 5],
  year: 2020 + (i % 5),
  imageUrl: `https://picsum.photos/seed/${i + 1}/600/600`, // Placeholder images
}));

const PROJECTS_PER_PAGE = 6; // Number of projects to load at a time

// --- Project Card Component ---
// This component uses your PixelTransition component for the hover effect.
const ProjectCard = ({ project }: { project: Project }) => {
  // Content shown by default (just the image)
  const firstContent = (
    <Image
      src={project.imageUrl}
      alt={`Project for ${project.clientName}`}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover"
      priority={project.id <= PROJECTS_PER_PAGE} // Prioritize loading for initial projects
    />
  );

  // Content shown on hover (image with info overlay)
  const secondContent = (
    <div className="relative w-full h-full">
      <Image
        src={project.imageUrl}
        alt={`Project for ${project.clientName}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
      />
      {/* The info bar at the top */}
      <div className="absolute top-0 left-0 w-full bg-black bg-opacity-70 text-white p-3 text-left">
        <h3 className="font-bold text-lg">{project.clientName}</h3>
        <p className="text-sm">{project.projectType} - {project.year}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-auto">
       <PixelTransition
            firstContent={firstContent}
            secondContent={secondContent}
            gridSize={10}
            pixelColor="#000" // Example: black pixels for transition
            animationStepDuration={0.4}
            aspectRatio="100%" // Creates a square container for the image
        />
    </div>
  );
};


// --- Main Projects Page Component ---
export default function ProjectsPage() {
  const [displayedProjects, setDisplayedProjects] = useState<Project[]>(
    allProjects.slice(0, PROJECTS_PER_PAGE)
  );
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Function to load more projects
  const loadMoreProjects = () => {
    if (displayedProjects.length >= allProjects.length) {
      setHasMore(false);
      return;
    }

    // Simulate a network delay for a better UX
    setTimeout(() => {
        const nextProjects = allProjects.slice(
            displayedProjects.length,
            displayedProjects.length + PROJECTS_PER_PAGE
        );
        setDisplayedProjects((prev) => [...prev, ...nextProjects]);
    }, 500); // 0.5 second delay
  };

  // Effect for Intersection Observer (infinite scroll)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore) {
          loadMoreProjects();
        }
      },
      { rootMargin: '0px 0px 200px 0px' } // Load more when 200px from bottom
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, displayedProjects]);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* --- Navbar Placeholder --- */}
      

      {/* --- Main Content --- */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-extrabold text-center mb-12">Our Work</h2>

        {/* --- Responsive Projects Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* --- Loader for Infinite Scroll --- */}
        <div ref={loaderRef} className="text-center py-10">
          {hasMore && <p>Loading more projects...</p>}
          {!hasMore && <p>You've reached the end!</p>}
        </div>
      </main>

      {/* --- Footer / Contact Link --- */}
      <footer className="bg-gray-800 p-6 text-center">
        <h3 className="text-xl mb-4">Ready to start a project?</h3>
        <Link href="/contact" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Contact Us
        </Link>
      </footer>
    </div>
  );
}