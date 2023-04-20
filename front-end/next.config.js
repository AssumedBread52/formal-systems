const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
module.exports = {
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
      exposes: {},
      filename: 'static/chunks/remoteEntry.js',
      name: 'application',
      remotes: {
        user: isServer ? 'user@http://micro-front-end-user:3002/_next/static/ssr/remoteEntry.js' : 'user@http://localhost:3002/_next/static/chunks/remoteEntry.js'
      }
    }));

    return config;
  }
};
