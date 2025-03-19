import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  Share,
  Dimensions,
  Easing
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeSoundManager from '../utils/SafeSoundManager';

// Define default workout data for fallback
const defaultWorkout = {
  title: 'Workout',
  description: 'Completed workout',
  duration: '0 min',
  calories: 0,
  exercises: 0,
  image: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg'
};

const WorkoutCompleteScreen = ({ route, navigation }) => {
  // Add shouldResetToRoot parameter
  const shouldResetToRoot = route.params?.shouldResetToRoot || false;
  
  // Safely extract workout data from params with type checking
  const params = route.params || {};
  const rawWorkout = params.workout || {};
  
  // Debug the incoming data
  console.log("Raw workout data received:", JSON.stringify(rawWorkout));
  
  // Create a sanitized workout object with correct types and extra safety checks
  const workout = {
    title: typeof rawWorkout.title === 'string' ? rawWorkout.title : defaultWorkout.title,
    description: typeof rawWorkout.description === 'string' ? rawWorkout.description : defaultWorkout.description,
    duration: typeof rawWorkout.duration === 'string' ? rawWorkout.duration : defaultWorkout.duration,
    calories: typeof rawWorkout.calories === 'number' ? rawWorkout.calories : 
             typeof rawWorkout.calories === 'string' ? parseInt(rawWorkout.calories) : defaultWorkout.calories,
    exercises: typeof rawWorkout.exercises === 'number' ? rawWorkout.exercises :
              Array.isArray(rawWorkout.exercises) ? rawWorkout.exercises.length : defaultWorkout.exercises,
    image: typeof rawWorkout.image === 'string' && rawWorkout.image ? rawWorkout.image : defaultWorkout.image
  };
  
  const [scale] = useState(new Animated.Value(0.7));
  const [opacity] = useState(new Animated.Value(0));
  
  // Create animated values for celebration effects
  const [starOpacity] = useState(new Animated.Value(0));
  const [starScale] = useState(new Animated.Value(0.5));
  const [rotateAnim] = useState(new Animated.Value(0));
  
  // Create a ref array to store individual star animation values
  const starAnimations = useRef(
    Array.from({ length: 10 }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
      rotation: new Animated.Value(0)
    }))
  ).current;
  
  // Replace playCompletionSound with safer version that handles errors
  const playCompletionSound = () => {
    try {
      SafeSoundManager.playCompletionSound();
    } catch (error) {
      console.log("Error playing completion sound:", error);
      // Vibration fallback already handled in SafeSoundManager
    }
  };

  useEffect(() => {
    // Play completion sound
    playCompletionSound();
    
    // Animate the completion badge
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.linear
        })
      )
    ]).start();
    
    // Animate each star individually with proper delays
    starAnimations.forEach((anim, index) => {
      const delay = index * 120;
      
      // Start animation sequence for each star
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.spring(anim.scale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true
          }),
          Animated.loop(
            Animated.timing(anim.rotation, {
              toValue: 1,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true
            })
          )
        ]),
        Animated.delay(1500),
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ]).start();
    });
    
    // Save workout to history
    saveWorkoutToHistory();
  }, []);
  
  const saveWorkoutToHistory = async () => {
    try {
      // Get existing history
      const historyString = await AsyncStorage.getItem('workoutHistory');
      let history = historyString ? JSON.parse(historyString) : [];
      
      // Add this workout to history with proper type handling
      const workoutRecord = {
        id: Date.now().toString(),
        name: String(workout.title),
        description: String(workout.description),
        timestamp: new Date().toISOString(),
        duration: String(workout.duration),
        calories: Number(workout.calories),
        exercises: Number(workout.exercises),
        image: String(workout.image)
      };
      
      history.unshift(workoutRecord);
      
      // Save back to storage
      await AsyncStorage.setItem('workoutHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving workout to history:', error);
    }
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just completed the ${workout.title} workout using the Campus Fitness app! 💪`,
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  };

  // Function to properly navigate back to Dashboard tab
  const handleReturnToDashboard = () => {
    // Reset navigation stack to get back to tabs
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  // Fixed star animations that avoid the dynamic type error
  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 10; i++) {
      const size = 18 + Math.random() * 16;
      const top = Math.random() * 300;
      const left = Math.random() * (Dimensions.get('window').width - 40);
      
      // Use pre-created animation values from the ref
      const starAnim = starAnimations[i];
      
      stars.push(
        <Animated.View 
          key={i}
          style={{
            position: 'absolute',
            top,
            left,
            opacity: starAnim.opacity, // Use the pre-created value
            transform: [
              { scale: starAnim.scale }, // Use the pre-created value
              { 
                rotate: starAnim.rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }
            ]
          }}
        >
          <Ionicons 
            name="star" 
            size={size} 
            color={i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FFA500" : "#4A6FFF"} 
          />
        </Animated.View>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Replace Confetti with our enhanced star animation */}
      {renderStars()}
      
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View 
          style={[
            styles.completionBadge,
            { transform: [{ scale }], opacity }
          ]}
        >
          <View style={styles.badgeInner}>
            <Ionicons name="checkmark-circle" size={80} color="#4A6FFF" />
            <Text style={styles.congratsText}>Workout Complete!</Text>
          </View>
        </Animated.View>
        
        <View style={styles.workoutCard}>
          <Image 
            source={{ uri: workout.image }} 
            style={styles.workoutImage}
            onError={() => {
              console.log("Workout image failed to load, using default");
              // We'll handle the error with styling rather than defaultSource
            }}
          />
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>{workout.title}</Text>
            <Text style={styles.workoutDesc}>{workout.description}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={30} color="#4A6FFF" />
            <Text style={styles.statValue}>{workout.duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="fire" size={30} color="#FF5252" />
            <Text style={styles.statValue}>{workout.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="dumbbell" size={30} color="#66BB6A" />
            <Text style={styles.statValue}>{workout.exercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>
        
        <View style={styles.messageContainer}>
          <Text style={styles.messageTitle}>Great job!</Text>
          <Text style={styles.messageText}>
            You've completed your workout for today. Keep up the consistency to reach your fitness goals faster!
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.shareButton]} 
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={20} color="#4A6FFF" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
          
          {/* Add option to view history */}
          <TouchableOpacity 
            style={[styles.button, styles.historyButton]}
            onPress={() => navigation.navigate('WorkoutHistory')}
          >
            <Ionicons name="time-outline" size={20} color="#fff" />
            <Text style={styles.historyButtonText}>View History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.doneButton]}
            onPress={handleReturnToDashboard}
          >
            <Text style={styles.doneButtonText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  completionBadge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E8F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  badgeInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6FFF',
    marginTop: 10,
  },
  workoutCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  workoutImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0', // Add background color for failed images
  },
  workoutInfo: {
    padding: 15,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  workoutDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  messageContainer: {
    width: '100%',
    backgroundColor: '#E8F0FF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 30,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6FFF',
    marginBottom: 10,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4A6FFF',
  },
  shareButtonText: {
    color: '#4A6FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  historyButton: {
    flexDirection: 'row',
    backgroundColor: '#66BB6A',
    marginBottom: 10,
  },
  historyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  doneButton: {
    backgroundColor: '#4A6FFF',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WorkoutCompleteScreen;
