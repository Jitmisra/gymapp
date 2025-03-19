import React, { useContext } from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  // Replace skipAuth with signInAsGuest
  const { signInAsGuest } = useContext(AuthContext);

  const handleSkip = () => {
    // Redirect to BMI collection with guest flag
    navigation.navigate('BMICollection', {
      token: null,
      userData: null,
      isGuest: true
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          {/* Move skip button to top for visibility */}
          <View style={styles.skipContainer}>
            <TouchableOpacity 
              onPress={handleSkip}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>Skip Sign In</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: 'https://i.imgur.com/vzV0NOX.png' }} // A placeholder logo image
                style={styles.logo}
              />
              <Text style={styles.appName}>FITTLER</Text>
              <Text style={styles.tagline}>Your Campus Fitness Companion</Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.signInButton]}
                onPress={() => navigation.navigate('SignIn')}
              >
                <Text style={styles.signInText}>SIGN IN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.signUpButton]}
                onPress={() => navigation.navigate('SignUp')}
              >
                <Text style={styles.signUpText}>SIGN UP</Text>
              </TouchableOpacity>
              
              {/* Add an additional skip button for better visibility */}
              <TouchableOpacity
                style={[styles.button, styles.skipSignInButton]}
                onPress={handleSkip}
              >
                <Text style={styles.skipSignInText}>CONTINUE AS GUEST</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  signInButton: {
    backgroundColor: '#4A6FFF',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signUpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  },
  // Add new style for the skip sign in button
  skipSignInButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: 10,
  },
  skipSignInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WelcomeScreen;
