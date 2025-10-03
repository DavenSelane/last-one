/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "res.cloudinary.com" }
    ],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['react-toastify', 'recharts'],
  },

  // Reduce bundle size
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },

  // Enable compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // SWC minification
  swcMinify: true,
};

export default nextConfig;
