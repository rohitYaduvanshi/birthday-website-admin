import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // Optimize image loading
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 86400, // 24 hours
  },

  // Faster page loads — compress responses
  compress: true,

  // Reduce JS shipped to browser
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
