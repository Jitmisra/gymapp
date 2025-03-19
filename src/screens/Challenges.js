import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const challenges = [
  {
    id: '1',
    title: 'Push-up Challenge',
    description: '100 push-ups per day for 7 days',
    creator: { name: 'Mike Johnson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    participants: 18,
    duration: '7 days',
    progress: 0.6,
    joined: true,
  },
  {
    id: '2',
    title: '10K Steps Daily',
    description: 'Complete 10,000 steps every day for a month',
    creator: { name: 'Sarah Parker', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    participants: 34,
    duration: '30 days',
    progress: 0.3,
    joined: true,
  },
  {
    id: '3',
    title: 'Weight Loss Challenge',
    description: 'Lose 5% of your body weight in 2 months',
    creator: { name: 'David Thompson', avatar: 'https://randomuser.me/api/portraits/men/54.jpg' },
    participants: 25,
    duration: '60 days',
    progress: 0,
    joined: false,
  },
  {
    id: '4',
    title: 'Morning Yoga',
    description: 'Complete a 15-minute yoga session every morning',
    creator: { name: 'Emma Wilson', avatar: 'https://randomuser.me/api/portraits/women/19.jpg' },
    participants: 12,
    duration: '21 days',
    progress: 0,
    joined: false,
  },
];

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
  const [activeTab, setActiveTab] = useState('Challenges');
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);

  const renderChallengeItem = ({ item }) => (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <TouchableOpacity 
          style={[styles.joinButton, item.joined && styles.joinedButton]}
        >
          <Text style={[styles.joinButtonText, item.joined && styles.joinedButtonText]}>
            {item.joined ? 'Joined' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.challengeDescription}>{item.description}</Text>
      
      <View style={styles.creatorInfo}>
        <Image source={{ uri: item.creator.avatar }} style={styles.creatorAvatar} />
        <Text style={styles.creatorText}>Created by <Text style={styles.creatorName}>{item.creator.name}</Text></Text>
      </View>
      
      <View style={styles.challengeStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.statValue}>{item.participants} participants</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.statValue}>{item.duration}</Text>
        </View>
      </View>

      {item.joined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(item.progress * 100)}% complete</Text>
        </View>
      )}
    </View>
  );

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
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Challenges' && styles.activeTab]}
          onPress={() => setActiveTab('Challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'Challenges' && styles.activeTabText]}>Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Duels' && styles.activeTab]}
          onPress={() => setActiveTab('Duels')}
        >
          <Text style={[styles.tabText, activeTab === 'Duels' && styles.activeTabText]}>Duels</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Challenges' ? (
        <FlatList
          data={challenges}
          renderItem={renderChallengeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => setShowNewChallengeModal(true)}
            >
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={styles.createButtonText}>Create New Challenge</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <FlatList
          data={duels}
          renderItem={renderDuelItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <TouchableOpacity style={styles.createButton}>
              <Ionicons name="flash" size={22} color="#fff" />
              <Text style={styles.createButtonText}>Challenge a Friend</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 5,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#4A6FFF',
  },
  tabText: {
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
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
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#4A6FFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  joinedButton: {
    backgroundColor: '#e0e0e0',
  },
  joinedButtonText: {
    color: '#666',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  creatorText: {
    fontSize: 13,
    color: '#666',
  },
  creatorName: {
    fontWeight: '600',
    color: '#333',
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
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
