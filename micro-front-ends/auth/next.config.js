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
        './sign-in-form': './pages/sign-in-form'
      },
      filename: 'static/chunks/remoteEntry.js',
      name: 'auth'
    }));

    return config;
  }
};
