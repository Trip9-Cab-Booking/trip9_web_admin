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
        domains : ["4.imimg.com", "trip9.blr1.digitaloceanspaces.com"]
  }
};

export default nextConfig;
