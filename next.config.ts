import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp', '@prisma/client', '@react-pdf/renderer', 'potrace'],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@img/sharp-win32-*',
      'node_modules/@img/sharp-darwin-*',
      'node_modules/@img/sharp-libvips-win32-*',
      'node_modules/@img/sharp-libvips-darwin-*',
      'node_modules/@img/sharp-libvips-linuxmusl-arm64',
      'node_modules/@img/sharp-linux-arm*',
      'node_modules/@img/sharp-libvips-linux-arm*',
      'node_modules/prisma/libquery_engine-*',
      'node_modules/@prisma/engines/**',
      'node_modules/.prisma/client/libquery_engine-*',
      '!node_modules/.prisma/client/libquery_engine-debian-openssl*',
      'node_modules/@react-pdf/**',
      'node_modules/potrace/**',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-39ccb989bffa4f729bb1ae58876f3b36.r2.dev",
      },
      {
        protocol: "https",
        hostname: "maxlulu-assets.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
