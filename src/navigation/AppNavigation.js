import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import BMICollectionScreen from '../screens/BMICollectionScreen';

// Main Screens
import Dashboard from '../screens/Dashboard';
import Workouts from '../screens/Workouts';
import Profile from '../screens/Profile';
import Booking from '../screens/Booking';
import Community from '../screens/Community';

// Workout Flow Screens
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import WorkoutCompleteScreen from '../screens/WorkoutCompleteScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import WorkoutHistoryDetailScreen from '../screens/WorkoutHistoryDetailScreen';

// AI Assistant
import GymBot from '../components/GymBot';

// Theme
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
  },
};

// Authentication Stack
const AuthStack = createNativeStackNavigator();
function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="BMICollection" component={BMICollectionScreen} />
    </AuthStack.Navigator>
  );
}

// Workout Stack
const WorkoutStack = createNativeStackNavigator();
function WorkoutStackScreen() {
  return (
    <WorkoutStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <WorkoutStack.Screen name="WorkoutsList" component={Workouts} />
      <WorkoutStack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <WorkoutStack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
      <WorkoutStack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
      <WorkoutStack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} />
      <WorkoutStack.Screen name="WorkoutHistoryDetail" component={WorkoutHistoryDetailScreen} />
    </WorkoutStack.Navigator>
  );
}

// Bot Stack
const BotStack = createNativeStackNavigator();
function BotStackScreen() {
  return (
    <BotStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <BotStack.Screen name="AIChat" component={GymBot} />
    </BotStack.Navigator>
  );
}

// Main Tab Navigator
const Tab = createBottomTabNavigator();
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'WorkoutScreens') {
            iconName = focused ? 'dumbbell' : 'dumbbell';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Booking') {
            iconName = focused ? 'calendar' : 'calendar-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: '#4A6FFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="WorkoutScreens" component={WorkoutStackScreen} options={{ title: 'Workouts' }} />
      <Tab.Screen name="Booking" component={Booking} />
      <Tab.Screen name="Community" component={Community} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// Main Application Stack
const RootStack = createNativeStackNavigator();
function AppNavigation() {
  return (
    <NavigationContainer theme={MyTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth" component={AuthStackScreen} />
        <RootStack.Screen name="MainApp" component={MainTabNavigator} />
        <RootStack.Screen name="BotChat" component={BotStackScreen} />
        <RootStack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigation;