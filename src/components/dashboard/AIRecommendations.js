import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const AIRecommendations = ({ handleSelectWorkout, aiRecommendedWorkout, aiRecommendedWorkout2 }) => {
  return (
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
});

export default AIRecommendations;
