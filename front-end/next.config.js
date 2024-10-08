/** @type {import('next').NextConfig} */
module.exports = {
  redirects: async () => {
    return [
      {
        source: '/edit-profile',
        destination: '/sign-up',
        permanent: false,
        missing: [
          {
            type: 'cookie',
            key: 'token'
          }
        ]
      },
      {
        source: '/sign-in',
        destination: '/sign-out',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'token'
          }
        ]
      },
      {
        source: '/sign-out',
        destination: '/sign-in',
        permanent: false,
        missing: [
          {
            type: 'cookie',
            key: 'token'
          }
        ]
      },
      {
        source: '/sign-up',
        destination: '/edit-profile',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'token'
          }
        ]
      }
    ];
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `https://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/:path*`
      }
    ];
  }
};
