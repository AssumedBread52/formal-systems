/** @type {import('next').NextConfig} */
module.exports = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `http://${process.env.BACK_END_HOSTNAME}:${process.env.BACK_END_PORT}/:path*`
      }
    ];
  }
};
