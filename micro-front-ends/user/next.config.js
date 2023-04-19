const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    dirs: ['pages', 'modules']
  },
  reactStrictMode: true,
  webpack: (config) => {
    Object.assign(config.experiments, {
      topLevelAwait: true
    });

    config.plugins.push(new NextFederationPlugin({
      exposes: {
        './user-signature': './pages/user-signature'
      },
      filename: 'static/chunks/remoteEntry.js',
      name: 'user'
    }));

    return config;
  }
};
