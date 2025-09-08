'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Define the structure for a single project, can be shared
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
  return (
    <AnimatePresence>
      {project && (
        // --- Overlay ---
        // This div darkens the background and uses flexbox to perfectly center the modal.
        // The 'p-4' or 'p-6' ensures there's always a gap between the modal and the screen edges.
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
        >
          {/* --- Modal Container --- */}
          {/* This is the main card. It's a flex column to stack the image and text. */}
          {/* 'overflow-hidden' is crucial to enforce the 'rounded-xl' on child elements (like the image). */}
          <motion.div
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative flex flex-col w-full max-w-md max-h-[85vh] rounded-xl shadow-2xl ${colors.cardBg} ${colors.text} overflow-hidden`}
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
            {/* 'flex-shrink-0' prevents the image from being squashed by the text content. */}
            <div className="relative w-full aspect-video flex-shrink-0">
              <img
                src={project.imageUrl}
                alt={`Project for ${project.clientName}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* --- Scrollable Text Content --- */}
            {/* 'overflow-y-auto' makes ONLY this section scrollable if the text is too long. */}
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

