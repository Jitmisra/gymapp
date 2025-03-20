import React, { useContext, useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  Modal,
  FlatList,
  ImageBackground,
  Alert,
  Animated,
  Easing,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import WaterReminderCard from '../components/WaterReminderCard';
import WorkoutPlanCard from '../components/WorkoutPlanCard';
import { LinearGradient } from 'expo-linear-gradient';

const ActivityTile = ({ title, value, unit, icon, color }) => {
  return (
    <TouchableOpacity style={{ backgroundColor: color, padding: 16, borderRadius: 8 }}>
      <View style={{ alignItems: 'center' }}>
        <MaterialCommunityIcons name={icon} size={28} color="#fff" />
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{title}</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>{value}</Text>
        <Text style={{ fontSize: 14, color: '#fff' }}>{unit}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Dashboard = ({ navigation }) => {
  const { userData, bmiData, healthData, refreshHealthData, connectedHealthApps } = useContext(AuthContext);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [aiButtonScale] = useState(new Animated.Value(1));
  const [aiButtonRotation] = useState(new Animated.Value(0));
  const [isSyncingHealth, setIsSyncingHealth] = useState(false);

  const handleSelectWorkout = (workout) => {
    // Make sure we have a valid workout object with all required fields
    if (workout) {
      // Create a deep copy with validated exercise data
      const validatedWorkout = {
        ...workout,
        image: workout.image || 'https://images.pexels.com/photos/4162497/pexels-photo-4162497.jpeg',
        exercises: workout.exercises.map(exercise => ({
          ...exercise,
          // Make sure each exercise has a valid image URL
          image: exercise.image && exercise.image.startsWith('http') 
            ? exercise.image 
            : 'https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg'
        }))
      };
      
      // Log the workout being passed to help with debugging
      console.log("Navigating to workout:", validatedWorkout.title);
      console.log("First exercise image:", validatedWorkout.exercises[0].image);
      
      navigation.navigate('WorkoutScreens', { 
        screen: 'WorkoutDetail',
        params: { workout: validatedWorkout }
      });
    } else {
      Alert.alert('Error', 'Could not load workout details');
    }
  };

  // Animation for the AI button
  const pulseAnimation = () => {
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
  };

  const rotateAnimation = () => {
    Animated.timing(aiButtonRotation, {
      toValue: 1,
      duration: 400,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start(() => {
      aiButtonRotation.setValue(0);
    });
  };

  // Combined animation effect for AI button
  const animateAiButton = () => {
    pulseAnimation();
    rotateAnimation();
  };

  // Start a subtle animation on component mount
  useEffect(() => {
    const intervalId = setInterval(pulseAnimation, 10000);
    return () => clearInterval(intervalId); // Correctly clear the interval
  }, []);

  const spin = aiButtonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '20deg']
  });

  // Function to check if any health app is connected
  const isAnyHealthAppConnected = () => {
    return connectedHealthApps.googleFit || 
           connectedHealthApps.appleHealth || 
           connectedHealthApps.samsungHealth;
  };

  // Handle health data sync
  const handleSyncHealthData = async () => {
    if (!isAnyHealthAppConnected()) {
      navigation.navigate('Profile', { initialTab: 'Activity' });
      return;
    }
    
    setIsSyncingHealth(true);
    try {
      await refreshHealthData();
    } catch (error) {
      console.error("Error syncing health data:", error);
      Alert.alert(
        "Sync Failed",
        "Unable to update health data. Please try again."
      );
    } finally {
      setIsSyncingHealth(false);
    }
  };

  // Format last sync time
  const formatLastSync = () => {
    if (!healthData.lastSync) return null;
    
    const now = new Date();
    const syncTime = new Date(healthData.lastSync);
    
    if (syncTime.toDateString() === now.toDateString()) {
      return `Last updated: Today, ${syncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return `Last updated: ${syncTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* User Profile Header */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 10, alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            Hello, {userData ? userData.name.split(' ')[0] : 'there'}!
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image
            source={{ uri: userData?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.profileAvatar}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Health Summary Card - Updated with real data */}
        <View style={styles.summaryContainer}>
          <View style={{ marginHorizontal: 16, padding: 16, backgroundColor: '#f7f7f7', borderRadius: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Today's Progress</Text>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 8, borderRadius: 5 }}
                onPress={handleSyncHealthData}
                disabled={isSyncingHealth}
              >
                {isSyncingHealth ? (
                  <ActivityIndicator size="small" color="#4A6FFF" />
                ) : (
                  <View style={styles.syncButtonContent}>
                    <Ionicons name="sync" size={16} color="#4A6FFF" />
                    <Text style={styles.syncButtonText}>Sync</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            {isAnyHealthAppConnected() ? (
              <>
                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <View style={[styles.metricIconBg, {backgroundColor: '#4A6FFF20'}]}>
                      <FontAwesome5 name="shoe-prints" size={18} color="#4A6FFF" />
                    </View>
                    <Text style={styles.metricValue}>{healthData.steps || 0}</Text>
                    <Text style={styles.metricLabel}>Steps</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <View style={[styles.metricIconBg, {backgroundColor: '#FF6B6B20'}]}>
                      <FontAwesome5 name="fire" size={18} color="#FF6B6B" />
                    </View>
                    <Text style={styles.metricValue}>{Math.round(healthData.calories) || 0}</Text>
                    <Text style={styles.metricLabel}>Calories</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <View style={[styles.metricIconBg, {backgroundColor: '#6BBF5920'}]}>
                      <MaterialCommunityIcons name="map-marker-path" size={18} color="#6BBF59" />
                    </View>
                    <Text style={styles.metricValue}>{((healthData.distance || 0) / 1609).toFixed(1)}</Text>
                    <Text style={styles.metricLabel}>Miles</Text>
                  </View>
                </View>
                {healthData.lastSync && (
                  <Text style={styles.lastSyncText}>{formatLastSync()}</Text>
                )}
              </>
            ) : (
              <TouchableOpacity 
                style={styles.connectHealthContainer}
                onPress={() => navigation.navigate('Profile', { initialTab: 'Activity' })}
              >
                <Ionicons name="fitness" size={28} color="#aaa" />
                <Text style={styles.connectHealthText}>
                  Connect a health app to track your daily activity
                </Text>
                <View style={styles.connectHealthButton}>
                  <Text style={styles.connectHealthButtonText}>Connect</Text>
                  <Ionicons name="arrow-forward" size={16} color="#4A6FFF" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Daily Workout Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Workout</Text>
            <TouchableOpacity onPress={() => navigation.navigate('WorkoutScreens', { screen: 'WorkoutHistory' })}>
              <Text style={styles.sectionLink}>History</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {/* Keep your existing WorkoutPlanCards here */}
            <WorkoutPlanCard
              title="Upper Body Focus"
              duration="45 min"
              level="Intermediate"
              exercises={5}
              image="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e"
              color="#4A6FFF"
              onPress={() => handleSelectWorkout(workoutPlans[0])}
            />
            <WorkoutPlanCard
              title="Leg Day"
              duration="40 min"
              level="Advanced"
              exercises={6}
              image="https://images.unsplash.com/photo-1434608519344-49d77a699e1d"
              color="#FF6B6B"
              onPress={() => handleSelectWorkout(workoutPlans[1])}
            />
            <WorkoutPlanCard
              title="Full Body Toning"
              duration="50 min"
              level="Beginner"
              exercises={8}
              image="https://images.unsplash.com/photo-1549060279-7e168fcee0c2"
              color="#6BBF59"
              onPress={() => handleSelectWorkout(workoutPlans[2])}
            />
          </ScrollView>
        </View>
        
        {/* AI Recommendation Card - FIXED */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Recommended</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            <TouchableOpacity 
              style={styles.aiWorkoutCard}
              onPress={() => handleSelectWorkout(aiRecommendedWorkout)}
            >
              <View style={styles.aiCardHeader}>
                <View style={styles.aiCardRow}>
                  <View style={styles.aiBadge}>
                    <Ionicons name="flash" size={12} color="#fff" />
                    <Text style={styles.aiBadgeText}>Personalized</Text>
                  </View>
                  <Text style={styles.aiCardDuration}>35 mins</Text>
                </View>
                <Text style={styles.aiCardTitle}>Strength Builder</Text>
                <Text style={styles.aiCardDescription}>Based on your fitness level</Text>
              </View>
              
              <View style={styles.exercisePreviewContainer}>
                <View style={styles.exercisePreviewRow}>
                  <View style={styles.exercisePreviewItem}>
                    <Text style={styles.previewExName}>Push-ups</Text>
                    <Text style={styles.previewExDetail}>3×12</Text>
                  </View>
                  <View style={styles.exercisePreviewItem}>
                    <Text style={styles.previewExName}>Squats</Text>
                    <Text style={styles.previewExDetail}>4×10</Text>
                  </View>
                  <View style={styles.exercisePreviewItem}>
                    <Text style={styles.previewExName}>Planks</Text>
                    <Text style={styles.previewExDetail}>3×45s</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.startNowButton}>
                <Text style={styles.startNowText}>Start Workout</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
            
            {/* Add a second AI recommended workout */}
            <TouchableOpacity 
              style={[styles.aiWorkoutCard, {marginLeft: 10}]}
              onPress={() => handleSelectWorkout(aiRecommendedWorkout2)}
            >
              <View style={styles.aiCardHeader}>
                <View style={styles.aiCardRow}>
                  <View style={styles.aiBadge}>
                    <Ionicons name="flash" size={12} color="#fff" />
                    <Text style={styles.aiBadgeText}>New</Text>
                  </View>
                  <Text style={styles.aiCardDuration}>30 mins</Text>
                </View>
                <Text style={styles.aiCardTitle}>Core Challenge</Text>
                <Text style={styles.aiCardDescription}>Targeted for your goals</Text>
              </View>
              
              <View style={styles.exercisePreviewContainer}>
                <View style={styles.exercisePreviewRow}>
                  <View style={styles.exercisePreviewItem}>
                    <Text style={styles.previewExName}>Crunches</Text>
                    <Text style={styles.previewExDetail}>3×15</Text>
                  </View>
                  <View style={styles.exercisePreviewItem}>
                    <Text style={styles.previewExName}>Plank</Text>
                    <Text style={styles.previewExDetail}>3×60s</Text>
                  </View>
                  <View style={styles.exercisePreviewItem}>
                    <Text style={styles.previewExName}>Leg Raise</Text>
                    <Text style={styles.previewExDetail}>3×12</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.startNowButton}>
                <Text style={styles.startNowText}>Start Workout</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Community', { initialTab: 'Messages' })}
            >
              <View style={[styles.actionIconBg, {backgroundColor: '#4A6FFF'}]}>
                <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
              </View>
              <Text style={styles.actionText}>Fitness Chat</Text>
              {/* Notification badge */}
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>3</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('DietPlan')}
            >
              <View style={[styles.actionIconBg, {backgroundColor: '#FF6B6B'}]}>
                <MaterialCommunityIcons name="food-apple" size={22} color="#fff" />
              </View>
              <Text style={styles.actionText}>Diet Plan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Booking')}  
            >
              <View style={[styles.actionIconBg, {backgroundColor: '#6BBF59'}]}>
                <MaterialCommunityIcons name="calendar-check" size={22} color="#fff" />
              </View>
              <Text style={styles.actionText}>Book Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Challenges')}
            >
              <View style={[styles.actionIconBg, {backgroundColor: '#FF9B42'}]}>
                <MaterialCommunityIcons name="trophy-outline" size={22} color="#fff" />
              </View>
              <Text style={styles.actionText}>Challenges</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Campus Gym Status */}
        <View style={styles.gymStatusContainer}>
          <Text style={styles.sectionTitle}>Campus Gym</Text>
          
          <View style={styles.gymStatusCard}>
            <View style={styles.gymStatusHeader}>
              <View style={styles.gymStatusInfo}>
                <Text style={styles.gymName}>Main Campus Gym</Text>
                <View style={styles.occupancyRow}>
                  <View style={[styles.statusIndicator, { backgroundColor: '#6BBF59' }]} />
                  <Text style={styles.occupancyText}>Low Traffic (24/120)</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.directionButton}>
                <MaterialCommunityIcons name="directions" size={20} color="#4A6FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.gymStatusDetails}>
              <View style={styles.equipmentItem}>
                <MaterialCommunityIcons name="walk" size={18} color="#666" />
                <Text style={styles.equipmentText}>Treadmills: 8/10 available</Text>
              </View>
              <View style={styles.equipmentItem}>
                <MaterialCommunityIcons name="weight" size={18} color="#666" />
                <Text style={styles.equipmentText}>Benches: 6/8 available</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.bookGymButton}>
              <Text style={styles.bookGymText}>Book Equipment</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Water Reminder - more subtle at the bottom */}
        <WaterReminderCard />
        
        {/* Bottom padding */}
        <View style={{height: 90}} />
      </ScrollView>

      {/* FIXED Floating AI Assistant Button */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          transform: [{ scale: aiButtonScale }, { rotate: spin }]
        }}
      >
        <TouchableOpacity 
          style={{ borderRadius: 30, overflow: 'hidden' }}
          activeOpacity={0.8}
          onPress={() => {
            animateAiButton();
            navigation.navigate('AIChat');
          }}
        >
          <LinearGradient
            colors={['#4A6FFF', '#6B66FF']}
            style={{ padding: 14, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialCommunityIcons name="robot" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

// Add an aiRecommendedWorkout object before the workoutPlans array
const aiRecommendedWorkout = {
  id: 4,
  title: 'Personalized Strength Builder',
  description: 'AI-generated workout based on your activity and fitness goals',
  duration: '35 min',
  level: 'Intermediate',
  calories: 330,
  image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a',
  exercises: [
    {
      id: 1,
      name: 'Push-ups',
      sets: 3,
      reps: '12',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Chest, Shoulders, Triceps',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/4775196/pexels-photo-4775196.jpeg'
    },
    {
      id: 2,
      name: 'Bodyweight Squats',
      sets: 4,
      reps: '10',
      weight: 'Bodyweight',
      rest: 60,
      muscleTarget: 'Quads, Hamstrings, Glutes',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/4498605/pexels-photo-4498605.jpeg'
    },
    {
      id: 3,
      name: 'Plank',
      sets: 3,
      reps: '45 seconds',
      weight: 'Bodyweight',
      rest: 30,
      muscleTarget: 'Core, Shoulders',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/6456300/pexels-photo-6456300.jpeg'
    },
    {
      id: 4,
      name: 'Dumbbell Rows',
      sets: 3,
      reps: '10 per side',
      weight: 'Medium',
      rest: 45,
      muscleTarget: 'Back, Biceps',
      equipment: 'Dumbbells',
      image: 'https://images.pexels.com/photos/4793238/pexels-photo-4793238.jpeg'
    },
    {
      id: 5,
      name: 'Lateral Raises',
      sets: 3,
      reps: '12',
      weight: 'Light',
      rest: 40,
      muscleTarget: 'Shoulders',
      equipment: 'Dumbbells',
      image: 'https://images.pexels.com/photos/4162582/pexels-photo-4162582.jpeg'
    }
  ]
};

// Add second AI recommended workout
const aiRecommendedWorkout2 = {
  id: 5,
  title: 'Core Challenge',
  description: 'AI-generated core-focused workout to strengthen your midsection',
  duration: '30 min',
  level: 'Intermediate',
  calories: 280,
  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
  exercises: [
    {
      id: 1,
      name: 'Crunches',
      sets: 3,
      reps: '15',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Abs',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/4775171/pexels-photo-4775171.jpeg'
    },
    {
      id: 2,
      name: 'Plank',
      sets: 3,
      reps: '60 seconds',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Core',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/6456300/pexels-photo-6456300.jpeg'
    },
    {
      id: 3,
      name: 'Leg Raises',
      sets: 3,
      reps: '12',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Lower Abs',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/4803665/pexels-photo-4803665.jpeg'
    },
    {
      id: 4,
      name: 'Russian Twists',
      sets: 3,
      reps: '16 total',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Obliques',
      equipment: 'Optional: Dumbbell or plate',
      image: 'https://images.pexels.com/photos/4384679/pexels-photo-4384679.jpeg'
    },
    {
      id: 5,
      name: 'Mountain Climbers',
      sets: 3,
      reps: '20 per side',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Core, Cardio',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/6456199/pexels-photo-6456199.jpeg'
    }
  ]
};

const workoutPlans = [
  {
    id: 1,
    title: 'Upper Body Focus',
    description: 'A comprehensive workout targeting chest, shoulders, arms and back',
    duration: '45 min',
    level: 'Intermediate',
    calories: 350,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
    exercises: [
      {
        id: 1,
        name: 'Bench Press',
        sets: 4,
        reps: '10-12',
        weight: '70% 1RM',
        rest: 60,
        muscleTarget: 'Chest',
        equipment: 'Barbell & Bench',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b'
      },
      {
        id: 2,
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        reps: '12-15',
        weight: 'Medium',
        rest: 45,
        muscleTarget: 'Shoulders',
        equipment: 'Dumbbells',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61'
      },
      {
        id: 3,
        name: 'Cable Rows',
        sets: 3,
        reps: '12',
        weight: 'Medium-Heavy',
        rest: 60,
        muscleTarget: 'Back',
        equipment: 'Cable Machine',
        image: 'https://images.unsplash.com/photo-1598575344693-2deeac70e258'
      },
      {
        id: 4,
        name: 'Bicep Curls',
        sets: 3,
        reps: '12-15',
        weight: 'Light-Medium',
        rest: 45,
        muscleTarget: 'Biceps',
        equipment: 'Dumbbells or Barbell',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e'
      },
      {
        id: 5,
        name: 'Tricep Pushdowns',
        sets: 3,
        reps: '15',
        weight: 'Light-Medium',
        rest: 45,
        muscleTarget: 'Triceps',
        equipment: 'Cable Machine',
        image: 'https://images.unsplash.com/photo-1598971639058-c762c4c0e8cb'
      }
    ]
  },
  {
    id: 2,
    title: 'Leg Day',
    description: 'Build lower body strength and power with this comprehensive leg workout',
    duration: '40 min',
    level: 'Advanced',
    calories: 400,
    image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d',
    exercises: [
      {
        id: 1,
        name: 'Barbell Squats',
        sets: 4,
        reps: '8-10',
        weight: '75% 1RM',
        rest: 90,
        muscleTarget: 'Quads, Glutes',
        equipment: 'Barbell & Squat Rack',
        image: 'https://images.unsplash.com/photo-1566241142889-7e9dc339c9f8'
      },
      {
        id: 2,
        name: 'Romanian Deadlifts',
        sets: 3,
        reps: '10-12',
        weight: 'Medium-Heavy',
        rest: 75,
        muscleTarget: 'Hamstrings, Lower Back',
        equipment: 'Barbell',
        image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2'
      },
      {
        id: 3,
        name: 'Walking Lunges',
        sets: 3,
        reps: '12 per leg',
        weight: 'Medium',
        rest: 60,
        muscleTarget: 'Quads, Glutes',
        equipment: 'Dumbbells',
        image: 'https://images.pexels.com/photos/6922165/pexels-photo-6922165.jpeg'
      },
      {
        id: 4,
        name: 'Leg Press',
        sets: 3,
        reps: '12-15',
        weight: 'Heavy',
        rest: 60,
        muscleTarget: 'Quads, Hamstrings',
        equipment: 'Leg Press Machine',
        image: 'https://images.pexels.com/photos/6550839/pexels-photo-6550839.jpeg'
      },
      {
        id: 5,
        name: 'Lying Leg Curls',
        sets: 3,
        reps: '12-15',
        weight: 'Medium',
        rest: 60,
        muscleTarget: 'Hamstrings',
        equipment: 'Leg Curl Machine',
        image: 'https://images.pexels.com/photos/6550851/pexels-photo-6550851.jpeg'
      },
      {
        id: 6,
        name: 'Standing Calf Raises',
        sets: 4,
        reps: '15-20',
        weight: 'Medium-Heavy',
        rest: 45,
        muscleTarget: 'Calves',
        equipment: 'Calf Raise Machine or Step',
        image: 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg'
      }
    ]
  },
  {
    id: 3,
    title: 'Full Body Toning',
    description: 'A balanced workout targeting all major muscle groups for complete body conditioning',
    duration: '50 min',
    level: 'Beginner',
    calories: 320,
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2',
    exercises: [
      {
        id: 1,
        name: 'Goblet Squats',
        sets: 3,
        reps: '12-15',
        weight: 'Medium',
        rest: 45,
        muscleTarget: 'Legs, Core',
        equipment: 'Kettlebell or Dumbbell',
        image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg'
      },
      {
        id: 2,
        name: 'Push-ups',
        sets: 3,
        reps: '10-12',
        weight: 'Bodyweight',
        rest: 45,
        muscleTarget: 'Chest, Shoulders, Triceps',
        equipment: 'None',
        image: 'https://images.pexels.com/photos/4775196/pexels-photo-4775196.jpeg'
      },
      {
        id: 3,
        name: 'Dumbbell Rows',
        sets: 3,
        reps: '12 per side',
        weight: 'Medium',
        rest: 45,
        muscleTarget: 'Back, Biceps',
        equipment: 'Dumbbells, Bench',
        image: 'https://images.pexels.com/photos/3838389/pexels-photo-3838389.jpeg'
      },
      {
        id: 4,
        name: 'Shoulder Press',
        sets: 3,
        reps: '10-12',
        weight: 'Light-Medium',
        rest: 45,
        muscleTarget: 'Shoulders',
        equipment: 'Dumbbells',
        image: 'https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg'
      },
      {
        id: 5,
        name: 'Glute Bridges',
        sets: 3,
        reps: '15-20',
        weight: 'Bodyweight/Light',
        rest: 30,
        muscleTarget: 'Glutes, Hamstrings',
        equipment: 'Optional: Dumbbell or Plate',
        image: 'https://images.pexels.com/photos/6551136/pexels-photo-6551136.jpeg'
      },
      {
        id: 6,
        name: 'Bicycle Crunches',
        sets: 3,
        reps: '20 total',
        weight: 'Bodyweight',
        rest: 30,
        muscleTarget: 'Core, Obliques',
        equipment: 'None',
        image: 'https://images.pexels.com/photos/6456304/pexels-photo-6456304.jpeg'
      },
      {
        id: 7,
        name: 'Bicep Curls',
        sets: 3,
        reps: '12-15',
        weight: 'Light',
        rest: 30,
        muscleTarget: 'Biceps',
        equipment: 'Dumbbells',
        image: 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'
      },
      {
        id: 8,
        name: 'Tricep Dips',
        sets: 3,
        reps: '12-15',
        weight: 'Bodyweight',
        rest: 30,
        muscleTarget: 'Triceps',
        equipment: 'Bench or Chair',
        image: 'https://images.pexels.com/photos/4608273/pexels-photo-4608273.jpeg'
      }
    ]
  },
  // ... more workout plans
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  profileAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#4A6FFF',
  },
  
  // Health Summary Styles
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  detailsLink: {
    fontSize: 14,
    color: '#4A6FFF',
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
  },
  
  // Section Container Styles
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionLink: {
    fontSize: 14,
    color: '#4A6FFF',
    fontWeight: '500',
  },
  horizontalScrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  
  // AI Recommendation Styles
  aiRecommendationContainer: {
    marginBottom: 20,
  },
  aiWorkoutCard: {
    backgroundColor: '#fff',
    width: 280,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  aiCardHeader: {
    marginBottom: 12,
  },
  aiCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiBadge: {
    flexDirection: 'row',
    backgroundColor: '#4A6FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  aiCardDuration: {
    fontSize: 13,
    color: '#666',
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  aiCardDescription: {
    fontSize: 14,
    color: '#666',
  },
  exercisePreviewContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
  },
  exercisePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exercisePreviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  previewExName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  previewExDetail: {
    fontSize: 12,
    color: '#666',
  },
  startNowButton: {
    flexDirection: 'row',
    backgroundColor: '#4A6FFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  startNowText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginRight: 5,
  },
  
  // Quick Actions Styles
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B6B',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Gym Status Styles
  gymStatusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  gymStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  gymStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gymStatusInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  occupancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  occupancyText: {
    fontSize: 13,
    color: '#666',
  },
  directionButton: {
    backgroundColor: '#f0f4ff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gymStatusDetails: {
    marginBottom: 15,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  equipmentText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  bookGymButton: {
    backgroundColor: '#f0f4ff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookGymText: {
    color: '#4A6FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Additional styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    height: 30,
    width: 1,
    backgroundColor: '#ddd',
  },
  tile: {
    width: '48%',
    height: 130,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  tileContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 5,
  },
  tileValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tileUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  statusDetails: {
    marginVertical: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  bookButton: {
    backgroundColor: '#4A6FFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  workoutPlanContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  seeAllText: {
    color: '#4A6FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  workoutCardsContainer: {
    paddingLeft: 15,
    paddingRight: 5,
    paddingBottom: 10,
  },
  aiWorkoutContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  aiWorkoutBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#4A6FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  aiWorkoutBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  aiWorkoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  aiWorkoutSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  aiWorkoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  aiWorkoutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiWorkoutDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  startWorkoutButton: {
    backgroundColor: '#4A6FFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  startWorkoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  workoutMetaContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  workoutMetaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  exercisesList: {
    marginBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
  },
  exerciseImage: {
    width: 80,
    height: 80,
  },
  exerciseInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  exerciseTimeInfo: {
    fontSize: 12,
    color: '#777',
  },
  startButton: {
    backgroundColor: '#4A6FFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aiAssistantCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  aiCardTextContainer: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  aiCardDescription: {
    fontSize: 14,
    color: '#666',
  },
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
  dietPlanCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dietPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dietPlanHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dietPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  dietPlanDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  dietPlanActions: {
    alignItems: 'flex-start',
  },
  dietPlanButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dietPlanButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  chatNotificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatNotificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Add new styles for sync functionality
  syncButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4A6FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#4A6FFF',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 5,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  connectHealthContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  connectHealthText: {
    marginVertical: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '80%',
  },
  connectHealthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f0f4ff',
    borderRadius: 20,
  },
  connectHealthButtonText: {
    color: '#4A6FFF',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 5,
  },
});

export default Dashboard;