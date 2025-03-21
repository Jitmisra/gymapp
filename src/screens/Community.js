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

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Feed' && styles.activeTab]}
          onPress={() => setActiveTab('Feed')}
        >
          <Text style={[styles.tabText, activeTab === 'Feed' && styles.activeTabText]}>Feed</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Feed' && (
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
});

export default Community;
