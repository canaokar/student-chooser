import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/teams",
        destination: "/tools/teams",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
