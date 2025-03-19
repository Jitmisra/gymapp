import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const WorkoutDetailScreen = ({ route, navigation }) => {
  // Add error handling for missing workout data
  const workout = route.params?.workout;
  const [currentExercise, setCurrentExercise] = useState(null); // Fixed typo here
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  // If no workout data is passed, return an error state
  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>Workout data not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleStartWorkout = () => {
    navigation.navigate('ActiveWorkout', { workout });
  };

  const handleExercisePress = (exercise) => {
    console.log("Exercise selected:", exercise.name); // Add debug logging
    setCurrentExercise(exercise);
    setShowExerciseModal(true);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <ImageBackground 
          source={{ uri: workout.image }} 
          style={styles.coverImage}
        >
          <View style={styles.coverOverlay} />
          <View style={styles.coverContent}>
            <View style={styles.workoutLevelBadge}>
              <Text style={styles.workoutLevelText}>{workout.level}</Text>
            </View>
            <Text style={styles.coverTitle}>{workout.title}</Text>
            <Text style={styles.coverDescription}>{workout.description}</Text>
          </View>
        </ImageBackground>
        
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={22} color="#4A6FFF" />
            <Text style={styles.statValue}>{workout.duration}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="lightning-bolt" size={22} color="#4A6FFF" />
            <Text style={styles.statValue}>{workout.calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="dumbbell" size={22} color="#4A6FFF" />
            <Text style={styles.statValue}>{workout.exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>

        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Workout Plan</Text>
          
          {workout.exercises.map((exercise, index) => (
            <TouchableOpacity 
              key={exercise.id}
              style={styles.exerciseItem}
              onPress={() => handleExercisePress(exercise)}
            >
              <View style={styles.exerciseIndex}>
                <Text style={styles.exerciseIndexText}>{index + 1}</Text>
              </View>
              
              <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
              
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} sets × {exercise.reps} reps
                </Text>
                <Text style={styles.exerciseEquipment}>{exercise.equipment}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="water" size={20} color="#4A6FFF" style={styles.tipIcon} />
            <Text style={styles.tipText}>Drink water regularly throughout your workout</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="body" size={20} color="#4A6FFF" style={styles.tipIcon} />
            <Text style={styles.tipText}>Focus on proper form rather than lifting heavy weights</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="timer" size={20} color="#4A6FFF" style={styles.tipIcon} />
            <Text style={styles.tipText}>Rest between 30-90 seconds between sets for optimal results</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartWorkout}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise Detail Modal */}
      <Modal
        visible={showExerciseModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        {currentExercise ? (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowExerciseModal(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              <Image 
                source={{ uri: currentExercise.image }} 
                style={styles.modalImage}
                onError={() => console.log("Failed to load exercise image")}
              />
              
              <View style={styles.modalOverlay}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{currentExercise.name}</Text>
                  <Text style={styles.modalTarget}>Target: {currentExercise.muscleTarget}</Text>
                </View>
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>{currentExercise.sets}</Text>
                    <Text style={styles.modalStatLabel}>Sets</Text>
                  </View>
                  
                  <View style={styles.modalStatDivider} />
                  
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>{currentExercise.reps}</Text>
                    <Text style={styles.modalStatLabel}>Reps</Text>
                  </View>
                  
                  <View style={styles.modalStatDivider} />
                  
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>{currentExercise.rest}s</Text>
                    <Text style={styles.modalStatLabel}>Rest</Text>
                  </View>
                </View>
                
                <View style={styles.modalInfoSection}>
                  <Text style={styles.modalInfoTitle}>Equipment</Text>
                  <Text style={styles.modalInfoText}>{currentExercise.equipment}</Text>
                  
                  <Text style={styles.modalInfoTitle}>Instructions</Text>
                  <Text style={styles.modalInfoText}>
                    Perform {currentExercise.sets} sets of {currentExercise.reps} repetitions with {currentExercise.rest} seconds rest between sets.
                    Focus on proper form and controlled movement throughout the exercise.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowExerciseModal(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.modalOverlay}>
                <Text style={styles.modalTitle}>Exercise not found</Text>
                <TouchableOpacity
                  style={styles.returnButton}
                  onPress={() => setShowExerciseModal(false)}
                >
                  <Text style={styles.returnButtonText}>Return to workout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  shareButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  coverImage: {
    width: '100%',
    height: 220,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  coverContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  workoutLevelBadge: {
    backgroundColor: '#4A6FFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  workoutLevelText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  coverDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    padding: 20,
    elevation: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#eee',
    alignSelf: 'center',
  },
  exercisesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9', // Explicit background color
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A6FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  exerciseIndexText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 15,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#777',
  },
  tipsContainer: {
    padding: 20,
    marginBottom: 80,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  startButton: {
    backgroundColor: '#4A6FFF', // Explicit background color
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff', // Explicit background color
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
  },
  modalImage: {
    width: '100%',
    height: '50%',
  },
  modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalTarget: {
    fontSize: 16,
    color: '#666',
  },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#ddd',
    alignSelf: 'center',
  },
  modalInfoSection: {
    marginBottom: 20,
  },
  modalInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 15,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  returnButton: {
    backgroundColor: '#4A6FFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  returnButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WorkoutDetailScreen;
