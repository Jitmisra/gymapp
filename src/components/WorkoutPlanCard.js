import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WorkoutPlanCard = ({ title, duration, level, exercises, image, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <ImageBackground
        source={{ uri: image }}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={[styles.overlay, { backgroundColor: color + 'CC' }]} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#fff" />
              <Text style={styles.detailText}>{duration}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="signal" size={16} color="#fff" />
              <Text style={styles.detailText}>{level}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="dumbbell" size={16} color="#fff" />
              <Text style={styles.detailText}>{exercises} Exercises</Text>
            </View>
          </View>
          
          <View style={styles.startButtonContainer}>
            <Text style={styles.startText}>Start</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 180,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff', // Add explicit background color
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    borderRadius: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  content: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailsContainer: {
    marginVertical: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  startButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)', // Already has a background color
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  startText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 3,
  },
});

export default WorkoutPlanCard;
