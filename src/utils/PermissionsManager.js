import { Platform, PermissionsAndroid, Alert } from 'react-native';

class PermissionsManager {
  // Check if we have activity recognition permission
  async checkActivityRecognitionPermission() {
    // Only needed on Android
    if (Platform.OS !== 'android') {
      return true;
    }
    
    // For Android 10+ (API level 29+), we need to request the permission
    if (Platform.Version >= 29) {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
        );
        return granted;
      } catch (err) {
        console.error('Failed to check ACTIVITY_RECOGNITION permission:', err);
        return false;
      }
    } else {
      // For older Android versions, the permission is granted with the app install
      return true;
    }
  }

  // Request activity recognition permission
  async requestActivityRecognitionPermission() {
    // Only needed on Android
    if (Platform.OS !== 'android') {
      return true;
    }
    
    // For Android 10+ (API level 29+), we need to request the permission
    if (Platform.Version >= 29) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: "Activity Recognition Permission",
            message:
              "This app needs to access your physical activity to " +
              "track your steps and fitness data.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Activity recognition permission granted");
          return true;
        } else {
          console.log("Activity recognition permission denied");
          return false;
        }
      } catch (err) {
        console.error('Failed to request ACTIVITY_RECOGNITION permission:', err);
        return false;
      }
    } else {
      // For older Android versions, the permission is granted with the app install
      return true;
    }
  }
  
  // Helper method to explain permission importance and handle user denials
  async requestActivityRecognitionWithExplanation() {
    const hasPermission = await this.checkActivityRecognitionPermission();
    
    if (hasPermission) {
      return true;
    }
    
    return new Promise(resolve => {
      Alert.alert(
        "Permission Required",
        "To track your steps and fitness activity, this app needs activity recognition permission.",
        [
          { 
            text: "Cancel", 
            style: "cancel",
            onPress: () => resolve(false)
          },
          {
            text: "OK",
            onPress: async () => {
              const granted = await this.requestActivityRecognitionPermission();
              resolve(granted);
            }
          }
        ]
      );
    });
  }
}

export default new PermissionsManager();
