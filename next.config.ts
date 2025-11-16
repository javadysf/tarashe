import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // For Docker deployment
  images: {
    domains: [
        'fakestoreapi.com',
        's6.uupload.ir',
        'localhost',
        '127.0.0.1',
        'res.cloudinary.com',
        'images.unsplash.com',
        'picsum.photos',
        'via.placeholder.com'
    ],
    remotePatterns: [
        {
            protocol: 'http',
            hostname: 'localhost',
            port: '3002',
            pathname: '/**',
        },
        {
            protocol: 'http',
            hostname: 'localhost',
            port: '5000',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: '**',
        },
    ],
  },
};

// Conditionally wrap with Sentry if DSN is configured
let config = nextConfig;

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const { withSentryConfig } = require("@sentry/nextjs");
    config = withSentryConfig(
      nextConfig,
      {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during build
        silent: true,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
      {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Transpiles SDK to be compatible with IE11 (increases bundle size)
        transpileClientSDK: true,

        // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
        // This can increase your server load as well as your hosting bill.
        // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
        // side errors will fail.
        tunnelRoute: "/monitoring",

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,

        // Enables automatic instrumentation of Vercel Cron Monitors.
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,
      }
    );
  } catch (error) {
    console.warn('Sentry not available, continuing without Sentry configuration');
  }
}

export default config;
