import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// Import the AIChatScreen
import AIChatScreen from '../screens/AIChatScreen';

// ...existing code...

// Update the stack navigator to include the AIChatScreen
const MainStack = createStackNavigator();
const MainStackNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {/* ...existing screens... */}
      <MainStack.Screen name="AIChat" component={AIChatScreen} />
    </MainStack.Navigator>
  );
};

// ...existing code...