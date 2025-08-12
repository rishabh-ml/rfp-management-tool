// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Allow Next/Image to optimize avatars and assets served by Clerk
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      // Add more providers here if your app shows external avatars, e.g.:
      // { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      // { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
      // { protocol: "https", hostname: "pbs.twimg.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
