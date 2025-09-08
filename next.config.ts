import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      
      // 👇 wildcard example (if you want to allow any HTTPS domain)
      // {
      //   protocol: 'https',
      //   hostname: '**',
      // },
    ],
  },
};

export default nextConfig;
