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
        './edit-profile-form': './modules/user/components/edit-profile-form/edit-profile-form',
        './user-provider': './modules/user/components/user-provider/user-provider',
        './user-signature': './modules/user/components/user-signature/user-signature'
      },
      filename: 'static/chunks/remoteEntry.js',
      name: 'user'
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './edit-profile-form': './modules/user/components/edit-profile-form/edit-profile-form',
          './user-provider': './modules/user/components/user-provider/user-provider',
          './user-signature': './modules/user/components/user-signature/user-signature'
        },
        filename: 'static/ssr/remoteEntry.js',
        name: 'user'
      }
    }));
    config.plugins.push(new FederatedTypesPlugin({
      federationConfig: {
        exposes: {
          './edit-profile-form': './modules/user/components/edit-profile-form/edit-profile-form',
          './user-provider': './modules/user/components/user-provider/user-provider',
          './user-signature': './modules/user/components/user-signature/user-signature'
        },
        filename: 'static/chunks/remoteEntry.js',
        name: 'user'
      }
    }));

    return config;
  }
};
