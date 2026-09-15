import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",

  turbopack: {
    root: path.join(__dirname),
  },

  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "**" },
      { protocol: "https", hostname: "realtyhub.com.vn", pathname: "**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "**" },
    ],
  },
};

export default withNextIntl(nextConfig);
