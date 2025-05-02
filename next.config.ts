import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
        {
          protocol: 'https',
          hostname: "4.imimg.com",
        },
        {
          protocol: 'https',
          hostname: "trip9.blr1.digitaloceanspaces.com",
        },
      ],
  }
};

export default nextConfig;
