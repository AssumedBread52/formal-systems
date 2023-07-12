/** @type {import('next').NextConfig} */
module.exports = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: `http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}`
      }
    ];
  }
};
