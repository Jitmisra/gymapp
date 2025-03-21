import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const moveAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      // Move up animation
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#4A6FFF', '#8A63FF']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: moveAnim }
            ],
          },
        ]}
      >
        <Image 
          source={{ uri: 'https://i.imgur.com/vzV0NOX.png' }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>
          FITTLER
        </Animated.Text>
        
        <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
          Your Campus Fitness Companion
        </Animated.Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <Animated.View 
          style={[
            styles.loaderContainer,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDotMiddle]} />
          <View style={styles.loadingDot} />
        </Animated.View>
        
        <Animated.Text 
          style={[
            styles.loadingText,
            { opacity: fadeAnim }
          ]}
        >
          Loading...
        </Animated.Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 3,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loaderContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    opacity: 0.7,
    // Animation properties
    animationName: 'bounce',
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
  loadingDotMiddle: {
    animationDelay: '0.2s',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SplashScreen;
