import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components sengaja tidak dipakai: di Cloudflare Workers setiap request macet (error 1101)
  // karena runtime-nya tidak cocok dengan cara fitur ini memakai setTimeout. Aplikasi ini juga tidak memakai "use cache".
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
