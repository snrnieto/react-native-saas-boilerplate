const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Enable Fast Refresh
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Resolve React as a singleton to avoid multiple instances
// This fixes "React.default.createContext is not a function" in web builds
// This is a known issue with React 19 and Expo SDK 54 on web
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    react: path.resolve(__dirname, "node_modules/react"),
    "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    "react-i18next": path.resolve(__dirname, "node_modules/react-i18next/dist/commonjs/index.js"), // Fix for Trans.js resolution error
  },
};

// Ensure hot reloading works
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Enable CORS for hot reloading
      res.setHeader("Access-Control-Allow-Origin", "*");
      return middleware(req, res, next);
    };
  },
};

module.exports = withNativeWind(config, { input: "./global.css" });
