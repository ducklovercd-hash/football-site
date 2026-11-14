import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Crests for the real data providers we will wire up next.
    remotePatterns: [
      { protocol: "https", hostname: "crests.football-data.org" },
      { protocol: "https", hostname: "media.api-sports.io" },
    ],
  },
};

export default nextConfig;
