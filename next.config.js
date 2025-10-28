module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.phimchieurap.club",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "phimchieurap.club",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.ophim.live",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",  
        hostname: "image.tmdb.org",
        pathname: "/**",
      },
      {
        protocol: "http",  
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
