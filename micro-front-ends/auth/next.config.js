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
        './protected-content': './modules/auth/components/protected-content/protected-content',
        './sign-in-form': './modules/auth/components/sign-in-form/sign-in-form',
        './sign-out-form': './modules/auth/components/sign-out-form/sign-out-form',
        './sign-up-form': './modules/auth/components/sign-up-form/sign-up-form'
      },
      filename: 'static/chunks/remoteEntry.js',
      name: 'auth'
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './auth-provider': './modules/auth/components/auth-provider/auth-provider',
          './protected-content': './modules/auth/components/protected-content/protected-content',
          './sign-in-form': './modules/auth/components/sign-in-form/sign-in-form',
          './sign-out-form': './modules/auth/components/sign-out-form/sign-out-form',
          './sign-up-form': './modules/auth/components/sign-up-form/sign-up-form'
        },
        filename: 'static/ssr/remoteEntry.js',
        name: 'auth'
      }
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './auth-provider': './modules/auth/components/auth-provider/auth-provider',
          './protected-content': './modules/auth/components/protected-content/protected-content',
          './sign-in-form': './modules/auth/components/sign-in-form/sign-in-form',
          './sign-out-form': './modules/auth/components/sign-out-form/sign-out-form',
          './sign-up-form': './modules/auth/components/sign-up-form/sign-up-form'
        },
        filename: 'static/chunks/remoteEntry.js',
        name: 'auth'
      }
    }));

    return config;
  }
};
