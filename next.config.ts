import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "tarasheh.net",
      "api.tarasheh.net",
      "res.cloudinary.com",
      "fakestoreapi.com",
      "images.unsplash.com",
      "picsum.photos",
      "via.placeholder.com",
      "localhost",
      "127.0.0.1",
    ],
    remotePatterns: [
      // برای توسعه لوکال بک‌اند
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/uploads/**",
      },
      // بک‌اند روی سرور (api)
      {
        protocol: "https",
        hostname: "api.tarasheh.net",
        // پورت رو اصلاً نذار تا پیش‌فرض ۴۴۳ استفاده بشه
        pathname: "/uploads/**",
      },
      // اگر جایی از tarasheh.net/api/uploads استفاده کنی
      {
        protocol: "https",
        hostname: "tarasheh.net",
        pathname: "/api/uploads/**",
      },
      // Cloudinary
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

// --- Sentry Wrapper ---
let config = nextConfig;

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const { withSentryConfig } = require("@sentry/nextjs");
    config = withSentryConfig(
      nextConfig,
      {
        silent: true,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
      {
        widenClientFileUpload: true,
        transpileClientSDK: true,
        tunnelRoute: "/monitoring",
        hideSourceMaps: true,
        disableLogger: true,
        automaticVercelMonitors: true,
      }
    );
  } catch (error) {
    console.warn("Sentry not available, continuing without Sentry configuration");
  }
}

export default config;
