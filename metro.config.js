// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...(config.resolver.alias || {}),
  "react-native$": "react-native-web",
  crypto: require.resolve("react-native-get-random-values"),
};

module.exports = config;
