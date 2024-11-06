module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "constants": require.resolve("constants-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "stream": false,
        "dns": false,
        "module": false,
        "readline": false
      };
      return webpackConfig;
    }
  }
};
