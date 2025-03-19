import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GymBot = ({ navigation }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hi there! I'm GymBot. How can I help with your fitness journey today?",
      isBot: true
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle keyboard appearance
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      isBot: false
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking and response
    setTimeout(() => {
      let botResponseText = getBotResponse(input.trim());
      
      // Clean any markdown characters that might be in the response
      botResponseText = botResponseText.replace(/\*\*\*(.*?)\*\*\*/g, '$1')
                                     .replace(/\*\*(.*?)\*\*/g, '$1')
                                     .replace(/\*(.*?)\*/g, '$1')
                                     .replace(/\_\_\_(.*?)\_\_\_/g, '$1')
                                     .replace(/\_\_(.*?)\_\_/g, '$1')
                                     .replace(/\_(.*?)\_/g, '$1');
      
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        isBot: true
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple response generator
  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('workout') || input.includes('exercise')) {
      return "I recommend checking out our workout plans in the Dashboard section. We have options for all fitness levels!";
    } 
    else if (input.includes('diet') || input.includes('nutrition') || input.includes('food')) {
      return "For diet advice, visit our Diet Plan section where you can create personalized meal plans based on your goals.";
    }
    else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hi there! How can I help you with your fitness goals today?";
    }
    else {
      return "I'm here to help with workout and nutrition questions. Could you be more specific about what fitness advice you're looking for?";
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: Math.max(20, keyboardHeight * 0.5) } // Add dynamic padding based on keyboard height
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.message,
                message.isBot ? styles.botMessage : styles.userMessage
              ]}
            >
              <Text style={[
                styles.messageText, 
                message.isBot ? {} : styles.userMessageText
              ]}>
                {message.text}
              </Text>
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.message, styles.botMessage]}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about workouts, nutrition..."
            placeholderTextColor="#999"
            multiline
            maxHeight={100}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !input.trim() && styles.disabledSendButton
            ]} 
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={20} color={input.trim() ? "#fff" : "rgba(255,255,255,0.5)"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  botMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    backgroundColor: '#4A6FFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 30 : 15, // Increased bottom padding
    marginBottom: 0, // Remove any margin at the bottom
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4A6FFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  disabledSendButton: {
    backgroundColor: '#ccc',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 2,
    opacity: 0.7,
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
});

export default GymBot;
