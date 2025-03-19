import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import health libraries conditionally to prevent errors
let AppleHealthKit;
let GoogleFit;

if (Platform.OS === 'ios') {
  AppleHealthKit = require('react-native-health').default;
} else if (Platform.OS === 'android') {
  GoogleFit = require('react-native-google-fit').default;
}

// Define health permissions for iOS
const APPLE_HEALTH_PERMISSIONS = {
  permissions: {
    read: [
      'Steps',
      'DistanceWalking',
      'DistanceCycling',
      'ActiveEnergyBurned',
      'Workout',
    ],
    write: [
      'Steps',
      'DistanceWalking',
      'DistanceCycling',
      'ActiveEnergyBurned',
      'Workout',
    ],
  },
};

class HealthTracker {
  constructor() {
    this.isInitialized = false;
    this.connectedApps = {
      googleFit: false,
      appleHealth: false,
      samsungHealth: false,
    };
    this.healthData = {
      steps: 0,
      calories: 0,
      distance: 0,
      activeMinutes: 0,
      lastSync: null,
    };
    
    // Load previously connected apps
    this.loadConnectedApps();
  }

  // Load connected app status from AsyncStorage
  async loadConnectedApps() {
    try {
      const savedConnections = await AsyncStorage.getItem('healthAppConnections');
      if (savedConnections) {
        this.connectedApps = JSON.parse(savedConnections);
      }
      
      // Auto initialize if we have connected apps
      if (this.isAnyAppConnected()) {
        this.initialize();
      }
    } catch (error) {
      console.error('Error loading health app connections:', error);
    }
  }

  // Save connected app status to AsyncStorage
  async saveConnectedApps() {
    try {
      await AsyncStorage.setItem('healthAppConnections', JSON.stringify(this.connectedApps));
    } catch (error) {
      console.error('Error saving health app connections:', error);
    }
  }

  // Check if any health app is connected
  isAnyAppConnected() {
    return this.connectedApps.googleFit || 
           this.connectedApps.appleHealth || 
           this.connectedApps.samsungHealth;
  }

  // Initialize health tracking based on connected apps
  async initialize() {
    if (this.isInitialized) return true;
    
    // Initialize Apple Health on iOS
    if (Platform.OS === 'ios' && this.connectedApps.appleHealth) {
      try {
        return new Promise((resolve, reject) => {
          AppleHealthKit.initHealthKit(APPLE_HEALTH_PERMISSIONS, (error) => {
            if (error) {
              console.log('Error initializing Apple HealthKit:', error);
              reject(error);
              return;
            }
            console.log('Apple HealthKit initialized successfully');
            this.isInitialized = true;
            resolve(true);
          });
        });
      } catch (error) {
        console.error('Failed to initialize Apple HealthKit:', error);
        return false;
      }
    }
    
    // Initialize Google Fit on Android
    if (Platform.OS === 'android' && this.connectedApps.googleFit) {
      try {
        const options = {
          scopes: [
            GoogleFit.Scopes.FITNESS_ACTIVITY_READ,
            GoogleFit.Scopes.FITNESS_ACTIVITY_WRITE,
            GoogleFit.Scopes.FITNESS_BODY_READ,
            GoogleFit.Scopes.FITNESS_BODY_WRITE,
            GoogleFit.Scopes.FITNESS_LOCATION_READ,
          ],
        };
        
        const authResult = await GoogleFit.authorize(options);
        if (authResult.success) {
          console.log('Google Fit authorization successful');
          await GoogleFit.startRecording((callback) => {
            console.log('Google Fit recording started');
          });
          this.isInitialized = true;
          return true;
        } else {
          console.log('Google Fit authorization denied', authResult);
          return false;
        }
      } catch (error) {
        console.error('Failed to initialize Google Fit:', error);
        return false;
      }
    }
    
    // Samsung Health requires additional setup
    if (Platform.OS === 'android' && this.connectedApps.samsungHealth) {
      console.log('Samsung Health integration would require additional native modules');
      return false;
    }
    
    return this.isInitialized;
  }

  // Connect to a health app
  async connectToHealthApp(appName) {
    // Don't reconnect if already connected
    if (this.connectedApps[appName]) return true;
    
    // Set as connected before initialization to enable the right flow
    this.connectedApps[appName] = true;
    
    // Try to initialize
    const success = await this.initialize();
    
    // If initialization failed, reset the connection state
    if (!success) {
      this.connectedApps[appName] = false;
      await this.saveConnectedApps();
      return false;
    }
    
    // Save connection state
    await this.saveConnectedApps();
    return true;
  }

  // Disconnect from a health app
  async disconnectFromHealthApp(appName) {
    this.connectedApps[appName] = false;
    await this.saveConnectedApps();
    
    // Reset initialization state to force re-init when needed
    this.isInitialized = false;
    return true;
  }

  // Get daily step count
  async getDailySteps() {
    if (!this.isInitialized && !await this.initialize()) {
      console.log('Health tracker not initialized');
      return 0;
    }
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    try {
      // Apple Health steps query
      if (Platform.OS === 'ios' && this.connectedApps.appleHealth) {
        const options = {
          startDate: startOfDay.toISOString(),
          endDate: new Date().toISOString(),
        };
        
        return new Promise((resolve) => {
          AppleHealthKit.getStepCount(options, (err, results) => {
            if (err) {
              console.error('Error getting steps from Apple Health:', err);
              resolve(0);
              return;
            }
            this.healthData.steps = results.value || 0;
            this.healthData.lastSync = new Date();
            resolve(this.healthData.steps);
          });
        });
      }
      
      // Google Fit steps query
      if (Platform.OS === 'android' && this.connectedApps.googleFit) {
        const options = {
          startDate: startOfDay.toISOString(),
          endDate: new Date().toISOString(),
          bucketUnit: 'DAY',
          bucketInterval: 1,
        };
        
        const res = await GoogleFit.getDailyStepCountSamples(options);
        
        if (res.length > 0) {
          // Get step data from the first available source
          for (const source of res) {
            if (source.steps.length > 0) {
              // Use the last entry for today
              const stepsToday = source.steps[source.steps.length - 1]?.value || 0;
              this.healthData.steps = stepsToday;
              this.healthData.lastSync = new Date();
              return stepsToday;
            }
          }
        }
      }
      
      return this.healthData.steps;
    } catch (error) {
      console.error('Error getting step data:', error);
      return 0;
    }
  }
  
  // Get daily calories burned
  async getDailyCalories() {
    if (!this.isInitialized && !await this.initialize()) {
      return 0;
    }
    
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    try {
      // Apple Health calories query
      if (Platform.OS === 'ios' && this.connectedApps.appleHealth) {
        const options = {
          startDate: startOfDay.toISOString(),
          endDate: new Date().toISOString(),
        };
        
        return new Promise((resolve) => {
          AppleHealthKit.getActiveEnergyBurned(options, (err, results) => {
            if (err) {
              console.error('Error getting calories from Apple Health:', err);
              resolve(0);
              return;
            }
            this.healthData.calories = results.value || 0;
            resolve(this.healthData.calories);
          });
        });
      }
      
      // Google Fit calories query
      if (Platform.OS === 'android' && this.connectedApps.googleFit) {
        const options = {
          startDate: startOfDay.toISOString(),
          endDate: new Date().toISOString(),
        };
        
        const res = await GoogleFit.getDailyCalorieSamples(options);
        if (res.length > 0) {
          // Sum up all calorie entries for the day
          const calories = res.reduce((sum, entry) => sum + entry.calorie, 0);
          this.healthData.calories = calories;
          return calories;
        }
      }
      
      return this.healthData.calories;
    } catch (error) {
      console.error('Error getting calorie data:', error);
      return 0;
    }
  }

  // Get all health data at once
  async getAllHealthData() {
    await this.getDailySteps();
    await this.getDailyCalories();
    
    // Save last sync time
    this.healthData.lastSync = new Date();
    
    return this.healthData;
  }
  
  // Get connected app status
  getConnectedApps() {
    return this.connectedApps;
  }
}

// Create a singleton instance
const healthTracker = new HealthTracker();
export default healthTracker;
