import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const FloatingAIButton = ({ navigation, aiButtonScale, aiButtonRotation, animateAiButton }) => {
  // Start a subtle animation on component mount
  useEffect(() => {
    const intervalId = setInterval(() => {
      Animated.sequence([
        Animated.timing(aiButtonScale, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(aiButtonScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, []);

  const spin = aiButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg']
  });

  return (
    <Animated.View
      style={[
        styles.floatingAiButton,
        {
          transform: [
            { scale: aiButtonScale },
            { rotate: spin }
          ],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.floatingAiButtonTouchable}
        activeOpacity={0.8}
        onPress={() => {
          animateAiButton();
          navigation.navigate('AIChat');
        }}
      >
        <LinearGradient
          colors={['#4A6FFF', '#6B66FF']}
          style={styles.floatingAiButtonInner}
        >
          <MaterialCommunityIcons name="robot" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingAiButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 33,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
  floatingAiButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingAiButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

export default FloatingAIButton;
