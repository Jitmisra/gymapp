import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  Vibration,
  Animated,
  Easing,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeSoundManager from '../utils/SafeSoundManager';
import { getExerciseImage } from '../utils/ExerciseImageHelper';

// Fallback workout data in case the passed workout is corrupted
const FALLBACK_WORKOUT = {
  id: 'fallback',
  title: 'Basic Workout',
  duration: '30 min',
  level: 'Beginner',
  exercises: [
    {
      id: 1,
      name: 'Push-ups',
      sets: 3,
      reps: '10',
      rest: 60,
      equipment: 'None',
      muscleTarget: 'Chest',
      image: 'https://images.pexels.com/photos/4162497/pexels-photo-4162497.jpeg'
    },
    {
      id: 2,
      name: 'Squats',
      sets: 3,
      reps: '15',
      rest: 60,
      equipment: 'None',
      muscleTarget: 'Legs',
      image: 'https://images.pexels.com/photos/4162497/pexels-photo-4162497.jpeg'
    }
  ]
};

// Simple countdown timer component
const SimpleCountdownTimer = ({ 
  duration, 
  isPlaying, 
  onComplete, 
  children 
}) => {
  const [remainingTime, setRemainingTime] = useState(duration);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            onComplete && onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, onComplete]);
  
  useEffect(() => {
    setRemainingTime(duration);
  }, [duration]);
  
  return children({ remainingTime });
};

const ActiveWorkoutScreen = ({ route, navigation }) => {
  // Get workout data with fallback
  const workout = route.params?.workout || FALLBACK_WORKOUT;
  
  // Validate the workout exercises array
  useEffect(() => {
    if (!workout.exercises || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
      console.error("Invalid workout data detected:", workout);
      Alert.alert(
        "Error",
        "Invalid workout data. Please try another workout.",
        [{ text: "Return to Dashboard", onPress: () => navigation.navigate('Dashboard') }]
      );
    }
  }, []);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetCount, setCurrentSetCount] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [completedAnimation] = useState(new Animated.Value(0));
  const [exerciseTransition] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(0));
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const isLastExercise = currentExerciseIndex === totalExercises - 1;
  const isLastSet = currentExercise && currentSetCount === currentExercise.sets;

  // Reset image states when exercise changes
  useEffect(() => {
    if (currentExercise) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [currentExerciseIndex]);

  // Updated sound function with error handling and vibration fallback
  const playSound = (soundType) => {
    try {
      switch(soundType) {
        case 'complete':
          SafeSoundManager.playCompletionSound();
          break;
        case 'rest':
          SafeSoundManager.playRestSound();
          break;
        default:
          SafeSoundManager.playCountSound();
      }
    } catch (error) {
      console.log("Error playing sound:", error);
      // Vibration fallback already handled in SafeSoundManager
    }
  };

  // Simplify image loading to fix display issues
  const getValidImageUrl = () => {
    if (!currentExercise) {
      return "https://images.pexels.com/photos/4162497/pexels-photo-4162497.jpeg";
    }
    
    // Always default to Pexels URLs which are more reliable
    const baseUrl = "https://images.pexels.com/photos/";
    
    // Mapping of exercise types to reliable image IDs
    const imageMapping = {
      "bench": "4162497/pexels-photo-4162497.jpeg",
      "press": "2261485/pexels-photo-2261485.jpeg", 
      "shoulder": "3837781/pexels-photo-3837781.jpeg",
      "chest": "4162497/pexels-photo-4162497.jpeg",
      "squat": "1954524/pexels-photo-1954524.jpeg",
      "row": "3838389/pexels-photo-3838389.jpeg",
      "curl": "4164761/pexels-photo-4164761.jpeg",
      "deadlift": "4608148/pexels-photo-4608148.jpeg",
      "default": "3768916/pexels-photo-3768916.jpeg"
    };
    
    // Find matching image or use default
    const exerciseName = currentExercise.name.toLowerCase();
    const matchingType = Object.keys(imageMapping).find(type => 
      exerciseName.includes(type)
    ) || "default";
    
    return baseUrl + imageMapping[matchingType];
  };

  const animateCompletion = () => {
    completedAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(completedAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(completedAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateExerciseTransition = () => {
    setImageLoading(true);
    setImageError(false);
    
    exerciseTransition.setValue(0);
    Animated.timing(exerciseTransition, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const animateBounce = () => {
    bounceAnim.setValue(0);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleNextStep = () => {
    if (isResting) {
      setIsResting(false);
      setTimerKey(prev => prev + 1);

      if (isLastSet) {
        const newCompleted = [...completedExercises];
        newCompleted[currentExerciseIndex] = true;
        setCompletedExercises(newCompleted);

        if (isLastExercise) {
          playSound('complete');
          
          // Create a safer sanitized workout object with primitive values only
          const sanitizedWorkout = {
            id: typeof workout.id !== 'undefined' ? String(workout.id) : 'unknown',
            title: typeof workout.title === 'string' ? workout.title : 'Workout',
            description: typeof workout.description === 'string' ? workout.description : '',
            duration: typeof workout.duration === 'string' ? workout.duration : '0 min',
            calories: typeof workout.calories === 'number' ? workout.calories : 
                     typeof workout.calories === 'string' ? parseInt(workout.calories) : 0,
            level: typeof workout.level === 'string' ? workout.level : 'Beginner',
            exercises: Array.isArray(workout.exercises) ? workout.exercises.length : 
                     typeof workout.exercises === 'number' ? workout.exercises : 0,
            image: typeof workout.image === 'string' && workout.image ? workout.image : 
                  "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg"
          };
          
          // Ensure the workout is logged with clear values before navigation
          console.log("Navigating to completion screen with data:", JSON.stringify(sanitizedWorkout));
          
          // Add a slight delay to ensure state updates are complete
          setTimeout(() => {
            navigation.navigate('WorkoutComplete', { 
              workout: sanitizedWorkout,
              shouldResetToRoot: true
            });
          }, 100);
        } else {
          playSound('complete');
          animateExerciseTransition();
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          setCurrentSetCount(1);
        }
      } else {
        playSound('count');
        setCurrentSetCount(currentSetCount + 1);
      }
    } else {
      setIsResting(true);
      setTimerKey(prev => prev + 1);
      animateCompletion();
      animateBounce();
      playSound('rest');
    }
  };

  const handlePreviousStep = () => {
    if (isResting) {
      setIsResting(false);
      setTimerKey(prev => prev + 1);
    } else {
      if (currentSetCount > 1) {
        setCurrentSetCount(currentSetCount - 1);
      } else if (currentExerciseIndex > 0) {
        setCurrentExerciseIndex(currentExerciseIndex - 1);
        setCurrentSetCount(workout.exercises[currentExerciseIndex - 1].sets);
      }
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    navigation.goBack();
  };

  // Track when component is mounted to prevent state updates after unmounting
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Enhanced image handlers with better debug
  const handleImageLoad = () => {
    console.log(`Image loaded successfully for ${currentExercise?.name}`);
    if (isMounted.current) {
      setImageLoading(false);
    }
  };

  const handleImageError = () => {
    console.log(`Failed to load image for ${currentExercise?.name}`);
    if (isMounted.current) {
      setImageLoading(false);
      setImageError(true);
    }
  };

  if (!currentExercise) {
    return <SafeAreaView style={styles.container} />;
  }

  const progress = (currentExerciseIndex * 100) / totalExercises;
  const formattedProgress = `${Math.round(progress)}%`;

  const exerciseOpacity = exerciseTransition.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  
  const exerciseTranslate = exerciseTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const bounceScale = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressBar, { width: formattedProgress }]} />
          </View>
          <Text style={styles.progressText}>
            {currentExerciseIndex + 1}/{totalExercises} Exercises
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {isResting ? (
          <View style={styles.restContainer}>
            <Text style={styles.restTitle}>Rest Time</Text>
            <Animated.View 
              style={[
                styles.timerContainer,
                { transform: [{ scale: bounceScale }] }
              ]}
            >
              <View style={styles.timerCircle}>
                <SimpleCountdownTimer
                  key={timerKey}
                  duration={currentExercise.rest}
                  isPlaying={!isPaused}
                  onComplete={() => {
                    playSound('count');
                    handleNextStep();
                  }}
                >
                  {({ remainingTime }) => (
                    <Text style={styles.timerText}>{remainingTime}</Text>
                  )}
                </SimpleCountdownTimer>
                <View style={styles.timerBackground}></View>
              </View>
            </Animated.View>
            <Text style={styles.nextExerciseText}>
              {isLastSet && !isLastExercise
                ? `Next: ${workout.exercises[currentExerciseIndex + 1].name}`
                : ''}
            </Text>
          </View>
        ) : (
          <Animated.View 
            style={[
              styles.exerciseContainer,
              { 
                // Simplify animation to just fade in
                opacity: 1 // Always make the container visible
              }
            ]}
          >
            <View style={styles.imageContainer}>
              {imageLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4A6FFF" />
                  <Text style={styles.loadingText}>Loading exercise...</Text>
                </View>
              )}
              
              {imageError && (
                <View style={styles.errorImageContainer}>
                  <Ionicons name="barbell-outline" size={60} color="#aaa" />
                  <Text style={styles.errorImageText}>{currentExercise.name}</Text>
                </View>
              )}
              
              {/* Simplified image component */}
              <Image 
                source={{ uri: getValidImageUrl() }} 
                style={[
                  styles.exerciseImage, 
                  imageLoading ? { opacity: 0.2 } : { opacity: 1 },
                  imageError ? { opacity: 0 } : null
                ]}
                onLoad={handleImageLoad}
                onError={handleImageError}
                // Force image reload with different key
                key={getValidImageUrl()}
              />
            </View>
            
            <View style={styles.exerciseDetails}>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.exerciseTarget}>Target: {currentExercise.muscleTarget}</Text>
              
              {/* Visual instructions */}
              <View style={styles.instructionContainer}>
                <Ionicons name="information-circle-outline" size={18} color="#4A6FFF" />
                <Text style={styles.instructionText}>
                  Do {currentExercise.sets} sets of {currentExercise.reps} reps
                </Text>
              </View>
              
              <Animated.View 
                style={[
                  styles.setsContainer,
                  {
                    backgroundColor: completedAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: ['#f5f5f5', '#4A6FFF40', '#f5f5f5']
                    })
                  }
                ]}
              >
                <Text style={styles.setCountText}>
                  Set {currentSetCount} of {currentExercise.sets}
                </Text>
                <Text style={styles.repCountText}>{currentExercise.reps}</Text>
              </Animated.View>
              
              <Text style={styles.equipmentText}>{currentExercise.equipment}</Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.previousButton]}
            onPress={handlePreviousStep}
            disabled={currentExerciseIndex === 0 && currentSetCount === 1 && !isResting}
          >
            <Ionicons name="arrow-back" size={24} color="#4A6FFF" />
            <Text style={styles.controlText}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePause}
          >
            <Ionicons name={isPaused ? "play" : "pause"} size={24} color="#333" />
            <Text style={styles.controlText}>{isPaused ? "Resume" : "Pause"}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.nextButton]}
            onPress={handleNextStep}
          >
            <Text style={[styles.controlText, { color: '#fff' }]}>
              {isResting 
                ? "Skip Rest" 
                : isLastSet 
                  ? isLastExercise 
                    ? "Finish" 
                    : "Next Exercise" 
                  : "Complete Set"}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showExitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>End Workout?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to end your workout? Your progress will not be saved.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowExitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Continue Workout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmExit}
              >
                <Text style={styles.confirmButtonText}>End Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exitButton: {
    padding: 5,
    marginRight: 15,
  },
  progressContainer: {
    flex: 1,
  },
  progressBarWrapper: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A6FFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  exerciseContainer: {
    padding: 20,
    alignItems: 'center',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#f5f5f5', // Add background color for transparency
  },
  exerciseDetails: {
    alignItems: 'center',
    width: '100%',
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  exerciseTarget: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4A6FFF',
  },
  instructionText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  setCountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 20,
  },
  repCountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6FFF',
  },
  equipmentText: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
  },
  restContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 15,
    borderColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  timerBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 15,
    borderColor: '#eee',
    zIndex: -1,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4A6FFF',
  },
  nextExerciseText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  previousButton: {
    backgroundColor: '#f0f0f0',
  },
  pauseButton: {
    backgroundColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#4A6FFF',
    shadowColor: '#4A6FFF',
    shadowOpacity: 0.3,
  },
  controlText: {
    marginHorizontal: 5,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#FF4A6F',
  },
  cancelButtonText: {
    fontWeight: '600',
    color: '#333',
  },
  confirmButtonText: {
    fontWeight: '600',
    color: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#f5f5f5', // Add background color for transparency
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorImageText: {
    marginTop: 10,
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    padding: 10,
  },
});

export default ActiveWorkoutScreen;