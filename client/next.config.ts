/** @type {import('next').NextConfig} */
const nextConfig = {
  
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Tüm sitelere izin verir
      },
    ],
  },
};

module.exports = nextConfig;
