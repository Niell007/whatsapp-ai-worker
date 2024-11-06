const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/worker.js',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true
  },
  mode: 'production',
  target: ['webworker', 'es2022'],
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "process": false,
      "fs": false,
      "net": false,
      "tls": false,
      "child_process": false,
      "os": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: require.resolve('process/browser')
    }),
    new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
      const mod = resource.request.replace(/^node:/, '');
      if (mod === 'buffer') {
        resource.request = 'buffer';
      } else if (mod === 'stream') {
        resource.request = 'stream-browserify';
      } else {
        resource.request = mod;
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: 'current',
                },
                modules: false
              }]
            ]
          }
        }
      }
    ]
  }
};
