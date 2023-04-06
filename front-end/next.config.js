import { NextFederationPlugin } from '@module-federation/nextjs-mf';

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true
  },
  eslint: {
    dirs: ['pages', 'modules', 'types']
  },
  reactStrictMode: true,
  webpack: (config, options) => {
    const { isServer } = options;

    Object.assign(config.experiments, {
      topLevelAwait: true
    });

    config.plugins.push(new NextFederationPlugin({
      filename: 'static/chunks/remoteEntry.js',
      name: 'application',
      remotes: {
        user: `user@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`
      }
    }));

    return config;
  }
};

export default nextConfig;
