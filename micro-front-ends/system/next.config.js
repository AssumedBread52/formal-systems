const { NextFederationPlugin } = require('@module-federation/nextjs-mf');
const { FederatedTypesPlugin } = require('@module-federation/typescript');

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
        './system-provider': './modules/system/components/system-provider/system-provider'
      },
      filename: 'static/chunks/remoteEntry.js',
      name: 'system'
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './system-provider': './modules/system/components/system-provider/system-provider'
        },
        filename: 'static/ssr/remoteEntry.js',
        name: 'system'
      }
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './system-provider': './modules/system/components/system-provider/system-provider'
        },
        filename: 'static/chunks/remoteEntry.js',
        name: 'system'
      }
    }));

    return config;
  }
};
