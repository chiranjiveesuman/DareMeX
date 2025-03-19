const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Set the EXPO_ROUTER_APP_ROOT environment variable
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(path.resolve(__dirname, 'app')),
      'process.env.NODE_ENV': JSON.stringify(env.mode || 'development'),
    })
  );

  // Add proper context for require.context
  config.resolve.modules = [
    path.resolve(__dirname, 'app'),
    'node_modules',
  ];

  // Ensure proper handling of require.context
  config.module.rules.push({
    test: /\.tsx?$/,
    include: /node_modules\/expo-router/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['babel-preset-expo'],
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          '@babel/plugin-proposal-class-properties',
        ],
      },
    },
  });

  // Add fallback for require.context
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: require.resolve('path-browserify'),
  };

  return config;
};
