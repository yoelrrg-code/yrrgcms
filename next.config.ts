import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob storage
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // Allow any https image for external URLs in blocks
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Enable Server Actions (on by default in Next.js 15, but explicit for clarity)
  experimental: {
    serverActions: {
      // Max body size for form submissions (10MB for media uploads)
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
