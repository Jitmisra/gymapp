import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Key for storing notification IDs
const WATER_NOTIFICATION_IDS = 'water_notification_ids';

export const NotificationManager = {
  // Request permission for notifications
  requestNotificationPermissions: async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get notification permission!');
        return false;
      }
      
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('water-reminders', {
          name: 'Water Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A6FFF',
        });
      }
      
      return true;
    } else {
      console.log('Must use physical device for notifications');
      return false;
    }
  },
  
  // Schedule water reminder notifications every 2 hours
  scheduleWaterReminders: async () => {
    // First cancel any existing reminders
    await NotificationManager.cancelWaterReminders();
    
    // Check permissions
    const permissionGranted = await NotificationManager.requestNotificationPermissions();
    if (!permissionGranted) return false;
    
    const notificationIds = [];
    
    // Get current time
    const now = new Date();
    
    // Schedule notifications every 2 hours from 8am to 10pm
    for (let hour = 8; hour <= 22; hour += 2) {
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, 0, 0, 0);
      
      // If the time is in the past for today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Stay hydrated! 💧",
          body: "Time to drink some water. Your body needs it!",
          data: { type: 'water_reminder' },
        },
        trigger: {
          hour: hour,
          minute: 0,
          repeats: true,
        },
      });
      
      notificationIds.push(identifier);
    }
    
    // Save notification IDs for future reference
    await AsyncStorage.setItem(WATER_NOTIFICATION_IDS, JSON.stringify(notificationIds));
    return true;
  },
  
  // Cancel all scheduled water reminders
  cancelWaterReminders: async () => {
    try {
      // Get stored notification IDs
      const storedIds = await AsyncStorage.getItem(WATER_NOTIFICATION_IDS);
      if (storedIds) {
        const notificationIds = JSON.parse(storedIds);
        
        // Cancel each scheduled notification
        for (const id of notificationIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        
        // Clear the stored IDs
        await AsyncStorage.removeItem(WATER_NOTIFICATION_IDS);
      }
      
      return true;
    } catch (error) {
      console.error('Error canceling water reminders:', error);
      return false;
    }
  }
};

export default NotificationManager;
