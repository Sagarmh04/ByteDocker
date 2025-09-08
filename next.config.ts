import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ADD THIS ENTIRE 'images' SECTION
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  // ... you might have other configurations here. Leave them as they are.
};

export default nextConfig;
