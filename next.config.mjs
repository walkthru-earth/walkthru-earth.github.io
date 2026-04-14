// Security headers must be set at the hosting layer (GitHub Pages), static export ignores headers().
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages
  output: 'export',

  // Disable React Strict Mode — deck.gl/luma.gl WebGL device creation
  // fails on double-invoked useEffect (maxTextureDimension2D error).
  // Safe to disable: the error is dev-only but blocks WebGL rendering.
  reactStrictMode: false,

  // Turbopack is default in Next.js 16
  turbopack: {
    root: '.',
  },

  images: {
    unoptimized: true, // Required for static export
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Strip console.log in production builds only (keep warnings & errors)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // Compression
  compress: true,
};

export default nextConfig;
