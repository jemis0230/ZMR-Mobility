/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  experimental: {
    // Inline the (≈16 KB gzipped) stylesheet to remove render-blocking CSS requests.
    inlineCss: true,
  },
  images: {
    // Serve modern formats; browsers that don't support AVIF get WebP.
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'alt-mobility.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
