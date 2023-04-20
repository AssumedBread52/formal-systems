const { NextFederationPlugin } = require('@module-federation/nextjs-mf');
const { FederatedTypesPlugin } = require('@module-federation/typescript');

/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    dirs: ['pages', 'modules']
  },
  reactStrictMode: true,
  webpack: (config, options) => {
    const { isServer } = options;

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
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './user-signature': './pages/user-signature'
        },
        filename: 'static/ssr/remoteEntry.js',
        name: 'user'
      }
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './user-signature': './pages/user-signature'
        },
        filename: 'static/chunks/remoteEntry.js',
        name: 'user'
      }
    }));

    return config;
  }
};
