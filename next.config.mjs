/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "localhost",
    "192.168.*.*",
  ],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dms',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;