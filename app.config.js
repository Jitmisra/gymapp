const IS_DEV = process.env.APP_VARIANT === 'development';

// Base app configuration
const baseConfig = {
  name: "Fittler",
  slug: "fittler",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  plugins: [
    "expo-updates"
  ],
  updates: {
    url: "your-expo-updates-url-here",
  },
  web: {
    favicon: "./assets/favicon.png"
  }
};

// This is the configuration used by EAS Build
export default ({config}) => {
  // Get prebuild environment variable
  const isPrebuild = process.env.EAS_BUILD_RUNNER === 'prebuild';
  
  // Only include native configuration during prebuild
  // but not when building with EAS (since native dirs already exist)
  if (isPrebuild) {
    return {
      ...baseConfig,
      // Add native configuration here that will only be used during prebuild
      ios: {
        bundleIdentifier: "com.yourcompany.fittler",
        buildNumber: "1.0.0",
        // Add other iOS config
      },
      android: {
        package: "com.yourcompany.fittler",
        versionCode: 1,
        permissions: [
          "android.permission.INTERNET",
          "android.permission.ACTIVITY_RECOGNITION", // Make sure this is present
          "android.permission.ACCESS_FINE_LOCATION",
          "android.permission.ACCESS_COARSE_LOCATION",
          "android.permission.BODY_SENSORS",
          "com.google.android.gms.permission.ACTIVITY_RECOGNITION" // Both versions for compatibility
        ],
        googleServicesFile: "./google-services.json", // Make sure this file exists
      }
    };
  }
  
  // Return base config without native configuration for EAS Build
  return baseConfig;
};