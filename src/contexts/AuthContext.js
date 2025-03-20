import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import healthTracker from '../utils/HealthTracker';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [bmiData, setBmiData] = useState(null);
  const [waterReminder, setWaterReminder] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [healthData, setHealthData] = useState({
    steps: 0,
    calories: 0,
    distance: 0,
    activeMinutes: 0,
    lastSync: null,
  });
  const [connectedHealthApps, setConnectedHealthApps] = useState({
    googleFit: false,
    appleHealth: false,
    samsungHealth: false,
  });

  // Load stored data on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Load user credentials and preferences
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUserData = await AsyncStorage.getItem('userData');
        const storedBmiData = await AsyncStorage.getItem('bmiData');
        const storedGuestMode = await AsyncStorage.getItem('isGuestMode');
        const storedWaterReminder = await AsyncStorage.getItem('waterReminder');
        
        // Parse stored data
        if (storedUserData) setUserData(JSON.parse(storedUserData));
        if (storedBmiData) setBmiData(JSON.parse(storedBmiData));
        if (storedToken) setUserToken(storedToken);
        if (storedGuestMode) setIsGuestMode(JSON.parse(storedGuestMode));
        if (storedWaterReminder) setWaterReminder(JSON.parse(storedWaterReminder));
        
        // Load health app connections
        try {
          const appConnections = healthTracker.getConnectedApps();
          setConnectedHealthApps(appConnections);
          
          // Load initial health data if any app is connected
          if (appConnections.googleFit || appConnections.appleHealth || appConnections.samsungHealth) {
            try {
              const data = await healthTracker.getAllHealthData();
              setHealthData(data);
            } catch (healthError) {
              console.error("Error loading health data:", healthError);
              // Continue even if health data loading fails
            }
          }
        } catch (healthAppError) {
          console.error("Error loading health app connections:", healthAppError);
          // Continue even if loading health app connections fails
        }
      } catch (e) {
        console.error("Error loading data from storage:", e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Function to update diet plan
  const updateDietPlan = async (newDietPlan) => {
    try {
      setDietPlan(newDietPlan);
      if (userToken) {
        await AsyncStorage.setItem(`@dietPlan_${userToken}`, JSON.stringify(newDietPlan));
      }
    } catch (error) {
      console.error('Error saving diet plan:', error);
    }
  };

  // Load diet plan when user logs in
  const loadDietPlan = async (token) => {
    try {
      const storedPlan = await AsyncStorage.getItem(`@dietPlan_${token}`);
      if (storedPlan) {
        setDietPlan(JSON.parse(storedPlan));
      }
    } catch (error) {
      console.error('Error loading diet plan:', error);
    }
  };
  
  // Connect to a health app with improved error handling
  const connectHealthApp = async (appName) => {
    try {
      console.log(`AuthContext: Connecting to ${appName}...`);
      
      // Special handling for Google Fit on Android
      if (appName === 'googleFit' && Platform.OS === 'android') {
        console.log('Connecting to Google Fit on Android');
        // Add any special Google Fit initialization here
      }
      
      // Handle potential callback errors
      let success = false;
      try {
        success = await healthTracker.connectToHealthApp(appName);
      } catch (connectionError) {
        console.error(`Error during direct connection to ${appName}:`, connectionError);
        // Try alternative connection method if available
        if (appName === 'googleFit' && Platform.OS === 'android') {
          try {
            console.log('Attempting alternative Google Fit connection...');
            // Insert alternative connection logic here if needed
            success = false; // Set appropriately based on alternative method
          } catch (altError) {
            console.error('Alternative connection also failed:', altError);
            success = false;
          }
        }
      }
      
      console.log(`AuthContext: Connection to ${appName} ${success ? 'successful' : 'failed'}`);
      
      if (success) {
        const appConnections = healthTracker.getConnectedApps();
        setConnectedHealthApps({...appConnections});
        
        // Fetch initial data after connecting
        try {
          const data = await healthTracker.getAllHealthData();
          setHealthData(data);
        } catch (dataError) {
          console.error('Error fetching initial health data:', dataError);
          // Continue even if data fetch fails
        }
      }
      return success;
    } catch (error) {
      console.error(`AuthContext: Error connecting to ${appName}:`, error);
      return false;
    }
  };
  
  // Disconnect from a health app
  const disconnectHealthApp = async (appName) => {
    try {
      const success = await healthTracker.disconnectFromHealthApp(appName);
      if (success) {
        const appConnections = healthTracker.getConnectedApps();
        setConnectedHealthApps({...appConnections});
      }
      return success;
    } catch (error) {
      console.error(`Error disconnecting from ${appName}:`, error);
      return false;
    }
  };
  
  // Refresh health data
  const refreshHealthData = async () => {
    try {
      const data = await healthTracker.getAllHealthData();
      setHealthData(data);
      return true;
    } catch (error) {
      console.error('Error refreshing health data:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userData,
        isGuestMode,
        bmiData,
        waterReminder,
        dietPlan,
        healthData,
        connectedHealthApps,
        signIn: async (token, user) => {
          setIsLoading(true);
          try {
            // Store BMI data if provided
            if (user.bmiData) {
              await AsyncStorage.setItem('bmiData', JSON.stringify(user.bmiData));
              setBmiData(user.bmiData);
              setWaterReminder(user.bmiData.waterReminder);
              await AsyncStorage.setItem('waterReminder', JSON.stringify(user.bmiData.waterReminder));
            }
            
            // Store user data
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));
            await AsyncStorage.setItem('isGuestMode', JSON.stringify(false));
            
            // Update state
            setUserToken(token);
            setUserData(user);
            setIsGuestMode(false);
            await loadDietPlan(token);
          } catch (e) {
            console.error("Error saving auth data:", e);
          } finally {
            setIsLoading(false);
          }
        },
        signInAsGuest: async (guestBmiData) => {
          setIsLoading(true);
          try {
            // Store BMI data for guest
            if (guestBmiData) {
              await AsyncStorage.setItem('bmiData', JSON.stringify(guestBmiData));
              setBmiData(guestBmiData);
              setWaterReminder(guestBmiData.waterReminder);
              await AsyncStorage.setItem('waterReminder', JSON.stringify(guestBmiData.waterReminder));
            }
            
            // Set guest mode
            await AsyncStorage.setItem('isGuestMode', JSON.stringify(true));
            setIsGuestMode(true);
            setUserToken(null);
            setUserData(null);
          } catch (e) {
            console.error("Error saving guest data:", e);
          } finally {
            setIsLoading(false);
          }
        },
        signOut: async () => {
          setIsLoading(true);
          try {
            // Clear all user data
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('isGuestMode');
            
            // Note: We don't clear BMI and water reminder preferences
            // so the user doesn't have to re-enter them if they log back in
            
            // Update state
            setUserToken(null);
            setUserData(null);
            setIsGuestMode(false);
          } catch (e) {
            console.error("Error signing out:", e);
          } finally {
            setIsLoading(false);
          }
        },
        updateBmiData: async (newBmiData) => {
          try {
            await AsyncStorage.setItem('bmiData', JSON.stringify(newBmiData));
            setBmiData(newBmiData);
          } catch (e) {
            console.error("Error updating BMI data:", e);
          }
        },
        toggleWaterReminder: async () => {
          try {
            const newValue = !waterReminder;
            await AsyncStorage.setItem('waterReminder', JSON.stringify(newValue));
            setWaterReminder(newValue);
          } catch (e) {
            console.error("Error toggling water reminder:", e);
          }
        },
        updateDietPlan,
        // Add new health tracking methods
        connectHealthApp,
        disconnectHealthApp,
        refreshHealthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
