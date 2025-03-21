const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Project root directory
const rootDir = path.resolve(__dirname, '..');

// Function to read and parse JSON files
const readJsonFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return null;
  }
};

// Function to write JSON files
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Successfully wrote to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error.message);
    return false;
  }
};

// Main function to fix EAS configuration
const fixEasConfig = () => {
  console.log('🛠️  Starting EAS update configuration fix...');

  // Fix eas.json - remove updates field if present
  const easJsonPath = path.join(rootDir, 'eas.json');
  const easJson = readJsonFile(easJsonPath);
  
  if (easJson) {
    if (easJson.updates) {
      console.log('Removing "updates" field from eas.json as it\'s not supported in your EAS CLI version');
      delete easJson.updates;
      writeJsonFile(easJsonPath, easJson);
    } else {
      console.log('eas.json already configured correctly without "updates" field');
    }
  }

  // Check and fix app.json
  const appJsonPath = path.join(rootDir, 'app.json');
  const appJson = readJsonFile(appJsonPath);

  if (appJson && appJson.expo) {
    // Ensure expo-updates is properly configured
    if (!appJson.expo.plugins || !appJson.expo.plugins.includes('expo-updates')) {
      console.log('Adding expo-updates to plugins array in app.json');
      appJson.expo.plugins = [...(appJson.expo.plugins || []), 'expo-updates'];
    }

    // Ensure app.json has project ID
    if (!appJson.expo.extra || !appJson.expo.extra.eas || !appJson.expo.extra.eas.projectId) {
      console.log('Setting projectId in app.json');
      appJson.expo.extra = {
        ...(appJson.expo.extra || {}),
        eas: {
          ...(appJson.expo.extra?.eas || {}),
          projectId: '8d2e214f-ed9c-45bc-8c07-f6f9b5541d30'
        }
      };
    }

    // Ensure runtime version policy is set correctly
    if (!appJson.expo.runtimeVersion) {
      console.log('Setting runtimeVersion policy in app.json');
      appJson.expo.runtimeVersion = {
        policy: 'appVersion'
      };
    }

    // Ensure updates configuration is correct
    if (!appJson.expo.updates || !appJson.expo.updates.url) {
      console.log('Setting updates configuration in app.json');
      appJson.expo.updates = {
        ...(appJson.expo.updates || {}),
        url: 'https://u.expo.dev/8d2e214f-ed9c-45bc-8c07-f6f9b5541d30',
        enabled: true,
        fallbackToCacheTimeout: 0
      };
    }

    // Write updated app.json
    writeJsonFile(appJsonPath, appJson);
    console.log('app.json has been updated successfully');
  }

  console.log('\n✅ EAS configuration fix completed!');
  console.log('\nNext steps:');
  console.log('1. Run: npm install -g eas-cli@latest (to ensure you have the latest EAS CLI)');
  console.log('2. Run: eas update:configure');
  console.log('3. Run: eas update');
  console.log('\nIf issues persist, try running: expo prebuild --clean');
};

// Execute the fix
fixEasConfig();
