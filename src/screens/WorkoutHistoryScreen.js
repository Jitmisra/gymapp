import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

const WorkoutHistoryScreen = ({ navigation }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      setLoading(true);
      const historyString = await AsyncStorage.getItem('workoutHistory');
      
      if (historyString) {
        const historyData = JSON.parse(historyString);
        setWorkouts(historyData);
      }
    } catch (error) {
      console.error('Error loading workout history:', error);
      Alert.alert('Error', 'Failed to load your workout history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutHistory();
    setRefreshing(false);
  };

  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your workout history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('workoutHistory');
              setWorkouts([]);
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear workout history');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    try {
      const date = parseISO(timestamp);
      const now = new Date();
      
      // Today
      if (date.toDateString() === now.toDateString()) {
        return `Today, ${format(date, 'h:mm a')}`;
      }
      
      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${format(date, 'h:mm a')}`;
      }
      
      // Within the last week
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      if (date > oneWeekAgo) {
        return format(date, 'EEEE, h:mm a');
      }
      
      // Older
      return format(date, 'MMM d, yyyy');
      
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Unknown date';
    }
  };

  const getFilteredWorkouts = () => {
    if (filterType === 'all') return workouts;
    
    const now = new Date();
    
    if (filterType === 'week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      return workouts.filter(workout => {
        const workoutDate = parseISO(workout.timestamp);
        return workoutDate >= oneWeekAgo;
      });
    }
    
    if (filterType === 'month') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return workouts.filter(workout => {
        const workoutDate = parseISO(workout.timestamp);
        return workoutDate >= oneMonthAgo;
      });
    }
    
    return workouts;
  };

  const getWorkoutStats = () => {
    const filteredWorkouts = getFilteredWorkouts();
    
    return {
      count: filteredWorkouts.length,
      totalCalories: filteredWorkouts.reduce((sum, workout) => sum + Number(workout.calories || 0), 0),
      totalMinutes: filteredWorkouts.reduce((sum, workout) => {
        const durationMatch = workout.duration?.match(/(\d+)/);
        return sum + (durationMatch ? Number(durationMatch[0]) : 0);
      }, 0)
    };
  };

  const stats = getWorkoutStats();
  const filteredWorkouts = getFilteredWorkouts();

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutHistoryDetail', { workoutHistory: item })}
    >
      <Image 
        source={{ uri: failedImages[item.id] ? 
          'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg' : 
          item.image 
        }}
        style={styles.workoutImage}
        onError={() => {
          console.log("Failed to load workout image, using default");
          setFailedImages(prev => ({...prev, [item.id]: true}));
        }}
      />
      <View style={styles.workoutCardOverlay} />
      <View style={styles.workoutInfo}>
        <View style={styles.workoutHeaderRow}>
          <Text style={styles.workoutTime}>{formatDate(item.timestamp)}</Text>
          <View style={styles.caloriesBadge}>
            <MaterialCommunityIcons name="fire" size={14} color="#fff" />
            <Text style={styles.caloriesText}>{item.calories}</Text>
          </View>
        </View>
        
        <Text style={styles.workoutTitle}>{item.name}</Text>
        
        <View style={styles.workoutDetails}>
          <View style={styles.workoutDetail}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#ddd" />
            <Text style={styles.workoutDetailText}>{item.duration}</Text>
          </View>
          
          <View style={styles.workoutDetail}>
            <MaterialCommunityIcons name="dumbbell" size={14} color="#ddd" />
            <Text style={styles.workoutDetailText}>{item.exercises} exercises</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout History</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearHistory}
        >
          <MaterialCommunityIcons name="delete-outline" size={24} color="#FF4A6F" />
        </TouchableOpacity>
      </View>
      
      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.count}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalCalories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>
      
      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterOption, filterType === 'all' && styles.activeFilterOption]}
          onPress={() => setFilterType('all')}
        >
          <Text style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>
            All Time
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterOption, filterType === 'week' && styles.activeFilterOption]}
          onPress={() => setFilterType('week')}
        >
          <Text style={[styles.filterText, filterType === 'week' && styles.activeFilterText]}>
            This Week
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterOption, filterType === 'month' && styles.activeFilterOption]}
          onPress={() => setFilterType('month')}
        >
          <Text style={[styles.filterText, filterType === 'month' && styles.activeFilterText]}>
            This Month
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4A6FFF" />
          <Text style={styles.loaderText}>Loading your workout history...</Text>
        </View>
      ) : filteredWorkouts.length > 0 ? (
        <FlatList
          data={filteredWorkouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.workoutList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="dumbbell" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>No Workouts Found</Text>
          <Text style={styles.emptyMessage}>
            {filterType !== 'all' 
              ? "Try changing your filter to see more workouts" 
              : "Complete a workout to start building your history"}
          </Text>
          {filterType === 'all' && (
            <TouchableOpacity
              style={styles.startWorkoutButton}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.startWorkoutButtonText}>Find a Workout</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  statsContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#eee',
    alignSelf: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterOption: {
    backgroundColor: '#4A6FFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  workoutList: {
    padding: 15,
    paddingTop: 5,
  },
  workoutCard: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  workoutImage: {
    width: '100%',
    height: '100%',
  },
  workoutCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
  },
  workoutInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  workoutTime: {
    color: '#eee',
    fontSize: 12,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,91,91,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  caloriesText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 3,
    fontWeight: '500',
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  workoutDetailText: {
    color: '#ddd',
    fontSize: 13,
    marginLeft: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 15,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startWorkoutButton: {
    backgroundColor: '#4A6FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startWorkoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default WorkoutHistoryScreen;
