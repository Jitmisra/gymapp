import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const GymStatus = () => {
  return (
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
  );
};

const styles = StyleSheet.create({
  gymStatusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
});

export default GymStatus;
