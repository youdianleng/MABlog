import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  // Media upload defaults allow 100 MB videos through the local API proxy.
  experimental: { proxyClientMaxBodySize: "110mb" },
  /** Route same-origin API requests to the independently deployable FastAPI service. */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};
export default config;
