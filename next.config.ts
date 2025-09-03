import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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

export default nextConfig;
