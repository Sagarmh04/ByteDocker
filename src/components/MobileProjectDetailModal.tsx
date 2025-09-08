'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Define the structure for a single project
interface Project {
  id: string;
  clientName: string;
  projectType: string;
  year: number;
  imageUrl: string;
  description: string;
}

interface MobileProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  colors: {
    bg: string;
    text: string;
    cardBg: string;
    accent: string;
    muted: string;
  };
}

const MobileProjectDetailModal: React.FC<MobileProjectDetailModalProps> = ({ project, onClose, colors }) => {

  // --- BRUTE-FORCE SCROLL LOCK LOGIC (UNCHANGED) ---
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
        // --- OVERLAY ---
        // This div is now just a simple, full-screen backdrop.
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-50"
        >
          {/* --- MODAL CONTAINER (NEW CENTERING LOGIC) --- */}
          {/*
            THE FIX IS HERE:
            - `absolute top-1/2 left-1/2`: Moves the top-left corner of the modal to the exact center of the screen.
            - `-translate-x-1/2 -translate-y-1/2`: Shifts the modal back by half its own width and height.
            This combination results in perfect mathematical centering, regardless of the parent.
          */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[90vw] max-w-md max-h-[90vh] rounded-xl shadow-2xl ${colors.cardBg} ${colors.text} overflow-hidden`}
          >
            {/* --- Close Button --- */}
            <button
              onClick={onClose}
              className={`absolute top-3 right-3 rounded-full h-8 w-8 flex items-center justify-center transition-colors z-10 ${colors.bg} hover:bg-opacity-80`}
              aria-label="Close project details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* --- Image Section --- */}
            <div className="relative w-full aspect-video flex-shrink-0">
              <img
                src={project.imageUrl}
                alt={`Project for ${project.clientName}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* --- Scrollable Text Content --- */}
            <div className="p-6 overflow-y-auto">
              <p className={`font-semibold text-sm ${colors.accent}`}>{project.projectType.toUpperCase()} - {project.year}</p>
              <h2 className="text-3xl font-bold mt-1">{project.clientName}</h2>
              <p className={`mt-4 text-base ${colors.muted}`}>{project.description}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileProjectDetailModal;