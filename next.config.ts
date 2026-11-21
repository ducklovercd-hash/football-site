import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Crests for the real data providers we will wire up next, plus the
    // player headshots served from FotMob's public CDN.
    remotePatterns: [
      { protocol: "https", hostname: "crests.football-data.org" },
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "images.fotmob.com" },
    ],
  },
};

export default nextConfig;
