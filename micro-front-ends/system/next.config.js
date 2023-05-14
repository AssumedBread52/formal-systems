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
        './create-system-form': './modules/system/components/create-system-form/create-system-form',
        './delete-system-form': './modules/system/components/delete-system-form/delete-system-form',
        './search-systems': './modules/system/components/search-systems/search-systems',
        './system-provider': './modules/system/components/system-provider/system-provider'
      },
      filename: 'static/chunks/remoteEntry.js',
      name: 'system',
      remotes: {
        auth: isServer ? 'auth@http://micro-front-end-auth:3001/_next/static/ssr/remoteEntry.js' : 'auth@http://localhost:3001/_next/static/chunks/remoteEntry.js',
        user: isServer ? 'user@http://micro-front-end-user:3003/_next/static/ssr/remoteEntry.js' : 'user@http://localhost:3003/_next/static/chunks/remoteEntry.js'
      }
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './create-system-form': './modules/system/components/create-system-form/create-system-form',
          './delete-system-form': './modules/system/components/delete-system-form/delete-system-form',
          './search-systems': './modules/system/components/search-systems/search-systems',
          './system-provider': './modules/system/components/system-provider/system-provider'
        },
        filename: 'static/ssr/remoteEntry.js',
        name: 'system',
        remotes: {
          auth: isServer ? 'auth@http://micro-front-end-auth:3001/_next/static/ssr/remoteEntry.js' : 'auth@http://micro-front-end-auth:3001/_next/static/chunks/remoteEntry.js',
          user: isServer ? 'user@http://micro-front-end-user:3003/_next/static/ssr/remoteEntry.js' : 'user@http://micro-front-end-user:3003/_next/static/chunks/remoteEntry.js'
        }
      }
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './create-system-form': './modules/system/components/create-system-form/create-system-form',
          './delete-system-form': './modules/system/components/delete-system-form/delete-system-form',
          './search-systems': './modules/system/components/search-systems/search-systems',
          './system-provider': './modules/system/components/system-provider/system-provider'
        },
        filename: 'static/chunks/remoteEntry.js',
        name: 'system',
        remotes: {
          auth: isServer ? 'auth@http://micro-front-end-auth:3001/_next/static/ssr/remoteEntry.js' : 'auth@http://micro-front-end-auth:3001/_next/static/chunks/remoteEntry.js',
          user: isServer ? 'user@http://micro-front-end-user:3003/_next/static/ssr/remoteEntry.js' : 'user@http://micro-front-end-user:3003/_next/static/chunks/remoteEntry.js'
        }
      }
    }));

    return config;
  }
};
