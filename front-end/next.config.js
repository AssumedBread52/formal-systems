/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true
  },
  eslint: {
    dirs: ['pages', 'modules', 'types']
  },
  reactStrictMode: true
};

module.exports = nextConfig;
