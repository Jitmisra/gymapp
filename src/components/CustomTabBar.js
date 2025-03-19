import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
const tabBarHeight = height * 0.3; // Updated: increased from 0.15 to 0.3

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Get the icon name based on the route
        const getIconName = () => {
          switch (route.name) {
            case 'Home':
              return isFocused ? 'home' : 'home-outline';
            case 'Workouts':
              return isFocused ? 'barbell' : 'barbell-outline';
            case 'Profile':
              return isFocused ? 'person' : 'person-outline';
            case 'AIChat':
              return isFocused ? 'chatbubble' : 'chatbubble-outline';
            default:
              return isFocused ? 'apps' : 'apps-outline';
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Ionicons 
              name={getIconName()} 
              size={28} // Increased icon size
              color={isFocused ? '#4A6FFF' : '#8E8E93'} 
            />
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? '#4A6FFF' : '#8E8E93' }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: tabBarHeight,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10, // Extra padding for iOS to account for home indicator
    paddingTop: 15, // Increased top padding
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14, // Increased font size
    fontWeight: '500',
    marginTop: 8, // More space between icon and label
  },
});

export default CustomTabBar;
