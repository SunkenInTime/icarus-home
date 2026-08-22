import type { NextConfig } from "next";

const CANONICAL_HOST = "icarusstrats.com";
const REDIRECTED_HOSTS = [
  "www.icarusstrats.com",
  "icarus-strats.xyz",
  "www.icarus-strats.xyz",
] as const;

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/agent-markdown/*": ["./app/content/*"],
    "/llms.txt": ["./app/content/llms.txt"],
  },
  async redirects() {
    return [
      ...REDIRECTED_HOSTS.map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: true,
      })),
      {
        source: "/share/:code",
        destination: "/?code=:code",
        statusCode: 302,
      },
    ];
  },
};

export default nextConfig;
