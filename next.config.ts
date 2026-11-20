import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (on by default in new Next.js 16.4 apps) is left off on
  // purpose: almost every page here depends on the signed-in user or the shop,
  // so it would add Suspense rules without making pages faster.
  // See docs/DECISIONS.md (D21).
  poweredByHeader: false,
  // Local subdomains (app.localhost, <shop>.localhost) may load dev resources.
  allowedDevOrigins: ["*.localhost"],
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
