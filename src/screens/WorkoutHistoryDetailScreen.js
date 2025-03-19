import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Share
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

const WorkoutHistoryDetailScreen = ({ route, navigation }) => {
  const { workoutHistory } = route.params;
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  if (!workoutHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF4A6F" />
          <Text style={styles.errorText}>Workout data not available</Text>
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

  const formattedDate = workoutHistory.timestamp 
    ? format(parseISO(workoutHistory.timestamp), 'EEEE, MMMM d, yyyy')
    : 'Unknown date';

  const formattedTime = workoutHistory.timestamp 
    ? format(parseISO(workoutHistory.timestamp), 'h:mm a')
    : '';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I completed the ${workoutHistory.name} workout on ${formattedDate} using the Campus Fitness app! Burned ${workoutHistory.calories} calories in ${workoutHistory.duration}.`,
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header Image and Overlay */}
        <View style={styles.headerContainer}>
          <Image 
            source={{ uri: imageLoadFailed ? 
              'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg' : 
              workoutHistory.image 
            }}
            style={styles.headerImage}
            onError={() => setImageLoadFailed(true)}
          />
          <View style={styles.headerOverlay} />
          
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.workoutDateContainer}>
              <Text style={styles.workoutDate}>{formattedDate}</Text>
              <Text style={styles.workoutTime}>{formattedTime}</Text>
            </View>
          </View>
        </View>
        
        {/* Workout Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.workoutTitle}>{workoutHistory.name}</Text>
          <Text style={styles.workoutDescription}>{workoutHistory.description}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#4A6FFF" />
              <Text style={styles.statValue}>{workoutHistory.duration}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="fire" size={24} color="#FF5252" />
              <Text style={styles.statValue}>{workoutHistory.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="dumbbell" size={24} color="#66BB6A" />
              <Text style={styles.statValue}>{workoutHistory.exercises}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
          </View>
          
          {/* Additional Stats Section */}
          <View style={styles.additionalStatsContainer}>
            <Text style={styles.sectionTitle}>Performance</Text>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceItem}>
                <View style={styles.performanceIconContainer}>
                  <MaterialCommunityIcons name="lightning-bolt" size={18} color="#FF9F1C" />
                </View>
                <View style={styles.performanceTextContainer}>
                  <Text style={styles.performanceLabel}>Intensity Level</Text>
                  <Text style={styles.performanceValue}>Medium</Text>
                </View>
              </View>
              
              <View style={styles.performanceDivider} />
              
              <View style={styles.performanceItem}>
                <View style={styles.performanceIconContainer}>
                  <MaterialCommunityIcons name="heart-pulse" size={18} color="#FF5252" />
                </View>
                <View style={styles.performanceTextContainer}>
                  <Text style={styles.performanceLabel}>Avg. Heart Rate</Text>
                  <Text style={styles.performanceValue}>135 BPM</Text>
                </View>
              </View>
            </View>
            
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>
                {workoutHistory.notes || 'No notes recorded for this workout. You can add notes after completing a workout to track your progress and feelings.'}
              </Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShare}
            >
              <Ionicons name="share-social" size={18} color="#4A6FFF" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.repeatButton}
              onPress={() => {
                // Navigate to start this workout again
                navigation.navigate('Dashboard');
              }}
            >
              <MaterialCommunityIcons name="repeat" size={18} color="#fff" />
              <Text style={styles.repeatButtonText}>Repeat Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    height: 240,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutDateContainer: {
    alignItems: 'center',
  },
  workoutDate: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  workoutTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  detailsContainer: {
    padding: 20,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  additionalStatsContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  performanceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  performanceTextContainer: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  performanceDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#4A6FFF',
  },
  shareButtonText: {
    color: '#4A6FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  repeatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6FFF',
    padding: 15,
    borderRadius: 10,
    marginLeft: 8,
  },
  repeatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default WorkoutHistoryDetailScreen;
