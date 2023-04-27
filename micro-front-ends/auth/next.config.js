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
        './auth-provider': './modules/auth/components/auth-provider/auth-provider',
        './sign-in-form': './modules/auth/components/sign-in-form/sign-in-form'
      },
      filename: 'static/chunks/remoteEntry.js',
      name: 'auth'
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './auth-provider': './modules/auth/components/auth-provider/auth-provider',
          './sign-in-form': './modules/auth/components/sign-in-form/sign-in-form'
        },
        filename: 'static/ssr/remoteEntry.js',
        name: 'auth'
      }
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './auth-provider': './modules/auth/components/auth-provider/auth-provider',
          './sign-in-form': './modules/auth/components/sign-in-form/sign-in-form'
        },
        filename: 'static/chunks/remoteEntry.js',
        name: 'auth'
      }
    }));

    return config;
  }
};
