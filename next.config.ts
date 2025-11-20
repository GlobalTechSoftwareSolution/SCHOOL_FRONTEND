import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    domains: [
      "i.pravatar.cc",
      "globaltechsoftwaresolutions.cloud",
      "images.unsplash.com",
      "images.pexels.com",
      "cdn.pixabay.com",
    ],
  },
};

export default nextConfig;
