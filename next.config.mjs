/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚡ React Compiler
  reactCompiler: true,

  // ⚙️ Optimisation des imports
  experimental: {
    optimizePackageImports: ['lucide-react'],
    globalNotFound: true,
  },

  // 🧹 Production : supprime les consoles (sauf les erreurs)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // 🖼️ Images distantes autorisées
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    qualities: [70, 80, 90, 100],
  },
}

export default nextConfig
