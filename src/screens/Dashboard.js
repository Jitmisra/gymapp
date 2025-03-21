import React, { useContext, useState, useRef, useEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Alert, Animated, Easing } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import WaterReminderCard from '../components/WaterReminderCard';
import { LinearGradient } from 'expo-linear-gradient';

// Import componentized dashboard sections
import ProfileHeader from '../components/dashboard/ProfileHeader';
import HealthSummary from '../components/dashboard/HealthSummary';
import WorkoutSection from '../components/dashboard/WorkoutSection';
import AIRecommendations from '../components/dashboard/AIRecommendations';
import QuickActions from '../components/dashboard/QuickActions';
import GymStatus from '../components/dashboard/GymStatus';
import FloatingAIButton from '../components/dashboard/FloatingAIButton';

// Import workout plan data
import { workoutPlans, aiRecommendedWorkout, aiRecommendedWorkout2 } from '../data/workoutData';

const Dashboard = ({ navigation }) => {
  const { userData, healthData, refreshHealthData, connectedHealthApps } = useContext(AuthContext);
  const [isSyncingHealth, setIsSyncingHealth] = useState(false);
  const [aiButtonScale] = useState(new Animated.Value(1));
  const [aiButtonRotation] = useState(new Animated.Value(0));

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
      
      console.log("Navigating to workout:", validatedWorkout.title);
      
      navigation.navigate('WorkoutScreens', { 
        screen: 'WorkoutDetail',
        params: { workout: validatedWorkout }
      });
    } else {
      Alert.alert('Error', 'Could not load workout details');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* User Profile Header */}
      <ProfileHeader 
        userData={userData} 
        navigation={navigation} 
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Health Summary Card */}
        <HealthSummary 
          healthData={healthData}
          connectedHealthApps={connectedHealthApps}
          handleSyncHealthData={handleSyncHealthData}
          isSyncingHealth={isSyncingHealth}
          navigation={navigation}
          formatLastSync={formatLastSync}
        />
        
        {/* Today's Workout Section */}
        <WorkoutSection 
          navigation={navigation}
          handleSelectWorkout={handleSelectWorkout}
          workoutPlans={workoutPlans}
        />
        
        {/* AI Recommended Section */}
        <AIRecommendations 
          handleSelectWorkout={handleSelectWorkout}
          aiRecommendedWorkout={aiRecommendedWorkout}
          aiRecommendedWorkout2={aiRecommendedWorkout2}
        />

        {/* Quick Actions Grid */}
        <QuickActions navigation={navigation} />
        
        {/* Campus Gym Status */}
        <GymStatus />
        
        {/* Water Reminder */}
        <WaterReminderCard />
        
        {/* Bottom padding */}
        <View style={{height: 90}} />
      </ScrollView>

      {/* Floating AI Assistant Button */}
      <FloatingAIButton 
        navigation={navigation}
        aiButtonScale={aiButtonScale}
        aiButtonRotation={aiButtonRotation}
        animateAiButton={animateAiButton}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});

export default Dashboard;