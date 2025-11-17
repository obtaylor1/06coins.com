/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Enable static exports for certain pages while allowing API routes
  output: 'standalone',
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.VITE_STRIPE_PUBLIC_KEY,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_GA4_MEASUREMENT_ID: process.env.VITE_GA4_MEASUREMENT_ID,
  },
  // Webpack configuration for compatibility
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/src',
      '@assets': '/attached_assets',
    };
    return config;
  },
};

export default nextConfig;
