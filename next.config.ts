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

  // Disable ESLint from failing the production build
  eslint: {
    ignoreDuringBuilds: true,
  },

  output: "export",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "4.imimg.com" },
      { protocol: "https", hostname: "trip9.blr1.digitaloceanspaces.com" },
    ],
  },
};

export default nextConfig;
