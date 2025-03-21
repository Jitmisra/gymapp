import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthContext';
import NotificationManager from '../utils/NotificationManager';

const DAILY_GOAL = 2000; // 2000ml or 2L
const GLASS_SIZE = 250; // 250ml per glass

const WaterReminderCard = () => {
  const { waterReminder } = useContext(AuthContext);
  const [waterIntake, setWaterIntake] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lastDrink, setLastDrink] = useState(null);
  const [fillAnimation] = useState(new Animated.Value(0));
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Load water intake data from AsyncStorage
  useEffect(() => {
    const loadWaterIntake = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const storedData = await AsyncStorage.getItem('waterIntake');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // If there's data for today, use it; otherwise start fresh
          if (parsedData.date === today) {
            setWaterIntake(parsedData.amount);
            setLastDrink(parsedData.lastDrink);
            
            // Animate the water level
            Animated.timing(fillAnimation, {
              toValue: Math.min(parsedData.amount / DAILY_GOAL, 1),
              duration: 500,
              useNativeDriver: false,
            }).start();
          } else {
            // New day, reset water intake
            resetWaterIntake();
          }
        }
      } catch (error) {
        console.error('Error loading water intake data:', error);
      }
    };
    
    loadWaterIntake();
  }, []);
  
  // Manage notifications based on waterReminder preference
  useEffect(() => {
    const manageNotifications = async () => {
      if (waterReminder) {
        // Try to schedule notifications
        const success = await NotificationManager.scheduleWaterReminders();
        setNotificationsEnabled(success);
        
        if (!success) {
          console.log('Could not enable water reminder notifications');
        }
      } else {
        // Cancel notifications
        await NotificationManager.cancelWaterReminders();
        setNotificationsEnabled(false);
      }
    };
    
    manageNotifications();
  }, [waterReminder]);
  
  const resetWaterIntake = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await AsyncStorage.setItem('waterIntake', JSON.stringify({
        date: today,
        amount: 0,
        lastDrink: null
      }));
      setWaterIntake(0);
      setLastDrink(null);
      fillAnimation.setValue(0);
    } catch (error) {
      console.error('Error resetting water intake:', error);
    }
  };
  
  const addWater = async (amount) => {
    try {
      const newAmount = waterIntake + amount;
      const now = new Date().toISOString();
      const today = now.split('T')[0];
      
      await AsyncStorage.setItem('waterIntake', JSON.stringify({
        date: today,
        amount: newAmount,
        lastDrink: now
      }));
      
      setWaterIntake(newAmount);
      setLastDrink(now);
      
      // Animate the water level
      Animated.timing(fillAnimation, {
        toValue: Math.min(newAmount / DAILY_GOAL, 1),
        duration: 500,
        useNativeDriver: false,
      }).start();
      
      setShowModal(false);
    } catch (error) {
      console.error('Error updating water intake:', error);
    }
  };
  
  const removeWater = async () => {
    if (waterIntake >= GLASS_SIZE) {
      try {
        const newAmount = waterIntake - GLASS_SIZE;
        const today = new Date().toISOString().split('T')[0];
        
        await AsyncStorage.setItem('waterIntake', JSON.stringify({
          date: today,
          amount: newAmount,
          lastDrink: lastDrink
        }));
        
        setWaterIntake(newAmount);
        
        // Animate the water level
        Animated.timing(fillAnimation, {
          toValue: Math.min(newAmount / DAILY_GOAL, 1),
          duration: 500,
          useNativeDriver: false,
        }).start();
      } catch (error) {
        console.error('Error updating water intake:', error);
      }
    }
  };
  
  const formatLastDrink = () => {
    if (!lastDrink) return 'Not yet today';
    
    const date = new Date(lastDrink);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };
  
  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      // If notifications are on, turn them off
      await NotificationManager.cancelWaterReminders();
      setNotificationsEnabled(false);
      Alert.alert('Notifications Disabled', 'Water reminder notifications have been turned off.');
    } else {
      // If notifications are off, try to turn them on
      const permissionGranted = await NotificationManager.requestNotificationPermissions();
      
      if (permissionGranted) {
        const success = await NotificationManager.scheduleWaterReminders();
        setNotificationsEnabled(success);
        
        if (success) {
          Alert.alert('Notifications Enabled', 'You will receive water reminders every 2 hours between 8am and 10pm.');
        } else {
          Alert.alert('Error', 'Could not enable notifications. Please check your device settings.');
        }
      } else {
        Alert.alert(
          'Permission Required',
          'We need notification permission to remind you to drink water. Please enable notifications in your device settings.',
          [
            { text: 'OK' }
          ]
        );
      }
    }
  };
  
  const progressPercentage = (waterIntake / DAILY_GOAL) * 100;
  
  // If water reminders are disabled, don't show the card
  if (!waterReminder) return null;
  
  const waterLevelHeight = fillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '80%'],
  });

  return (
    <>
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => setShowModal(true)}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Water Intake</Text>
          </View>
          <TouchableOpacity onPress={toggleNotifications}>
            <Ionicons 
              name={notificationsEnabled ? "notifications" : "notifications-off"} 
              size={22} 
              color={notificationsEnabled ? "#4A6FFF" : "#ccc"} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.bottleContainer}>
            <View style={styles.bottle}>
              <Animated.View 
                style={[
                  styles.waterLevel, 
                  { height: waterLevelHeight }
                ]} 
              />
              <View style={styles.bottleMask} />
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
            <Text style={styles.goalText}>{waterIntake}ml / {DAILY_GOAL}ml</Text>
            <Text style={styles.lastDrinkText}>Last drink: {formatLastDrink()}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Water Add Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Add Water</Text>
            
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.glassButton} 
                onPress={() => addWater(GLASS_SIZE)}
              >
                <Text style={styles.glassText}>Glass</Text>
                <Text style={styles.amountText}>{GLASS_SIZE}ml</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.glassButton} 
                onPress={() => addWater(GLASS_SIZE * 2)}
              >
                <Text style={styles.glassText}>Large</Text>
                <Text style={styles.amountText}>{GLASS_SIZE * 2}ml</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.glassButton} 
                onPress={() => addWater(GLASS_SIZE * 3)}
              >
                <Text style={styles.glassText}>Bottle</Text>
                <Text style={styles.amountText}>{GLASS_SIZE * 3}ml</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={removeWater}
            >
              <Text style={styles.removeButtonText}>Remove Last Glass</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
  },
  bottleContainer: {
    width: 60,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottle: {
    width: 40,
    height: 90,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4A6FFF',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  waterLevel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#4A6FFF40',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  bottleMask: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4A6FFF20',
    zIndex: 2,
  },
  statsContainer: {
    flex: 1,
    marginLeft: 20,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6FFF',
  },
  goalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  lastDrinkText: {
    fontSize: 12,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  glassButton: {
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 12,
    width: '30%',
  },
  glassText: {
    marginTop: 5,
    fontSize: 16,
    color: '#333',
  },
  amountText: {
    marginTop: 2,
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  removeButtonText: {
    color: '#FF4A6F',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#4A6FFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default WaterReminderCard;
