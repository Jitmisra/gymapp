const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Define paths
const homeDir = os.homedir();
const androidDir = path.join(homeDir, '.android');
const keystorePath = path.join(androidDir, 'debug.keystore');

// Ensure Android directory exists
if (!fs.existsSync(androidDir)) {
  console.log(`Creating Android directory at ${androidDir}...`);
  fs.mkdirSync(androidDir, { recursive: true });
}

// Check if keystore already exists
if (fs.existsSync(keystorePath)) {
  console.log(`Debug keystore already exists at: ${keystorePath}`);
  getFingerprint();
} else {
  console.log(`Generating new debug keystore at: ${keystorePath}`);
  
  // Command to generate a new debug keystore - use 'keytool' directly without specifying path
  const genCommand = `keytool -genkeypair -v -keystore "${keystorePath}" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"`;
  
  console.log('Executing command:', genCommand);
  
  exec(genCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error generating debug keystore:', error.message);
      console.log('\nManual instructions:');
      console.log('1. Make sure Java/keytool is installed and in your PATH');
      console.log(`2. Run this command manually:\n   ${genCommand}`);
      return;
    }
    
    console.log('Debug keystore generated successfully!');
    getFingerprint();
  });
}

// Function to get SHA-1 fingerprint
function getFingerprint() {
  const command = `keytool -list -v -keystore "${keystorePath}" -alias androiddebugkey -storepass android -keypass android`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error getting fingerprint:', error.message);
      return;
    }
    
    // Extract the SHA-1 fingerprint from the output
    const sha1Match = stdout.match(/SHA1: ([\w:]+)/);
    const sha256Match = stdout.match(/SHA256: ([\w:]+)/);
    
    if (sha1Match && sha1Match[1]) {
      const sha1 = sha1Match[1];
      console.log('\n============ SUCCESS ============');
      console.log('SHA-1 Fingerprint:', sha1);
      
      if (sha256Match && sha256Match[1]) {
        console.log('SHA-256 Fingerprint:', sha256Match[1]);
      }
      
      console.log('\nAdd this SHA-1 fingerprint to your Google Cloud Console:');
      console.log('APIs & Services > Credentials > Create Credentials > OAuth Client ID');
      
      // Get package name from app.json
      try {
        const appJsonPath = path.join(__dirname, '..', 'app.json');
        const appJson = require(appJsonPath);
        const packageName = appJson.expo?.android?.package || 'com.yourcompany.fittler';
        console.log(`\nYour package name: ${packageName}`);
        
        // Update the googleFitCredentials.json file with the new SHA-1
        try {
          const credentialsPath = path.join(__dirname, '..', 'src', 'config', 'googleFitCredentials.json');
          if (fs.existsSync(credentialsPath)) {
            let credentials = require(credentialsPath);
            credentials.sha1_fingerprint = sha1;
            fs.writeFileSync(
              credentialsPath, 
              JSON.stringify(credentials, null, 2), 
              'utf8'
            );
            console.log(`\nUpdated SHA-1 fingerprint in: ${credentialsPath}`);
          }
        } catch (e) {
          console.log('\nCould not automatically update googleFitCredentials.json');
        }
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
}
