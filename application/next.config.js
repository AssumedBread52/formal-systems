const { NextFederationPlugin } = require('@module-federation/nextjs-mf');
const { FederatedTypesPlugin } = require('@module-federation/typescript');

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
        auth: isServer ? 'auth@http://micro-front-end-auth:3001/_next/static/ssr/remoteEntry.js' : 'auth@http://localhost:3001/_next/static/chunks/remoteEntry.js',
        user: isServer ? 'user@http://micro-front-end-user:3003/_next/static/ssr/remoteEntry.js' : 'user@http://localhost:3003/_next/static/chunks/remoteEntry.js'
      }
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {},
        filename: 'static/chunks/remoteEntry.js',
        name: 'application',
        remotes: {
          auth: isServer ? 'auth@http://micro-front-end-auth:3001/_next/static/ssr/remoteEntry.js' : 'auth@http://micro-front-end-auth:3001/_next/static/chunks/remoteEntry.js',
          user: isServer ? 'user@http://micro-front-end-user:3003/_next/static/ssr/remoteEntry.js' : 'user@http://micro-front-end-user:3003/_next/static/chunks/remoteEntry.js'
        }
      }
    }));

    return config;
  }
};
