import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Dashboard from '../screens/Dashboard';
import AIChatScreen from '../screens/AIChatScreen';
import GymBot from '../components/GymBot';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'ios-home' : 'ios-home-outline';
          } else if (route.name === 'AIChat') {
            iconName = focused ? 'ios-chatbubbles' : 'ios-chatbubbles-outline';
          } else if (route.name === 'GymBot') {
            iconName = focused ? 'ios-fitness' : 'ios-fitness-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A6FFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: '30%', // Updated: increased from 15% to 30%
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10, // Extra padding for iOS devices with home indicator
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarItemStyle: {
          height: '100%',
          paddingVertical: 5,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="AIChat" component={AIChatScreen} />
      <Tab.Screen name="GymBot" component={GymBot} />
    </Tab.Navigator>
  );
}