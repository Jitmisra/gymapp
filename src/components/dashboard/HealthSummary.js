import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HealthSummary = ({ 
  healthData, 
  connectedHealthApps, 
  handleSyncHealthData, 
  isSyncingHealth, 
  navigation,
  formatLastSync 
}) => {

  // Function to check if any health app is connected
  const isAnyHealthAppConnected = () => {
    return connectedHealthApps.googleFit || 
           connectedHealthApps.appleHealth || 
           connectedHealthApps.samsungHealth;
  };

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeaderRow}>
          <Text style={styles.summaryTitle}>Today's Progress</Text>
          <TouchableOpacity 
            style={styles.syncButton}
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
  );
};

const styles = StyleSheet.create({
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

export default HealthSummary;
