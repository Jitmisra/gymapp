import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Mock data for friend conversations
const mockMessages = {
  'user123': [
    { id: 1, text: "Hey! Are you going to the gym today?", sender: 'friend', timestamp: '10:30 AM' },
    { id: 2, text: "Yeah, planning to go around 5 PM. Want to join?", sender: 'me', timestamp: '10:32 AM' },
    { id: 3, text: "Perfect! Let's meet at the entrance.", sender: 'friend', timestamp: '10:33 AM' },
    { id: 4, text: "I want to work on my core strength today.", sender: 'friend', timestamp: '10:34 AM' },
    { id: 5, text: "Sounds good! I'll focus on upper body today.", sender: 'me', timestamp: '10:36 AM' },
  ],
  'user456': [
    { id: 1, text: "Did you check out that new protein shake?", sender: 'friend', timestamp: 'Yesterday' },
    { id: 2, text: "Not yet, is it good?", sender: 'me', timestamp: 'Yesterday' },
    { id: 3, text: "Yes! Great macros and tastes amazing.", sender: 'friend', timestamp: 'Yesterday' },
  ],
  'user789': [
    { id: 1, text: "Can you share your workout plan?", sender: 'me', timestamp: 'Monday' },
    { id: 2, text: "Sure! I'll send it over tonight.", sender: 'friend', timestamp: 'Monday' },
    { id: 3, text: "Just sent it to your email!", sender: 'friend', timestamp: 'Monday' },
    { id: 4, text: "Thanks! This looks challenging.", sender: 'me', timestamp: 'Monday' },
  ],
};

// Mock data for contacts
const contacts = [
  { id: 'user123', name: 'Emma Wilson', avatar: 'https://randomuser.me/api/portraits/women/19.jpg', status: 'online', lastSeen: 'Now', unread: 2 },
  { id: 'user456', name: 'Mike Johnson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', status: 'offline', lastSeen: '15m ago', unread: 0 },
  { id: 'user789', name: 'Sarah Parker', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', status: 'online', lastSeen: 'Now', unread: 1 },
  { id: 'user101', name: 'David Thompson', avatar: 'https://randomuser.me/api/portraits/men/54.jpg', status: 'offline', lastSeen: '2h ago', unread: 0 },
  { id: 'user102', name: 'Lisa Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/63.jpg', status: 'online', lastSeen: 'Now', unread: 0 },
];

const FriendChat = ({ route, navigation }) => {
  const { friendId, friendName, friendAvatar } = route?.params || {};
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [showContacts, setShowContacts] = useState(!friendId);
  const [fadeAnim] = useState(new Animated.Value(0));
  const flatListRef = useRef(null);

  useEffect(() => {
    // If a friend was selected, load their messages
    if (friendId) {
      setChatMessages(mockMessages[friendId] || []);
    }
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [friendId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && chatMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  const handleSend = () => {
    if (message.trim() === '') return;
    
    // Add new message to the chat
    const newMessage = {
      id: Date.now(),
      text: message.trim(),
      sender: 'me',
      timestamp: 'Just now'
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setMessage('');
    
    // Simulate reply after a delay
    setTimeout(() => {
      const replyMessage = {
        id: Date.now() + 1,
        text: getRandomReply(),
        sender: 'friend',
        timestamp: 'Just now'
      };
      
      setChatMessages(prev => [...prev, replyMessage]);
    }, 2000);
  };

  const getRandomReply = () => {
    const replies = [
      "That sounds great!",
      "I'm in the gym right now!",
      "Let's plan our next workout together.",
      "How's your progress on the fitness challenge?",
      "Did you try that protein shake I recommended?",
      "I just beat my personal record today!",
      "Want to join me for a run tomorrow?",
    ];
    
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    
    return (
      <View style={[
        styles.messageBubble,
        isMe ? styles.myMessage : styles.friendMessage
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    );
  };

  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => {
        navigation.navigate('FriendChat', {
          friendId: item.id,
          friendName: item.name,
          friendAvatar: item.avatar
        });
      }}
    >
      <View style={styles.contactAvatar}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.status === 'online' && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.lastSeen}>
          {item.status === 'online' ? 'Online' : `Last seen ${item.lastSeen}`}
        </Text>
      </View>
      
      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render contact list if no friend is selected
  if (showContacts) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fitness Buddies</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <FlatList
            data={contacts}
            renderItem={renderContactItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.contactsList}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.chatHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Image source={{ uri: friendAvatar }} style={styles.headerAvatar} />
        
        <View style={styles.headerUserInfo}>
          <Text style={styles.headerName}>{friendName}</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call" size={22} color="#4A6FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="videocam" size={22} color="#4A6FFF" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 90}
      >
        <Animated.View style={[styles.messagesContainer, { opacity: fadeAnim }]}>
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesList}
          />
          
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="add-circle" size={24} color="#4A6FFF" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
              maxHeight={100}
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !message.trim() && styles.disabledButton
              ]}
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={message.trim() ? "#fff" : "rgba(255,255,255,0.5)"}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    padding: 5,
  },
  contactsList: {
    padding: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  contactAvatar: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
    bottom: 0,
    right: 0,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lastSeen: {
    fontSize: 14,
    color: '#888',
  },
  unreadBadge: {
    backgroundColor: '#4A6FFF',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 5,
    marginRight: 5,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerUserInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  headerAction: {
    padding: 8,
    marginLeft: 5,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
  },
  myMessage: {
    backgroundColor: '#4A6FFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  friendMessage: {
    backgroundColor: '#e8e8e8',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  attachButton: {
    padding: 5,
    marginRight: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4A6FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default FriendChat;
