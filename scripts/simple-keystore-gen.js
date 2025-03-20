const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Define paths
const homeDir = os.homedir();
const androidDir = path.join(homeDir, '.android');
const keystorePath = path.join(androidDir, 'debug.keystore');

try {
  // Create .android directory if it doesn't exist
  if (!fs.existsSync(androidDir)) {
    fs.mkdirSync(androidDir, { recursive: true });
    console.log(`Created directory: ${androidDir}`);
  }
  
  // Generate keystore using synchronous exec
  console.log('Generating keystore...');
  const command = `keytool -genkeypair -v -keystore "${keystorePath}" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('Keystore generated successfully!');
  
  // Now print the fingerprint
  console.log('Getting SHA-1 fingerprint...');
  const fingerprintOutput = execSync(
    `keytool -list -v -keystore "${keystorePath}" -alias androiddebugkey -storepass android -keypass android`,
    { encoding: 'utf8' }
  );
  
  const sha1Match = fingerprintOutput.match(/SHA1: ([\w:]+)/);
  if (sha1Match && sha1Match[1]) {
    console.log('SHA-1 Fingerprint:', sha1Match[1]);
    
    // Update the credentials file
    const credentialsPath = path.join(__dirname, '..', 'src', 'config', 'googleFitCredentials.json');
    if (fs.existsSync(credentialsPath)) {
      const credentials = require(credentialsPath);
      credentials.sha1_fingerprint = sha1Match[1];
      fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2), 'utf8');
      console.log(`Updated SHA-1 fingerprint in: ${credentialsPath}`);
    }
  }
} catch (error) {
  console.error('Error:', error.message);
  console.log('\nMake sure you have Java installed and keytool is in your PATH.');
}
