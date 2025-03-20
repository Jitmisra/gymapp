import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Provider
import { AuthProvider, AuthContext } from './src/contexts/AuthContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state', 
  'Callback was not a function',
  '[react-native-gesture-handler]',
  // Add any other warnings you want to suppress
]);

// Auth Screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import SignInScreen from './src/screens/auth/SignInScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import BMICollectionScreen from './src/screens/auth/BMICollectionScreen';

// Main App Screens
import Dashboard from './src/screens/Dashboard';
import Booking from './src/screens/Booking';
import Community from './src/screens/Community';
import Challenges from './src/screens/Challenges';
import Profile from './src/screens/Profile';

// Workout Screens
import WorkoutDetailScreen from './src/screens/WorkoutDetailScreen';
import ActiveWorkoutScreen from './src/screens/ActiveWorkoutScreen';
import WorkoutCompleteScreen from './src/screens/WorkoutCompleteScreen';
import WorkoutHistoryScreen from './src/screens/WorkoutHistoryScreen';

// AI Chat Screen
import AIChatScreen from './src/screens/AIChatScreen';

// Friend Chat Screen
import FriendChat from './src/screens/FriendChat';

// Make sure the linear gradient package is imported
import { LinearGradient } from 'expo-linear-gradient';

// Import Diet Plan Screen
import DietPlanScreen from './src/screens/DietPlanScreen';

// Add import for validateIconSize
import validateIconSize from './src/utils/IconSizeValidator';

// Add import for ErrorHandler
import ErrorHandler from './src/utils/ErrorHandler';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();
const WorkoutStack = createNativeStackNavigator();

// Auth Stack Navigator
const AuthStackScreen = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="SignIn" component={SignInScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen name="BMICollection" component={BMICollectionScreen} />
  </AuthStack.Navigator>
);

// Workout Stack Navigator with error boundaries
const WorkoutStackScreen = ({ navigation }) => (
  <WorkoutStack.Navigator
    screenOptions={{
      headerShown: false
    }}
  >
    <WorkoutStack.Screen
      name="WorkoutDetail"
      component={WorkoutDetailScreen}
      options={{ 
        headerShown: false
      }}
    />
    <WorkoutStack.Screen 
      name="ActiveWorkout" 
      component={ActiveWorkoutScreen} 
      options={{ 
        headerShown: false, 
        gestureEnabled: false 
      }}
    />
    <WorkoutStack.Screen 
      name="WorkoutComplete" 
      component={WorkoutCompleteScreen} 
      options={{ 
        headerShown: false, 
        gestureEnabled: false,
        // Add a listener to handle navigation back to Dashboard
        listeners: ({ route }) => ({
          beforeRemove: (e) => {
            if (route.params?.shouldResetToRoot) {
              // Prevent default navigation action
              e.preventDefault();
              // Reset navigation stack to root
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainApp' }],
              });
            }
          },
        }),
      }}
    />
    <WorkoutStack.Screen 
      name="WorkoutHistory" 
      component={WorkoutHistoryScreen}
      options={({ navigation }) => ({ 
        headerShown: true,
        title: "Workout History",
        headerRight: () => (
          <TouchableOpacity 
            style={{ marginRight: 15 }}
            onPress={() => {
              Alert.alert(
                'Clear History',
                'Are you sure you want to clear your workout history? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await AsyncStorage.removeItem('workoutHistory');
                        // Trigger refresh by navigating to the same screen with a refresh param
                        navigation.setParams({ refresh: Date.now() });
                      } catch (error) {
                        console.error('Error clearing history:', error);
                        Alert.alert('Error', 'Failed to clear workout history');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="delete-outline" size={24} color="#FF4A6F" />
          </TouchableOpacity>
        )
      })}
    />
  </WorkoutStack.Navigator>
);

// Main tab navigator component
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Validate size to ensure it's a number
          const validSize = validateIconSize(size);
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
            return <MaterialCommunityIcons name={iconName} color={color} size={validSize} />;
          } else if (route.name === 'Booking') {
            iconName = focused ? 'calendar-clock' : 'calendar-clock-outline';
            return <MaterialCommunityIcons name={iconName} color={color} size={validSize} />;
          } else if (route.name === 'Community') {
            return <FontAwesome5 name="users" color={color} size={validSize} />;
          } else if (route.name === 'Challenges') {
            iconName = focused ? 'trophy' : 'trophy-outline';
            return <Ionicons name={iconName} color={color} size={validSize} />;
          } else if (route.name === 'Profile') {
            return <FontAwesome5 name="user-circle" color={color} size={validSize} />;
          }
        },
        tabBarActiveTintColor: '#4A6FFF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#4A6FFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        }
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Booking" 
        component={Booking}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="calendar-clock" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={Community}
        options={{
          tabBarIcon: ({color, size}) => (
            <FontAwesome5 name="users" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Challenges" 
        component={Challenges}
        options={{
          tabBarIcon: ({color, size}) => (
            <Ionicons name="trophy" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{
          tabBarIcon: ({color, size}) => (
            <FontAwesome5 name="user-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Root stack that can contain both auth flow and main app
const RootStack = createNativeStackNavigator();

// Navigation container with auth state
function AppNavigation() {
  const { isLoading, userToken, isGuestMode } = React.useContext(AuthContext);

  // Add global error boundary
  useEffect(() => {
    const handleError = (error, isFatal) => {
      console.log('Caught global error:', error);
      if (isFatal) {
        // Handle fatal errors - you could show a user-friendly error screen
        console.log('Fatal error occurred');
      }
    };

    // Set up the error handler for React Native
    if (ErrorUtils) {
      const originalGlobalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        handleError(error, isFatal);
        originalGlobalHandler(error, isFatal);
      });
    }

    return () => {
      // Restore original handler on unmount if needed
      if (ErrorUtils) {
        ErrorUtils.setGlobalHandler(ErrorUtils.getGlobalHandler());
      }
    };
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {userToken || isGuestMode ? (
          <>
            <RootStack.Screen name="MainApp" component={MainTabs} />
            <RootStack.Screen name="WorkoutScreens" component={WorkoutStackScreen} />
            <RootStack.Screen 
              name="AIChat" 
              component={AIChatScreen} 
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                animationDuration: 300,
              }}
            />
            <RootStack.Screen 
              name="DietPlan" 
              component={DietPlanScreen} 
              options={{
                animation: 'slide_from_right',
              }}
            />
            <RootStack.Screen 
              name="FriendChat" 
              component={FriendChat} 
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
              }}
            />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// Root component with AuthProvider and error handling
export default function App() {
  // Handle unhandled promise rejections
  useEffect(() => {
    const rejectionTracker = require('promise/setimmediate/rejection-tracking');
    
    rejectionTracker.enable({
      allRejections: true,
      onUnhandled: (id, error) => {
        console.log('Unhandled promise rejection:', error);
      },
      onHandled: () => {}
    });
    
    return () => {
      rejectionTracker.disable();
    };
  }, []);

  // Add global error handler setup
  useEffect(() => {
    const cleanup = ErrorHandler.setupGlobalErrorHandlers();
    return cleanup;
  }, []);
  
  return (
    <AuthProvider>
      <AppNavigation />
    </AuthProvider>
  );
}
