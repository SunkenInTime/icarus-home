import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/share/:code",
        destination: "/?code=:code",
        statusCode: 302,
      },
    ];
  },
};

export default nextConfig;
