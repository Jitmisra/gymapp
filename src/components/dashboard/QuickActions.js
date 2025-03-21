import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const QuickActions = ({ navigation }) => {
  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('AIChat')}
        >
          <View style={[styles.actionIconBg, {backgroundColor: '#4A6FFF'}]}>
            <MaterialCommunityIcons name="robot" size={22} color="#fff" />
          </View>
          <Text style={styles.actionText}>AI Chatbot</Text>
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
  );
};

const styles = StyleSheet.create({
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
});

export default QuickActions;
