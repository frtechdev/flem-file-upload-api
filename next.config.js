// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
// };

// module.exports = nextConfig;


module.exports = (phase) => {
  return {
    async redirects() {
      return [
        {
          source: "/",
          destination: "/api",
          permanent: false,
        },
        {
          source: "/index.html",
          destination: "/api",
          permanent: false,
        },
      ];
    },
    reactStrictMode: true,
    swcMinify: true,
  };
};