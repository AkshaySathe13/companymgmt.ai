import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  // The browser calls the API through this app, so the session cookie stays on one origin.
  async rewrites() {
    const api = process.env.API_ORIGIN ?? "http://127.0.0.1:4000";
    return [{ source: "/api/v1/:path*", destination: `${api}/api/v1/:path*` }];
  },
};
export default nextConfig;
