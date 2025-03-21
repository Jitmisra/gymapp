import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import WorkoutPlanCard from '../WorkoutPlanCard';

const WorkoutSection = ({ navigation, handleSelectWorkout, workoutPlans }) => {
  return (
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
  );
};

const styles = StyleSheet.create({
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
});

export default WorkoutSection;
