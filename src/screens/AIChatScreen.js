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
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  ImageBackground
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
// Import LinearGradient from expo-linear-gradient if installed
// If not installed, you'll need to run: expo install expo-linear-gradient
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const GEMINI_API_KEY = "AIzaSyAekVZznbr1vzT9LH6z5emlGE4gH-F7mIo"; // Replace with your actual API key

const AIChatScreen = ({ navigation }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: '0', 
      text: "Hi there! I'm your AI fitness coach. How can I help you with your workout or nutrition plan today?", 
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // Animated background movement
  const [bgPosition] = useState(new Animated.Value(0));
  useEffect(() => {
    Animated.loop(
      Animated.timing(bgPosition, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, []);

  // Suggested questions with fitness categories
  const suggestedQuestions = [
    { text: "What's a good workout for beginners?", category: "Training" },
    { text: "How can I lose weight effectively?", category: "Weight Loss" },
    { text: "What should I eat before a workout?", category: "Nutrition" },
    { text: "How to build muscle fast?", category: "Muscle" },
    { text: "Best exercises for core strength?", category: "Strength" },
    { text: "How much protein do I need daily?", category: "Diet" }
  ];

  // Animate the entrance
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Function to handle sending messages with enhanced animations
  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Pulse animation for send button
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert fitness coach and nutrition advisor named "FitCoach AI".
                    Your personality is motivational, knowledgeable, and supportive - like a real personal trainer.
                    When giving advice, use fitness-related terminology and include specific exercise recommendations when relevant.
                    Keep responses concise, motivating and actionable, like a real coach would.
                    If someone asks about injuries or medical conditions, remind them to consult healthcare professionals.
                    For nutrition questions, focus on balanced approaches rather than extreme diets.
                    Always encourage sustainable fitness habits and proper form.
                    Important: Don't use markdown formatting like asterisks (*) or bold/italic markers in your responses.
                    
                    
                    
                    Query: ${userMessage.text}`
                  }
                ]
              }
            ]
          })
        }
      );
      
      const data = await response.json();
      
      // Check if we got a proper response
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
        // Clean up markdown characters from the response
        let aiResponse = data.candidates[0].content.parts[0].text;
        
        // Remove markdown formatting characters (*, **, ___, etc.)
        aiResponse = aiResponse.replace(/\*\*\*(.*?)\*\*\*/g, '$1') // Replace *** with text
                             .replace(/\*\*(.*?)\*\*/g, '$1')       // Replace ** with text
                             .replace(/\*(.*?)\*/g, '$1')           // Replace * with text
                             .replace(/\_\_\_(.*?)\_\_\_/g, '$1')   // Replace ___ with text
                             .replace(/\_\_(.*?)\_\_/g, '$1')       // Replace __ with text
                             .replace(/\_(.*?)\_/g, '$1');          // Replace _ with text
        
        // Add AI response to chat
        const aiMessage = {
          id: Date.now().toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } else {
        // Handle error or empty response
        setMessages(prevMessages => [...prevMessages, {
          id: Date.now().toString(),
          text: "I'm having trouble accessing my fitness knowledge right now. Let's try again in a moment.",
          sender: 'ai',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Add error message
      setMessages(prevMessages => [...prevMessages, {
        id: Date.now().toString(),
        text: "Sorry, I couldn't connect to my fitness database. Please check your internet connection and try again.",
        sender: 'ai',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggested question tap with animation
  const handleSuggestedQuestion = (question) => {
    setInput(question);
    // Focus the input field
    inputRef.current?.focus();
  };
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Background translation for parallax effect
  const bgTranslate = bgPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -100]
  });

  // Define the message rendering function separately from the FlatList
  // This fixes the hooks error by not using hooks inside the render function
  const renderMessage = ({ item }) => {
    const isAI = item.sender === 'ai';
    
    return (
      <Animated.View 
        style={[
          styles.messageContainer,
          isAI ? styles.aiMessageContainer : styles.userMessageContainer,
          {
            opacity: 1, // Use static value instead of animation hook here
            transform: [{ translateY: 0 }] // Use static value instead of animation
          }
        ]}
      >
        {isAI && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#4A6FFF', '#6B66FF']}
              style={styles.avatar}
            >
              <FontAwesome5 name="dumbbell" size={14} color="#fff" />
            </LinearGradient>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isAI ? styles.aiMessageBubble : styles.userMessageBubble,
        ]}>
          {isAI && (
            <Text style={styles.aiLabel}>FitCoach AI</Text>
          )}
          
          <Text style={[
            styles.messageText,
            isAI ? styles.aiMessageText : styles.userMessageText
          ]}>{item.text}</Text>
          
          <Text style={styles.timestamp}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Animated Background */}
      <Animated.View style={[styles.backgroundContainer, {
        transform: [{ translateY: bgTranslate }]
      }]}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
          style={styles.backgroundImage}
        >
          <View style={styles.backgroundOverlay} />
        </ImageBackground>
      </Animated.View>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>FitCoach AI</Text>
          <View style={styles.onlineIndicator} />
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 90}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            { opacity: fadeAnim }
          ]}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isLoading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.typingAnimation}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              ) : null
            }
            keyboardShouldPersistTaps="handled"
            // Add extra padding to bottom of list to ensure visibility
            ListFooterComponentStyle={{ paddingBottom: 80 }}
            // Enable this to make the scroll always work with keyboard
            removeClippedSubviews={false}
          />
          
          {messages.length <= 1 && (
            <Animated.View 
              style={[
                styles.suggestionsContainer,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.suggestionsTitle}>Ask me about:</Text>
              <View style={styles.suggestionsList}>
                {suggestedQuestions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestedQuestion(item.text)}
                  >
                    <View style={styles.suggestionIconContainer}>
                      <FontAwesome5 
                        name={getCategoryIcon(item.category)} 
                        size={12} 
                        color="#4A6FFF" 
                      />
                    </View>
                    <Text style={styles.suggestionText}>{item.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}
        </Animated.View>
        
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your fitness questions..."
            placeholderTextColor="#999"
            multiline
            maxHeight={100}
            maxLength={500}
            autoCorrect={false}
            blurOnSubmit={false}
          />
          
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !input.trim() && styles.disabledSendButton
              ]}
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={input.trim() ? "#fff" : "rgba(255,255,255,0.5)"} 
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Helper function to get icon based on category
const getCategoryIcon = (category) => {
  switch(category) {
    case 'Training': return 'running';
    case 'Weight Loss': return 'weight';
    case 'Nutrition': return 'apple-alt';
    case 'Muscle': return 'dumbbell';
    case 'Strength': return 'fist-raised';
    case 'Diet': return 'utensils';
    default: return 'question-circle';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1200, // Make it larger than screen to allow for parallax
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 6,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6BBF59',
  },
  headerButton: {
    padding: 5,
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
  },
  messagesList: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    paddingBottom: 100, // Add extra padding at the bottom for keyboard
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 20,
    elevation: 2,
  },
  userMessageBubble: {
    backgroundColor: '#4A6FFF',
    borderBottomRightRadius: 5,
  },
  aiMessageBubble: {
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    borderBottomLeftRadius: 5,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A6FFF',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingBottom: Platform.OS === "ios" ? 35 : 15, // Increased bottom padding for iOS
    // Add shadow to make input stand out
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
    position: 'relative',
    zIndex: 2,
    // Fix bottom space issue
    marginBottom: Platform.OS === 'ios' ? 0 : 0,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    maxHeight: 100,
    minHeight: 45, // Ensure minimum height
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4A6FFF',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledSendButton: {
    backgroundColor: 'rgba(39, 39, 48, 0.8)',
    shadowOpacity: 0,
  },
  loadingContainer: {
    padding: 15,
    alignItems: 'flex-start',
  },
  typingAnimation: {
    flexDirection: 'row',
    backgroundColor: 'rgba(42, 42, 42, 0.4)',
    padding: 10,
    borderRadius: 20,
    width: 70,
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 3,
    opacity: 0.6,
  },
  typingDot1: {
    animationName: 'bounce',
    animationDuration: '600ms',
    animationIterationCount: 'infinite',
  },
  typingDot2: {
    animationName: 'bounce',
    animationDuration: '600ms',
    animationDelay: '150ms',
    animationIterationCount: 'infinite',
  },
  typingDot3: {
    animationName: 'bounce',
    animationDuration: '600ms',
    animationDelay: '300ms',
    animationIterationCount: 'infinite',
  },
  suggestionsContainer: {
    padding: 15,
    marginBottom: 10,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  suggestionsList: {
    flexDirection: 'column',
  },
  suggestionButton: {
    backgroundColor: 'rgba(42, 42, 42, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  suggestionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
});

// Add keyframe animations for typing dots
if (Platform.OS === 'web') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }
  `;
  document.head.append(styleSheet);
}

export default AIChatScreen;
