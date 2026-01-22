/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Otimizações de performance
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Otimizar compilação
  experimental: {
    // optimizeCss: true, // Desabilitado - causa erro "Cannot find module 'critters'" no Vercel
    scrollRestoration: true,
  },

  // Webpack otimizações
  webpack: (config, { dev, isServer }) => {
    // Otimizar apenas em produção
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      }
    }
    return config
  },
}

module.exports = nextConfig
