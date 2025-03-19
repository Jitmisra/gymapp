import { Vibration } from 'react-native';

/**
 * SafeSoundManager
 * Handles feedback with vibration only (no sound files required)
 */

class SafeSoundManager {
  constructor() {
    this.isInitialized = true;
    this.vibrationEnabled = true;
  }

  // Initialize - simplified as we don't need sound initialization
  async initialize() {
    return true;
  }
  
  // Play feedback with vibration
  async playFeedback(feedbackType) {
    if (!this.vibrationEnabled) return;
    
    try {
      // Define vibration patterns for different feedback types
      const patterns = {
        completion: [100, 100, 100, 100, 300], // Longer pattern for completion
        rest: [300],                          // Medium vibration for rest
        count: [100]                          // Short vibration for count
      };
      
      const pattern = patterns[feedbackType] || [100];
      Vibration.vibrate(pattern);
    } catch (error) {
      console.warn(`Error with vibration feedback:`, error);
    }
  }

  // Specific feedback methods - keep API unchanged
  async playCompletionSound() {
    await this.playFeedback('completion');
  }
  
  async playRestSound() {
    await this.playFeedback('rest');
  }
  
  async playCountSound() {
    await this.playFeedback('count');
  }
  
  // Enable/disable vibration
  setVibrationEnabled(enabled) {
    this.vibrationEnabled = enabled;
  }
}

// Create and export a singleton instance
export default new SafeSoundManager();
