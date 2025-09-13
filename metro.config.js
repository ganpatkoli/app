// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// keep your aliases
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  'react-native$': 'react-native-web',
  crypto: require.resolve('react-native-get-random-values'),
};

module.exports = config;
