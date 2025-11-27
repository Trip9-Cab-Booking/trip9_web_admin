import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  // Do not ignore type errors in production builds
  typescript: {
    ignoreBuildErrors: false,
  },

  // Let ESLint run during build (default) — remove `ignoreDuringBuilds` entirely
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "4.imimg.com" },
      { protocol: "https", hostname: "trip9.blr1.digitaloceanspaces.com" },
    ],
  },
};

export default nextConfig;
