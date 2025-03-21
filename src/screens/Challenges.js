import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Removed challenges array

const duels = [
  {
    id: '1',
    opponent: { name: 'Sarah Parker', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    type: 'Steps',
    status: 'active',
    yourScore: 8546,
    opponentScore: 7892,
    timeLeft: '2 days',
  },
  {
    id: '2',
    opponent: { name: 'Mike Johnson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    type: 'Push-ups',
    status: 'pending',
    yourScore: 0,
    opponentScore: 0,
    timeLeft: 'Awaiting acceptance',
  },
];

const Challenges = () => {
  // Removed showNewChallengeModal state
  // Removed activeTab state since we only have duels now
  
  // Removed renderChallengeItem function

  const renderDuelItem = ({ item }) => (
    <View style={styles.duelCard}>
      <View style={styles.duelHeader}>
        <View style={styles.duelType}>
          <FontAwesome5 
            name={item.type === 'Steps' ? 'shoe-prints' : 'dumbbell'} 
            size={14} 
            color="#fff" 
          />
          <Text style={styles.duelTypeText}>{item.type}</Text>
        </View>
        <Text style={[
          styles.duelStatus, 
          item.status === 'active' ? styles.activeDuel : styles.pendingDuel
        ]}>
          {item.status === 'active' ? 'ACTIVE' : 'PENDING'}
        </Text>
      </View>
      
      <View style={styles.duelContent}>
        <View style={styles.playerInfo}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.playerAvatar} />
          <Text style={styles.playerName}>You</Text>
          {item.status === 'active' && <Text style={styles.scoreText}>{item.yourScore}</Text>}
        </View>
        
        <View style={styles.versusContainer}>
          <Text style={styles.versusText}>VS</Text>
          {item.status === 'active' && (
            <View style={[styles.playerIndicator, item.yourScore > item.opponentScore ? styles.winningIndicator : styles.losingIndicator]} />
          )}
        </View>
        
        <View style={styles.playerInfo}>
          <Image source={{ uri: item.opponent.avatar }} style={styles.playerAvatar} />
          <Text style={styles.playerName}>{item.opponent.name}</Text>
          {item.status === 'active' && <Text style={styles.scoreText}>{item.opponentScore}</Text>}
        </View>
      </View>
      
      <View style={styles.duelFooter}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.timeLeftText}>{item.timeLeft}</Text>
        </View>
        
        {item.status === 'pending' ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.declineButton]}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.acceptButton]}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Removed tab container since we only show duels now */}
      <FlatList
        data={duels}
        renderItem={renderDuelItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View>
            <Text style={styles.screenTitle}>Fitness Duels</Text>
            <Text style={styles.screenSubtitle}>Challenge friends and track your progress</Text>
            <TouchableOpacity style={styles.createButton}>
              <Ionicons name="flash" size={22} color="#fff" />
              <Text style={styles.createButtonText}>Challenge a Friend</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Removed tabContainer, tab, activeTab, tabText, activeTabText styles
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  listContainer: {
    padding: 15,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6FFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 15,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  // Removed challengeCard related styles
  duelCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
  },
  duelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  duelType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duelTypeText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  duelStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeDuel: {
    color: '#4CAF50',
  },
  pendingDuel: {
    color: '#FFC107',
  },
  duelContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  playerInfo: {
    flex: 2,
    alignItems: 'center',
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6FFF',
  },
  versusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  versusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 5,
  },
  playerIndicator: {
    width: 80,
    height: 4,
    borderRadius: 2,
  },
  winningIndicator: {
    backgroundColor: '#4CAF50',
  },
  losingIndicator: {
    backgroundColor: '#FF6B6B',
  },
  duelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLeftText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginLeft: 8,
  },
  declineButton: {
    backgroundColor: '#f0f0f0',
  },
  declineButtonText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#4A6FFF',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  detailsButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  detailsButtonText: {
    color: '#4A6FFF',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default Challenges;
