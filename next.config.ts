import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "apod.nasa.gov" },
      { protocol: "https", hostname: "images-assets.nasa.gov" },
      { protocol: "https", hostname: "eoimages.gsfc.nasa.gov" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "thespacedevs-prod.nyc3.digitaloceanspaces.com" },
    ],
  },
};

export default nextConfig;
