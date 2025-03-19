import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';

const BMICollectionScreen = ({ route, navigation }) => {
  const { token, userData, isGuest } = route.params;
  
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waterReminder, setWaterReminder] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Access auth context
  const { signIn, signInAsGuest } = useContext(AuthContext);

  const handleContinue = () => {
    if (!age || !weight || !height) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    // Calculate BMI
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);
    const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
    
    const bmiData = {
      age: parseInt(age),
      weight: weightInKg,
      height: parseFloat(height),
      bmi: parseFloat(bmiValue),
      waterReminder: waterReminder
    };
    
    setTimeout(() => {
      setIsLoading(false);
      
      if (isGuest) {
        signInAsGuest(bmiData);
      } else {
        signIn(token, {...userData, bmiData});
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>Just a few details</Text>
              <Text style={styles.subHeaderText}>
                To personalize your experience and calculate your BMI
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  placeholderTextColor="#999"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Weight (kg)"
                  placeholderTextColor="#999"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Height (cm)"
                  placeholderTextColor="#999"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                />
              </View>
              
              <View style={styles.reminderContainer}>
                <Text style={styles.reminderText}>Enable water reminders?</Text>
                <TouchableOpacity
                  style={styles.toggleButton}
                  onPress={() => setWaterReminder(!waterReminder)}
                >
                  <View style={[
                    styles.toggleTrack,
                    waterReminder && styles.toggleTrackActive
                  ]}>
                    <View style={[
                      styles.toggleThumb,
                      waterReminder && styles.toggleThumbActive
                    ]} />
                  </View>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.continueButton, isLoading && styles.disabledButton]}
                onPress={handleContinue}
                disabled={isLoading}
              >
                <Text style={styles.continueButtonText}>
                  {isLoading ? "Processing..." : "Continue"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    marginVertical: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
    marginTop: 20,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  reminderText: {
    fontSize: 16,
    color: '#333',
  },
  toggleButton: {
    padding: 5,
  },
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    padding: 3,
  },
  toggleTrackActive: {
    backgroundColor: '#4A6FFF',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  continueButton: {
    backgroundColor: '#4A6FFF',
    borderRadius: 8,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BMICollectionScreen;
