/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removing output: 'export' to fix the dynamic route error
  reactStrictMode: true,
}

module.exports = nextConfig