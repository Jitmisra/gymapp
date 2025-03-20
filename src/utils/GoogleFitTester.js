import { Platform } from 'react-native';

// This is a debug utility to test Google Fit functionality

const testGoogleFit = async () => {
  // Only run on Android
  if (Platform.OS !== 'android') {
    console.log('GoogleFitTester: Only works on Android');
    return { success: false, message: 'Not on Android platform' };
  }
  
  const results = {
    moduleLoaded: false,
    methods: [],
    authorizeAvailable: false,
    authorizeResult: null,
    recordingAvailable: false,
    recordingResult: null,
    errors: []
  };
  
  try {
    // Try to load the module
    console.log('GoogleFitTester: Loading Google Fit module');
    const GoogleFitModule = require('react-native-google-fit');
    
    const GoogleFit = GoogleFitModule.default || GoogleFitModule;
    results.moduleLoaded = !!GoogleFit;
    
    if (!GoogleFit) {
      results.errors.push('Failed to load Google Fit module');
      return results;
    }
    
    // Check available methods
    results.methods = Object.keys(GoogleFit);
    console.log('GoogleFitTester: Available methods:', results.methods);
    
    // Test authorize method
    results.authorizeAvailable = typeof GoogleFit.authorize === 'function';
    
    if (results.authorizeAvailable) {
      try {
        console.log('GoogleFitTester: Testing authorization');
        const authResult = await GoogleFit.authorize({
          scopes: [
            'https://www.googleapis.com/auth/fitness.activity.read',
            'https://www.googleapis.com/auth/fitness.body.read'
          ]
        });
        
        results.authorizeResult = authResult;
        console.log('GoogleFitTester: Authorization result:', authResult);
      } catch (authError) {
        console.error('GoogleFitTester: Authorization error:', authError);
        results.errors.push('Authorization error: ' + (authError?.message || 'Unknown error'));
      }
    }
    
    // Test recording
    results.recordingAvailable = typeof GoogleFit.startRecording === 'function';
    
    if (results.recordingAvailable && results.authorizeResult?.success) {
      try {
        console.log('GoogleFitTester: Testing recording');
        await GoogleFit.startRecording({
          dataTypes: ['step', 'calories']
        });
        results.recordingResult = 'Success';
      } catch (recordError) {
        console.error('GoogleFitTester: Recording error:', recordError);
        results.errors.push('Recording error: ' + (recordError?.message || 'Unknown error'));
      }
    }
    
    return results;
  } catch (error) {
    console.error('GoogleFitTester: General error:', error);
    results.errors.push('General error: ' + (error?.message || 'Unknown error'));
    return results;
  }
};

export default testGoogleFit;
