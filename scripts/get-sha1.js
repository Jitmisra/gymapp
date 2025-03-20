const { exec } = require('child_process');
const os = require('os');
const path = require('path');

// Determine OS and set keystore path
const isWindows = os.platform() === 'win32';
const homeDir = os.homedir();
const debugKeystorePath = isWindows 
  ? path.join(homeDir, '.android', 'debug.keystore').replace(/\\/g, '\\\\')
  : path.join(homeDir, '.android', 'debug.keystore');

// Command to get SHA-1 from debug keystore
const command = isWindows
  ? `keytool -list -v -keystore "${debugKeystorePath}" -alias androiddebugkey -storepass android -keypass android`
  : `keytool -list -v -keystore ${debugKeystorePath} -alias androiddebugkey -storepass android -keypass android`;

console.log('Obtaining SHA-1 fingerprint from debug keystore...');
console.log(`Using keystore path: ${debugKeystorePath}`);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Error executing keytool command:', error.message);
    console.log('\nManual instructions:');
    console.log('1. Make sure Java is installed and in your PATH');
    console.log('2. Run this command manually:');
    console.log(`   ${command}`);
    return;
  }
  
  if (stderr) {
    console.error('Command produced errors:', stderr);
    return;
  }
  
  // Extract the SHA-1 fingerprint from the output
  const sha1Match = stdout.match(/SHA1: ([\w:]+)/);
  if (sha1Match && sha1Match[1]) {
    const sha1 = sha1Match[1];
    console.log('\n============ SUCCESS ============');
    console.log('SHA-1 Fingerprint:', sha1);
    console.log('\nAdd this fingerprint to your Google Cloud Console under:');
    console.log('APIs & Services > Credentials > Create Credentials > OAuth Client ID');
    
    const appJsonPath = path.join(__dirname, '..', 'app.json');
    console.log(`\nYour package name (from ${appJsonPath}):`);
    try {
      const appJson = require('../app.json');
      const packageName = appJson.expo?.android?.package || 'com.yourcompany.fittler';
      console.log(packageName);
    } catch (e) {
      console.log('Could not read package name from app.json');
    }
    
    console.log('\n================================');
  } else {
    console.log('Could not find SHA-1 fingerprint in keytool output.');
    console.log('Full output:');
    console.log(stdout);
  }
});
