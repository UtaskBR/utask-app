/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignorar erros de TS durante o build de produção
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
  env: {
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false } // Corrige problemas do Prisma
    return config
  },
};

module.exports = nextConfig;
