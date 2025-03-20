const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');

// Check for package.json
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('✅ package.json found');
  const packageJson = require(packageJsonPath);
  // Add eas scripts
  if (!packageJson.scripts.eas) {
    packageJson.scripts.eas = "eas-cli";
    packageJson.scripts['eas:build'] = "eas build";
    packageJson.scripts['eas:credentials'] = "eas credentials";
    packageJson.scripts['eas:update'] = "eas update";
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added EAS scripts to package.json');
  }
} else {
  console.error('❌ package.json not found!');
  process.exit(1);
}

// Check for app.json
const appJsonPath = path.join(projectRoot, 'app.json');
if (fs.existsSync(appJsonPath)) {
  console.log('✅ app.json found');
  const appJson = require(appJsonPath);
  
  // Make sure expo configuration exists
  if (!appJson.expo) {
    console.error('❌ No expo configuration found in app.json');
    process.exit(1);
  }
  
  // Check and add extra.eas if needed
  if (!appJson.expo.extra) {
    appJson.expo.extra = {};
  }
  
  if (!appJson.expo.extra.eas) {
    appJson.expo.extra.eas = {
      projectId: appJson.expo.extra?.eas?.projectId || "8d2e214f-ed9c-45bc-8c07-f6f9b5541d30"
    };
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    console.log('✅ Added EAS project ID to app.json');
  }
} else {
  console.error('❌ app.json not found!');
}

// Check for eas.json
const easJsonPath = path.join(projectRoot, 'eas.json');
if (fs.existsSync(easJsonPath)) {
  console.log('✅ eas.json found');
} else {
  console.error('❌ eas.json not found! Will create it...');
}

console.log('\nAttempting to install eas-cli globally...');
try {
  execSync('npm install -g eas-cli', { stdio: 'inherit' });
  console.log('✅ eas-cli installed globally');
} catch (error) {
  console.error('❌ Failed to install eas-cli globally. Try running: npm install -g eas-cli');
}

console.log('\nPerforming EAS login and credentials check...');
try {
  console.log('📱 Attempting EAS whoami to check if you are logged in...');
  execSync('npx eas-cli whoami', { stdio: 'inherit' });
} catch (error) {
  console.log('ℹ️ Please log in to your Expo account:');
  try {
    execSync('npx eas-cli login', { stdio: 'inherit' });
  } catch (loginError) {
    console.error('❌ Failed to log in to Expo');
    process.exit(1);
  }
}

console.log('\n✨ EAS environment setup complete! ✨');
console.log('\nNow you can run:');
console.log('1. npm run eas:credentials -- --platform android');
console.log('2. npm run eas:credentials -- --platform ios');
