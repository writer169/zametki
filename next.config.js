/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Указываем, что приложение может быть развернуто как Edge Runtime
  // для более быстрой загрузки и лучшей производительности
  experimental: {
    // Раскомментируйте следующую строку, если хотите использовать Edge Runtime
    // runtime: 'edge',
  },
}

module.exports = nextConfig;