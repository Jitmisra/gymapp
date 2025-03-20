import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PermissionsManager from './PermissionsManager';

// Define direct scopes - don't rely on GoogleFit.Scopes which may be undefined
const DIRECT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read'
];

let GoogleFit;
let isGoogleFitLoaded = false;

// Try to load the Google Fit module with more defensive checks
try {
  if (Platform.OS === 'android') {
    const GoogleFitModule = require('react-native-google-fit');
    
    // Store the module regardless of whether it's default export or not
    GoogleFit = GoogleFitModule.default || GoogleFitModule;
    isGoogleFitLoaded = !!GoogleFit;
    
    console.log('GoogleFitManager: Library loaded successfully:', isGoogleFitLoaded);
    
    // Additional checks to understand what we're working with
    if (GoogleFit) {
      console.log('GoogleFitManager: Available methods:', Object.keys(GoogleFit).join(', '));
    }
  } else {
    console.log('GoogleFitManager: Not on Android, skipping Google Fit');
  }
} catch (error) {
  console.error('GoogleFitManager: Error loading Google Fit library:', error);
}

class GoogleFitManager {
  constructor() {
    this.isAuthorized = false;
    this.isInitialized = false;
    this.lastError = null;
    this.authRetries = 0;
    this.maxRetries = 3;
  }

  // Check if Google Fit is available on this device
  async checkAvailability() {
    try {
      if (!isGoogleFitLoaded) {
        console.error('GoogleFitManager: GoogleFit module not available');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('GoogleFitManager: Error checking availability:', error);
      this.lastError = error;
      return false;
    }
  }

  // Authorize with Google Fit - improved to handle cancellation
  async authorize() {
    try {
      if (!isGoogleFitLoaded || !GoogleFit) {
        console.error('GoogleFitManager: GoogleFit module not available');
        return { success: false, message: 'Google Fit module not available' };
      }
      
      if (typeof GoogleFit.authorize !== 'function') {
        console.error('GoogleFitManager: authorize method not available');
        return { 
          success: false, 
          message: 'Google Fit authorize method not available' 
        };
      }
      
      console.log('GoogleFitManager: Requesting authorization with direct scopes');
      
      // Use a simpler authorization approach with direct scopes
      const options = { 
        scopes: DIRECT_SCOPES,
        // Add client ID if available
        client_id: this.getOAuthClientId()
      };
      
      // Display options for debugging (except client_id for security)
      const debugOptions = {...options};
      if (debugOptions.client_id) debugOptions.client_id = "REDACTED";
      console.log("Auth options:", JSON.stringify(debugOptions));
      
      try {
        // Wrap the authorize call in another try-catch for more specific error handling
        const authResult = await GoogleFit.authorize(options);
        console.log('GoogleFitManager: Raw authorization result:', JSON.stringify(authResult));
        
        if (authResult && authResult.success) {
          this.isAuthorized = true;
          this.authRetries = 0; // Reset retry counter on success
          console.log('GoogleFitManager: Authorization successful');
          
          // Store auth status
          await AsyncStorage.setItem('@googlefit_authorized', 'true');
          return { success: true };
        } else if (authResult && authResult.message && authResult.message.includes('cancel')) {
          // Handle authentication cancellation specifically
          console.log('GoogleFitManager: User cancelled authorization');
          return { 
            success: false, 
            message: 'Authorization was cancelled by user',
            cancelled: true
          };
        } else {
          // If we get here, authorization failed but didn't throw an error
          const errorMessage = authResult?.message || 'Unknown authorization failure';
          console.error('GoogleFitManager: Authorization failed:', errorMessage);
          this.lastError = new Error(errorMessage);
          return { 
            success: false, 
            message: errorMessage 
          };
        }
      } catch (authError) {
        // This catches errors thrown by the GoogleFit.authorize method
        console.error('GoogleFitManager: Error during authorize call:', authError);
        this.lastError = authError;
        
        // Check if the error message suggests cancellation
        const errorMessage = authError?.message || 'Error during authorization';
        const isCancelled = errorMessage.toLowerCase().includes('cancel') || 
                           errorMessage.toLowerCase().includes('denied');
        
        return { 
          success: false, 
          message: errorMessage,
          error: authError,
          cancelled: isCancelled
        };
      }
    } catch (setupError) {
      // This catches errors in our own code before calling GoogleFit.authorize
      console.error('GoogleFitManager: Error setting up authorization:', setupError);
      this.lastError = setupError;
      return { 
        success: false, 
        message: setupError?.message || 'Unknown error during authorization setup',
        error: setupError
      };
    }
  }

  // Get OAuth client ID for Google Fit
  getOAuthClientId() {
    // Check for environment/config defined client ID first
    try {
      // Import credentials file if it exists
      const credentials = require('../config/googleFitCredentials.json');
      if (credentials && credentials.client_id) {
        console.log('GoogleFitManager: Using client ID from credentials file');
        return credentials.client_id;
      }
    } catch (e) {
      console.log('GoogleFitManager: No credentials file found');
    }
    
    // Otherwise return null - the library will use the default behavior
    return null;
  }

  // Start recording fitness data - updated to handle callback errors
  async startRecording() {
    if (!isGoogleFitLoaded || !GoogleFit) {
      console.error('GoogleFitManager: GoogleFit not available');
      return false;
    }
    
    try {
      console.log('GoogleFitManager: Checking startRecording availability');
      
      // Only try to record if the function exists
      if (typeof GoogleFit.startRecording === 'function') {
        console.log('GoogleFitManager: Attempting to start recording');
        
        // Fix: Check if startRecording accepts options or uses callbacks
        if (GoogleFit.startRecording.length > 0) {
          // Modern version using Promise/options
          await GoogleFit.startRecording({
            dataTypes: ['step', 'calories']
          });
        } else {
          // Legacy version with callback may exist
          return new Promise((resolve) => {
            GoogleFit.startRecording(['step', 'calories'], () => {
              console.log('GoogleFitManager: Recording started (callback)');
              resolve(true);
            });
          });
        }
        console.log('GoogleFitManager: Recording started');
      } else {
        console.log('GoogleFitManager: startRecording not available, skipping');
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('GoogleFitManager: Error in startRecording:', error);
      this.lastError = error;
      return false;
    }
  }

  // Fix: Safely check if an object is a function to prevent callback errors
  isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  }

  // Safely execute a method with a callback
  safeExecute(method, args, callback) {
    if (!this.isFunction(method)) {
      console.error(`Method is not a function: ${method}`);
      if (this.isFunction(callback)) {
        callback(new Error('Method not available'));
      }
      return;
    }
    
    try {
      // For methods that expect callbacks
      if (this.isFunction(callback)) {
        method(...args, callback);
      } else {
        // For methods that return promises
        return method(...args);
      }
    } catch (error) {
      console.error('Error executing method:', error);
      if (this.isFunction(callback)) {
        callback(error);
      }
      throw error;
    }
  }

  // Direct call to authorize Google Fit with retry logic
  async directAuthorize() {
    try {
      if (!isGoogleFitLoaded || !GoogleFit) {
        return { success: false, message: 'GoogleFit not available' };
      }
      
      if (typeof GoogleFit.authorize !== 'function') {
        return { success: false, message: 'authorize method not available' };
      }
      
      console.log('GoogleFitManager: Attempting direct authorization');
      
      // Check if we've exceeded retry attempts
      if (this.authRetries >= this.maxRetries) {
        return { 
          success: false, 
          message: 'Maximum authorization attempts exceeded',
          maxRetriesReached: true
        };
      }
      
      this.authRetries++;
      
      // Add client ID if available
      const authOptions = {
        scopes: DIRECT_SCOPES
      };
      
      const clientId = this.getOAuthClientId();
      if (clientId) {
        authOptions.client_id = clientId;
      }
      
      // Display options for debugging (except client_id for security)
      const debugOptions = {...authOptions};
      if (debugOptions.client_id) debugOptions.client_id = "REDACTED";
      console.log("Direct auth options:", JSON.stringify(debugOptions));
      
      // Attempt authorization
      const authResult = await GoogleFit.authorize(authOptions);
      
      console.log('Direct authorization result:', JSON.stringify(authResult));
      
      if (authResult && authResult.success) {
        this.authRetries = 0; // Reset on success
        this.isAuthorized = true;
      }
      
      return authResult || { success: false, message: 'No result from authorize' };
    } catch (error) {
      console.error('Direct authorization error:', error);
      
      // Check if error message suggests cancellation
      const errorMessage = error?.message || 'Error during direct authorization';
      const isCancelled = errorMessage.toLowerCase().includes('cancel') || 
                         errorMessage.toLowerCase().includes('denied');
      
      return { 
        success: false, 
        message: errorMessage,
        error,
        cancelled: isCancelled
      };
    }
  }

  // Start recording fitness data - updated to check permissions first
  async startRecording() {
    if (!isGoogleFitLoaded || !GoogleFit) {
      console.error('GoogleFitManager: GoogleFit not available');
      return false;
    }
    
    try {
      console.log('GoogleFitManager: Checking for activity recognition permission');
      
      // Check and request permissions first
      const hasPermission = await PermissionsManager.checkActivityRecognitionPermission();
      if (!hasPermission) {
        console.log('GoogleFitManager: Requesting activity recognition permission');
        const permissionGranted = await PermissionsManager.requestActivityRecognitionPermission();
        
        if (!permissionGranted) {
          console.error('GoogleFitManager: Activity recognition permission denied');
          this.lastError = new Error('Activity recognition permission denied');
          return false;
        }
      }
      
      console.log('GoogleFitManager: Checking startRecording availability');
      
      // Always use the modern promise-based call (remove legacy callback branch)
      if (typeof GoogleFit.startRecording === 'function') {
        console.log('GoogleFitManager: Attempting to start recording');
        await GoogleFit.startRecording({
          dataTypes: ['step', 'calories']
        });
        console.log('GoogleFitManager: Recording started');
      } else {
        console.log('GoogleFitManager: startRecording not available, skipping');
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('GoogleFitManager: Error in startRecording:', error);
      this.lastError = error;
      return false;
    }
  }

  // Get step count data
  async getDailySteps() {
    try {
      if (!GoogleFit || !this.isAuthorized) {
        console.error('GoogleFitManager: GoogleFit not available or not authorized');
        return 0;
      }
      
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      
      const options = {
        startDate: startOfDay.toISOString(),
        endDate: new Date().toISOString(),
        bucketUnit: 'DAY',
        bucketInterval: 1,
      };
      
      const res = await GoogleFit.getDailyStepCountSamples(options);
      
      if (res && res.length > 0) {
        // Try to find steps from any available source
        for (const source of res) {
          if (source.steps && source.steps.length > 0) {
            // Use the last entry for today
            const stepsToday = source.steps[source.steps.length - 1]?.value || 0;
            return stepsToday;
          }
        }
      }
      
      return 0;
    } catch (error) {
      console.error('GoogleFitManager: Error getting step data:', error);
      this.lastError = error;
      return 0;
    }
  }
  
  // Get diagnostic information - enhanced
  getDiagnostics() {
    let methodList = [];
    if (GoogleFit) {
      try {
        methodList = Object.keys(GoogleFit);
      } catch (e) {
        methodList = ['Error getting methods'];
      }
    }
    
    return {
      platform: Platform.OS,
      androidVersion: Platform.Version,
      isGoogleFitModuleLoaded: isGoogleFitLoaded,
      availableMethods: methodList,
      isAuthorized: this.isAuthorized,
      isInitialized: this.isInitialized,
      authRetries: this.authRetries,
      hasClientId: !!this.getOAuthClientId(),
      lastError: this.lastError ? this.lastError.message : null
    };
  }
  
  // Simplified auth check
  isAvailable() {
    return isGoogleFitLoaded && !!GoogleFit;
  }
  
  // Try connecting with a fallback approach and better error handling
  async tryConnect() {
    try {
      // Check for activity recognition permission first
      const hasPermission = await PermissionsManager.checkActivityRecognitionPermission();
      if (!hasPermission) {
        // Request permission with explanation
        const permissionGranted = await PermissionsManager.requestActivityRecognitionWithExplanation();
        if (!permissionGranted) {
          return {
            success: false,
            message: "Activity recognition permission is required to track steps and fitness data.",
            permissionDenied: true
          };
        }
      }
      
      // First try direct authorize with minimal options
      const directResult = await this.directAuthorize();
      console.log("Direct authorization attempt result:", JSON.stringify(directResult));
      
      if (directResult && directResult.success) {
        this.isAuthorized = true;
        return { success: true, method: 'direct' };
      }
      
      // Check for verification error specifically
      const isVerificationError = this.checkForVerificationError(directResult);
      if (isVerificationError) {
        return {
          success: false,
          message: "Google verification required",
          verificationRequired: true,
          details: "This app hasn't been verified by Google yet. Only test users can access it at this time."
        };
      }
      
      // Check for user cancellation - don't try another method if the user cancelled
      if (directResult && directResult.cancelled) {
        return {
          success: false,
          message: "Authentication was cancelled by user",
          cancelled: true
        };
      }
      
      // If max retries reached, don't continue
      if (directResult && directResult.maxRetriesReached) {
        return directResult;
      }
      
      // If that fails, try the standard authorize
      console.log('Direct approach failed, trying standard approach');
      const standardResult = await this.authorize();
      console.log("Standard authorization attempt result:", JSON.stringify(standardResult));
      
      if (standardResult && standardResult.success) {
        this.isAuthorized = true;
        return { success: true, method: 'standard' };
      }
      
      // Check for cancellation in standard approach too
      if (standardResult && standardResult.cancelled) {
        return {
          success: false, 
          message: "Authentication was cancelled by user",
          cancelled: true
        };
      }
      
      // If both fail, return the last error
      return { 
        success: false, 
        message: this.lastError?.message || 'All authorization attempts failed',
        directResult,
        standardResult
      };
    } catch (error) {
      console.error('GoogleFitManager: Error in tryConnect:', error);
      return {
        success: false,
        message: error?.message || 'Error in tryConnect',
        error
      };
    }
  }

  // Add new helper method to check for verification errors
  checkForVerificationError(result) {
    if (!result) return false;
    
    // Check the error object or message for signs of verification issues
    const errorMessage = result.message || 
                        (result.error && result.error.message) || 
                        '';
    
    const errorStr = errorMessage.toLowerCase();
    return errorStr.includes('verification') || 
           errorStr.includes('approved') || 
           errorStr.includes('test user') ||
           errorStr.includes('consent') ||
           errorStr.includes('not verified');
  }
}

// Create a singleton instance
const googleFitManager = new GoogleFitManager();
export default googleFitManager;
