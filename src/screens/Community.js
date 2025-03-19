import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const posts = [
  {
    id: '1',
    user: {
      name: 'Emma Wilson',
      avatar: 'https://randomuser.me/api/portraits/women/19.jpg',
    },
    time: '2 hours ago',
    content: 'Just completed a 5k run in 23 minutes! Personal best! 🏃‍♀️ #FitLife #RunningCommunity',
    likes: 24,
    comments: 5,
    image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    id: '2',
    user: {
      name: 'Mike Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    time: '5 hours ago',
    content: 'Looking for a workout buddy for tomorrow morning at the campus gym. Anyone interested? 💪',
    likes: 12,
    comments: 8,
    image: null,
  },
  {
    id: '3',
    user: {
      name: 'Sarah Parker',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    time: 'Yesterday',
    content: 'Check out this amazing protein smoothie recipe I discovered! Perfect post-workout recovery drink.',
    likes: 36,
    comments: 9,
    image: 'https://images.unsplash.com/photo-1525615379277-81263e391eba?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80',
  },
];

const leaderboard = [
  { id: '1', name: 'Alex Martin', points: 1250, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '2', name: 'Emma Wilson', points: 1120, avatar: 'https://randomuser.me/api/portraits/women/19.jpg' },
  { id: '3', name: 'Sarah Parker', points: 980, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '4', name: 'Mike Johnson', points: 945, avatar: 'https://randomuser.me/api/portraits/men/86.jpg' },
  { id: '5', name: 'David Thompson', points: 890, avatar: 'https://randomuser.me/api/portraits/men/54.jpg' },
];

const Community = ({ navigation, route }) => {
  // Check for initialTab parameter to set the active tab when navigating from Dashboard
  const initialTabParam = route.params?.initialTab;
  const [activeTab, setActiveTab] = useState(initialTabParam || 'Feed');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // When screen comes into focus, check for initialTab parameter
      if (route.params?.initialTab) {
        setActiveTab(route.params.initialTab);
        // Clear the parameter to avoid unexpected tab changes
        navigation.setParams({ initialTab: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.postHeaderInfo}>
          <Text style={styles.username}>{item.user.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons name="dots-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="heart" size={16} color="#666" />
          <Text style={styles.actionText}>{item.likes} Likes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="comment" size={16} color="#666" />
          <Text style={styles.actionText}>{item.comments} Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome5 name="share" size={16} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={styles.leaderboardItem}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Image source={{ uri: item.avatar }} style={styles.leaderAvatar} />
      <Text style={styles.leaderName}>{item.name}</Text>
      <View style={styles.pointsContainer}>
        <Text style={styles.points}>{item.points}</Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Feed' && styles.activeTab]}
          onPress={() => setActiveTab('Feed')}
        >
          <Text style={[styles.tabText, activeTab === 'Feed' && styles.activeTabText]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('Leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'Leaderboard' && styles.activeTabText]}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Messages' && styles.activeTab]}
          onPress={() => setActiveTab('Messages')}
        >
          <Text style={[styles.tabText, activeTab === 'Messages' && styles.activeTabText]}>Messages</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Feed' ? (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedContainer}
          ListHeaderComponent={
            <View style={styles.createPostContainer}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                style={styles.userAvatar} 
              />
              <TouchableOpacity style={styles.postInput}>
                <Text style={styles.postInputText}>Share your fitness journey...</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : activeTab === 'Leaderboard' ? (
        <View style={styles.leaderboardContainer}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>Campus Fitness Rankings</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>This Month</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#4A6FFF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.leaderboardList}
          />
        </View>
      ) : (
        <View style={styles.messagesContainer}>
          <FlatList
            data={[
              { id: 'user123', name: 'Emma Wilson', avatar: 'https://randomuser.me/api/portraits/women/19.jpg', lastMessage: 'Hey! Are you going to the gym today?', time: '10:30 AM', unread: 2 },
              { id: 'user456', name: 'Mike Johnson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', lastMessage: 'Did you check out that new protein shake?', time: 'Yesterday', unread: 0 },
              { id: 'user789', name: 'Sarah Parker', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', lastMessage: 'Just sent it to your email!', time: 'Monday', unread: 1 },
              { id: 'user101', name: 'David Thompson', avatar: 'https://randomuser.me/api/portraits/men/54.jpg', lastMessage: 'Thanks for the workout tips!', time: 'June 1', unread: 0 },
            ]}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.messageItem}
                onPress={() => navigation.navigate('FriendChat', {
                  friendId: item.id,
                  friendName: item.name,
                  friendAvatar: item.avatar
                })}
              >
                <View style={styles.messageAvatar}>
                  <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
                </View>
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageName}>{item.name}</Text>
                    <Text style={styles.messageTime}>{item.time}</Text>
                  </View>
                  <View style={styles.messagePreview}>
                    <Text 
                      style={[styles.messageText, item.unread > 0 && styles.unreadMessageText]} 
                      numberOfLines={1}
                    >
                      {item.lastMessage}
                    </Text>
                    {item.unread > 0 && (
                      <View style={styles.chatUnreadBadge}>
                        <Text style={styles.chatUnreadText}>{item.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
          />
        </View>
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
  feedContainer: {
    paddingBottom: 20,
  },
  createPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 20,
  },
  postInputText: {
    color: '#888',
  },
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postHeaderInfo: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#888',
  },
  moreButton: {
    padding: 5,
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    flex: 1,
  },
  actionText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  leaderboardContainer: {
    flex: 1,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    color: '#4A6FFF',
    marginRight: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  leaderboardList: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 40,
  },
  leaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  leaderName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6FFF',
    marginRight: 3,
  },
  pointsLabel: {
    fontSize: 12,
    color: '#888',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  messageAvatar: {
    marginRight: 15,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessageText: {
    fontWeight: '600',
    color: '#333',
  },
  chatUnreadBadge: {
    backgroundColor: '#4A6FFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  chatUnreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default Community;
