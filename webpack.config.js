const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { BabelLoader } = require('@expo/webpack-config/plugins');

module.exports = async function (env, argv) {
  // Start with the default Expo config.
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 1. Explicitly handle font files.
  // This is the most critical change. It tells Webpack to find .ttf files
  // from the vector icons library and bundle them with the app.
  config.module.rules.push({
    test: /\.ttf$/,
    loader: 'url-loader', // This loader is great for fonts.
    include: require.resolve('react-native-vector-icons').split('/build/')[0],
  });

  // 2. Use the official Expo plugin to transpile the icon libraries.
  // This is a more modern and reliable way to ensure the JavaScript code
  // from these packages is compatible with web browsers.
  BabelLoader.include(config, {
    projectRoot: env.projectRoot,
    include: ['@expo/vector-icons', 'react-native-vector-icons'],
  });

  return config;
};

