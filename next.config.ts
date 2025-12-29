import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'school.globaltechsoftwaresolutions.cloud',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'minio.globaltechsoftwaresolutions.cloud',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/password_reset',
        destination: 'https://school.globaltechsoftwaresolutions.cloud/api/password_reset/',
      },
      {
        source: '/api/password_reset/',
        destination: 'https://school.globaltechsoftwaresolutions.cloud/api/password_reset/',
      },
      {
        source: '/api/password_reset_confirm/:uidb64/:token',
        destination: 'https://school.globaltechsoftwaresolutions.cloud/password_reset_confirm/:uidb64/:token/',
      },
      {
        source: '/api/password_reset_confirm/:uidb64/:token/',
        destination: 'https://school.globaltechsoftwaresolutions.cloud/password_reset_confirm/:uidb64/:token/',
      },
      {
        source: '/api/signup',
        destination: 'https://school.globaltechsoftwaresolutions.cloud/api/signup/',
      },
      {
        source: '/api/signup/',
        destination: 'https://school.globaltechsoftwaresolutions.cloud/api/signup/',
      },
    ];
  },
};

export default nextConfig;
