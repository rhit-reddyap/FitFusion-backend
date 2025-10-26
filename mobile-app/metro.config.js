const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Add any additional asset extensions here
);

// Add support for additional source extensions
config.resolver.sourceExts.push(
  // Add any additional source extensions here
);

// Configure module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;






