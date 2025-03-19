// Helper to provide fallback images for exercise types

// These URLs are from Pexels which are more reliable
const RELIABLE_IMAGES = {
  // Upper body
  "bench press": "https://images.pexels.com/photos/4162497/pexels-photo-4162497.jpeg",
  "chest press": "https://images.pexels.com/photos/4162497/pexels-photo-4162497.jpeg",
  "push up": "https://images.pexels.com/photos/4775196/pexels-photo-4775196.jpeg",
  "shoulder press": "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg",
  "lateral raise": "https://images.pexels.com/photos/4608264/pexels-photo-4608264.jpeg",
  "bicep curl": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg",
  "tricep": "https://images.pexels.com/photos/4608273/pexels-photo-4608273.jpeg",
  "row": "https://images.pexels.com/photos/3838389/pexels-photo-3838389.jpeg",
  "pull up": "https://images.pexels.com/photos/1480520/pexels-photo-1480520.jpeg",
  
  // Lower body
  "squat": "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg",
  "deadlift": "https://images.pexels.com/photos/4608148/pexels-photo-4608148.jpeg",
  "lunge": "https://images.pexels.com/photos/6922165/pexels-photo-6922165.jpeg",
  "leg press": "https://images.pexels.com/photos/6550839/pexels-photo-6550839.jpeg",
  "leg curl": "https://images.pexels.com/photos/6550851/pexels-photo-6550851.jpeg",
  
  // Default by muscle group
  "chest": "https://images.pexels.com/photos/4162497/pexels-photo-4162497.jpeg",
  "shoulder": "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg",
  "back": "https://images.pexels.com/photos/3838389/pexels-photo-3838389.jpeg",
  "bicep": "https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg",
  "tricep": "https://images.pexels.com/photos/4608273/pexels-photo-4608273.jpeg",
  "legs": "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg",
  
  // Generic default
  "default": "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg"
};

// Default image if nothing else works
const DEFAULT_IMAGE = "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg";

export const getExerciseImage = (exercise) => {
  try {
    if (!exercise || !exercise.name) {
      return DEFAULT_IMAGE;
    }
    
    const exerciseName = exercise.name.toLowerCase();
    
    // First, try exact match
    for (const key of Object.keys(RELIABLE_IMAGES)) {
      if (exerciseName === key) {
        return RELIABLE_IMAGES[key];
      }
    }
    
    // Second, try partial match
    for (const key of Object.keys(RELIABLE_IMAGES)) {
      if (exerciseName.includes(key)) {
        return RELIABLE_IMAGES[key];
      }
    }
    
    // Try to match muscle target
    if (exercise.muscleTarget) {
      const muscleTarget = exercise.muscleTarget.toLowerCase();
      for (const key of Object.keys(RELIABLE_IMAGES)) {
        if (muscleTarget.includes(key)) {
          return RELIABLE_IMAGES[key];
        }
      }
    }
    
    // Return default
    return DEFAULT_IMAGE;
  } catch (error) {
    console.error("ExerciseImageHelper Error:", error);
    return DEFAULT_IMAGE;
  }
};
