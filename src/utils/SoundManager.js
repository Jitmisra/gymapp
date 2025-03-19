import { Audio } from 'expo-av';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.isSoundEnabled = true;
  }

  async loadSounds() {
    try {
      const exerciseComplete = await Audio.Sound.createAsync(
        require('../../assets/sounds/exercise-complete.mp3')
      );
      const restStart = await Audio.Sound.createAsync(
        require('../../assets/sounds/rest-start.mp3')
      );
      const count = await Audio.Sound.createAsync(
        require('../../assets/sounds/count.mp3')
      );
      const workoutComplete = await Audio.Sound.createAsync(
        require('../../assets/sounds/workout-complete.mp3')
      );

      this.sounds = {
        exerciseComplete: exerciseComplete.sound,
        restStart: restStart.sound,
        count: count.sound,
        workoutComplete: workoutComplete.sound
      };
    } catch (error) {
      console.log('Error loading sounds:', error);
    }
  }

  async playSound(soundName) {
    if (!this.isSoundEnabled) return;
    
    try {
      const soundToPlay = this.sounds[soundName];
      if (soundToPlay) {
        await soundToPlay.stopAsync();
        await soundToPlay.setPositionAsync(0);
        await soundToPlay.playAsync();
      }
    } catch (error) {
      console.log(`Error playing sound ${soundName}:`, error);
    }
  }

  enableSound(isEnabled) {
    this.isSoundEnabled = isEnabled;
  }

  async unloadSounds() {
    try {
      for (const key in this.sounds) {
        if (this.sounds[key]) {
          await this.sounds[key].unloadAsync();
        }
      }
      this.sounds = {};
    } catch (error) {
      console.log('Error unloading sounds:', error);
    }
  }
}

export default new SoundManager();
