// AI Recommended Workout
export const aiRecommendedWorkout = {
  id: 4,
  title: 'Personalized Strength Builder',
  description: 'AI-generated workout based on your activity and fitness goals',
  duration: '35 min',
  level: 'Intermediate',
  calories: 330,
  image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a',
  exercises: [
    {
      id: 1,
      name: 'Push-ups',
      sets: 3,
      reps: '12',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Chest, Shoulders, Triceps',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/4775196/pexels-photo-4775196.jpeg'
    },
    {
      id: 2,
      name: 'Bodyweight Squats',
      sets: 4,
      reps: '10',
      weight: 'Bodyweight',
      rest: 60,
      muscleTarget: 'Quads, Hamstrings, Glutes',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/4498605/pexels-photo-4498605.jpeg'
    },
    {
      id: 3,
      name: 'Plank',
      sets: 3,
      reps: '45 seconds',
      weight: 'Bodyweight',
      rest: 30,
      muscleTarget: 'Core, Shoulders',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/6456300/pexels-photo-6456300.jpeg'
    },
    {
      id: 4,
      name: 'Dumbbell Rows',
      sets: 3,
      reps: '10 per side',
      weight: 'Medium',
      rest: 45,
      muscleTarget: 'Back, Biceps',
      equipment: 'Dumbbells',
      image: 'https://images.pexels.com/photos/4793238/pexels-photo-4793238.jpeg'
    },
    {
      id: 5,
      name: 'Lateral Raises',
      sets: 3,
      reps: '12',
      weight: 'Light',
      rest: 40,
      muscleTarget: 'Shoulders',
      equipment: 'Dumbbells',
      image: 'https://images.pexels.com/photos/4162582/pexels-photo-4162582.jpeg'
    }
  ]
};

// Second AI Recommended Workout
export const aiRecommendedWorkout2 = {
  id: 5,
  title: 'Core Challenge',
  description: 'AI-generated core-focused workout to strengthen your midsection',
  duration: '30 min',
  level: 'Intermediate',
  calories: 280,
  image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
  exercises: [
    {
      id: 1,
      name: 'Crunches',
      sets: 3,
      reps: '15',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Abs',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/4775171/pexels-photo-4775171.jpeg'
    },
    {
      id: 2,
      name: 'Plank',
      sets: 3,
      reps: '60 seconds',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Core',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/6456300/pexels-photo-6456300.jpeg'
    },
    {
      id: 3,
      name: 'Leg Raises',
      sets: 3,
      reps: '12',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Lower Abs',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/4803665/pexels-photo-4803665.jpeg'
    },
    {
      id: 4,
      name: 'Russian Twists',
      sets: 3,
      reps: '16 total',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Obliques',
      equipment: 'Optional: Dumbbell or plate',
      image: 'https://images.pexels.com/photos/4384679/pexels-photo-4384679.jpeg'
    },
    {
      id: 5,
      name: 'Mountain Climbers',
      sets: 3,
      reps: '20 per side',
      weight: 'Bodyweight',
      rest: 45,
      muscleTarget: 'Core, Cardio',
      equipment: 'None',
      image: 'https://images.pexels.com/photos/6456199/pexels-photo-6456199.jpeg'
    }
  ]
};

// Regular Workout Plans
export const workoutPlans = [
  {
    id: 1,
    title: 'Upper Body Focus',
    description: 'A comprehensive workout targeting chest, shoulders, arms and back',
    duration: '45 min',
    level: 'Intermediate',
    calories: 350,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
    exercises: [
      {
        id: 1,
        name: 'Bench Press',
        sets: 4,
        reps: '10-12',
        weight: '70% 1RM',
        rest: 60,
        muscleTarget: 'Chest',
        equipment: 'Barbell & Bench',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b'
      },
      {
        id: 2,
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        reps: '12-15',
        weight: 'Medium',
        rest: 45,
        muscleTarget: 'Shoulders',
        equipment: 'Dumbbells',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61'
      },
      {
        id: 3,
        name: 'Cable Rows',
        sets: 3,
        reps: '12',
        weight: 'Medium-Heavy',
        rest: 60,
        muscleTarget: 'Back',
        equipment: 'Cable Machine',
        image: 'https://images.unsplash.com/photo-1598575344693-2deeac70e258'
      },
      {
        id: 4,
        name: 'Bicep Curls',
        sets: 3,
        reps: '12-15',
        weight: 'Light-Medium',
        rest: 45,
        muscleTarget: 'Biceps',
        equipment: 'Dumbbells or Barbell',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e'
      },
      {
        id: 5,
        name: 'Tricep Pushdowns',
        sets: 3,
        reps: '15',
        weight: 'Light-Medium',
        rest: 45,
        muscleTarget: 'Triceps',
        equipment: 'Cable Machine',
        image: 'https://images.unsplash.com/photo-1598971639058-c762c4c0e8cb'
      }
    ]
  },
  {
    id: 2,
    title: 'Leg Day',
    description: 'Build lower body strength and power with this comprehensive leg workout',
    duration: '40 min',
    level: 'Advanced',
    calories: 400,
    image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d',
    exercises: [
      {
        id: 1,
        name: 'Barbell Squats',
        sets: 4,
        reps: '8-10',
        weight: '75% 1RM',
        rest: 90,
        muscleTarget: 'Quads, Glutes',
        equipment: 'Barbell & Squat Rack',
        image: 'https://images.unsplash.com/photo-1566241142889-7e9dc339c9f8'
      },
      {
        id: 2,
        name: 'Romanian Deadlifts',
        sets: 3,
        reps: '10-12',
        weight: 'Medium-Heavy',
        rest: 75,
        muscleTarget: 'Hamstrings, Lower Back',
        equipment: 'Barbell',
        image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2'
      },
      {
        id: 3,
        name: 'Walking Lunges',
        sets: 3,
        reps: '12 per leg',
        weight: 'Medium',
        rest: 60,
        muscleTarget: 'Quads, Glutes',
        equipment: 'Dumbbells',
        image: 'https://images.pexels.com/photos/6922165/pexels-photo-6922165.jpeg'
      },
      {
        id: 4,
        name: 'Leg Press',
        sets: 3,
        reps: '12-15',
        weight: 'Heavy',
        rest: 60,
        muscleTarget: 'Quads, Hamstrings',
        equipment: 'Leg Press Machine',
        image: 'https://images.pexels.com/photos/6550839/pexels-photo-6550839.jpeg'
      },
      {
        id: 5,
        name: 'Lying Leg Curls',
        sets: 3,
        reps: '12-15',
        weight: 'Medium',
        rest: 60,
        muscleTarget: 'Hamstrings',
        equipment: 'Leg Curl Machine',
        image: 'https://images.pexels.com/photos/6550851/pexels-photo-6550851.jpeg'
      },
      {
        id: 6,
        name: 'Standing Calf Raises',
        sets: 4,
        reps: '15-20',
        weight: 'Medium-Heavy',
        rest: 45,
        muscleTarget: 'Calves',
        equipment: 'Calf Raise Machine or Step',
        image: 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg'
      }
    ]
  },
  {
    id: 3,
    title: 'Full Body Toning',
    description: 'A balanced workout targeting all major muscle groups for complete body conditioning',
    duration: '50 min',
    level: 'Beginner',
    calories: 320,
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2',
    exercises: [
      {
        id: 1,
        name: 'Goblet Squats',
        sets: 3,
        reps: '12-15',
        weight: 'Medium',
        rest: 45,
        muscleTarget: 'Legs, Core',
        equipment: 'Kettlebell or Dumbbell',
        image: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg'
      },
      {
        id: 2,
        name: 'Push-ups',
        sets: 3,
        reps: '10-12',
        weight: 'Bodyweight',
        rest: 45,
        muscleTarget: 'Chest, Shoulders, Triceps',
        equipment: 'None',
        image: 'https://images.pexels.com/photos/4775196/pexels-photo-4775196.jpeg'
      },
      {
        id: 3,
        name: 'Dumbbell Rows',
        sets: 3,
        reps: '12 per side',
        weight: 'Medium',
        rest: 45,
        muscleTarget: 'Back, Biceps',
        equipment: 'Dumbbells, Bench',
        image: 'https://images.pexels.com/photos/3838389/pexels-photo-3838389.jpeg'
      },
      {
        id: 4,
        name: 'Shoulder Press',
        sets: 3,
        reps: '10-12',
        weight: 'Light-Medium',
        rest: 45,
        muscleTarget: 'Shoulders',
        equipment: 'Dumbbells',
        image: 'https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg'
      },
      {
        id: 5,
        name: 'Glute Bridges',
        sets: 3,
        reps: '15-20',
        weight: 'Bodyweight/Light',
        rest: 30,
        muscleTarget: 'Glutes, Hamstrings',
        equipment: 'Optional: Dumbbell or Plate',
        image: 'https://images.pexels.com/photos/6551136/pexels-photo-6551136.jpeg'
      },
      {
        id: 6,
        name: 'Bicycle Crunches',
        sets: 3,
        reps: '20 total',
        weight: 'Bodyweight',
        rest: 30,
        muscleTarget: 'Core, Obliques',
        equipment: 'None',
        image: 'https://images.pexels.com/photos/6456304/pexels-photo-6456304.jpeg'
      },
      {
        id: 7,
        name: 'Bicep Curls',
        sets: 3,
        reps: '12-15',
        weight: 'Light',
        rest: 30,
        muscleTarget: 'Biceps',
        equipment: 'Dumbbells',
        image: 'https://images.pexels.com/photos/4164761/pexels-photo-4164761.jpeg'
      },
      {
        id: 8,
        name: 'Tricep Dips',
        sets: 3,
        reps: '12-15',
        weight: 'Bodyweight',
        rest: 30,
        muscleTarget: 'Triceps',
        equipment: 'Bench or Chair',
        image: 'https://images.pexels.com/photos/4608273/pexels-photo-4608273.jpeg'
      }
    ]
  },
];
