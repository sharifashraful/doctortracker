import { dirname } from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const devOrigins = (process.env.CLIENT_ORIGIN ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean)
  .flatMap((item) => {
    try {
      return [new URL(item).hostname];
    } catch {
      return [];
    }
  });

const nextConfig: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  // Next.js dev refuses its own scripts when the browser uses a public IP.
  // CLIENT_ORIGIN already lists those hosts for the API.
  allowedDevOrigins: devOrigins,
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
