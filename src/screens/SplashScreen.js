import React from 'react';
import { StyleSheet, View, Text, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image 
        source={{ uri: 'https://i.imgur.com/vzV0NOX.png' }} // Replace with your logo
        style={styles.logo}
      />
      <Text style={styles.appName}>FITTLER</Text>
      <Text style={styles.tagline}>Your Campus Fitness Companion</Text>
      
      <ActivityIndicator 
        size="large" 
        color="#4A6FFF"
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
