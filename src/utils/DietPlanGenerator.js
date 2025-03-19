/**
 * Diet Plan Generator Utility
 * This utility generates personalized diet plans based on user preferences and health metrics.
 */

// Food database with nutritional values per 100g unless specified
const FOODS_DATABASE = {
  protein: [
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: '100g', categories: ['meat'] },
    { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, portion: '100g', categories: ['fish', 'seafood'] },
    { name: 'Lean Beef', calories: 250, protein: 26, carbs: 0, fat: 15, portion: '100g', categories: ['meat', 'red meat'] },
    { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, portion: '100g', categories: ['dairy'] },
    { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: '2 eggs', categories: ['eggs'] },
    { name: 'Tofu', calories: 144, protein: 17, carbs: 3, fat: 8, portion: '100g', categories: ['vegetarian', 'vegan', 'soy'] },
    { name: 'Tempeh', calories: 193, protein: 19, carbs: 9, fat: 11, portion: '100g', categories: ['vegetarian', 'vegan', 'soy'] },
    { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, portion: '100g', categories: ['dairy'] },
    { name: 'Turkey Breast', calories: 104, protein: 24, carbs: 0, fat: 1, portion: '100g', categories: ['meat'] },
    { name: 'Tuna', calories: 116, protein: 26, carbs: 0, fat: 1, portion: '100g', categories: ['fish', 'seafood'] },
    { name: 'Whey Protein', calories: 113, protein: 25, carbs: 1, fat: 1.5, portion: '1 scoop', categories: ['supplements', 'dairy'] },
    { name: 'Lentils', calories: 116, protein: 9, carbs: 20, fat: 0.4, portion: '100g', categories: ['vegetarian', 'vegan', 'legumes'] },
    
    // Add Indian protein sources
    { name: 'Paneer', calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, portion: '100g', categories: ['vegetarian', 'indian', 'dairy'] },
    { name: 'Chicken Tikka', calories: 165, protein: 25, carbs: 2, fat: 7, portion: '100g', categories: ['meat', 'indian'] },
    { name: 'Dal Makhani', calories: 140, protein: 9, carbs: 12, fat: 7, portion: '100g', categories: ['vegetarian', 'indian', 'legumes'] },
    { name: 'Chana Masala', calories: 160, protein: 8, carbs: 22, fat: 5, portion: '100g', categories: ['vegetarian', 'vegan', 'indian', 'legumes'] },
    { name: 'Fish Curry', calories: 180, protein: 22, carbs: 5, fat: 9, portion: '100g', categories: ['fish', 'seafood', 'indian'] },
    { name: 'Masoor Dal', calories: 105, protein: 9, carbs: 19, fat: 0.4, portion: '100g', categories: ['vegetarian', 'vegan', 'indian', 'legumes'] },
  ],
  carbs: [
    { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, portion: '100g', categories: ['whole grain', 'vegan', 'vegetarian'] },
    { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, portion: '100g', categories: ['whole grain', 'vegan', 'vegetarian'] },
    { name: 'Oats', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, portion: '100g', categories: ['whole grain', 'vegan', 'vegetarian'] },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, portion: '1 medium', categories: ['fruit', 'vegan', 'vegetarian'] },
    { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fat: 3.4, portion: '2 slices', categories: ['whole grain', 'vegetarian'] },
    { name: 'White Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: '100g', categories: ['grain', 'vegan', 'vegetarian'] },
    { name: 'Pasta', calories: 131, protein: 5, carbs: 25, fat: 1.1, portion: '100g', categories: ['grain', 'vegetarian'] },
    { name: 'Apple', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, portion: '1 medium', categories: ['fruit', 'vegan', 'vegetarian'] },
    { name: 'Chickpeas', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, portion: '100g', categories: ['legume', 'vegan', 'vegetarian'] },
    
    // Add Indian carb sources
    { name: 'Basmati Rice', calories: 121, protein: 2.7, carbs: 25.2, fat: 0.3, portion: '100g', categories: ['grain', 'indian', 'vegetarian', 'vegan'] },
    { name: 'Chapati', calories: 120, protein: 3, carbs: 18, fat: 3.7, portion: '1 medium', categories: ['grain', 'indian', 'vegetarian', 'vegan'] },
    { name: 'Dosa', calories: 162, protein: 3.4, carbs: 27, fat: 5, portion: '1 medium', categories: ['grain', 'indian', 'vegetarian', 'fermented'] },
    { name: 'Idli', calories: 78, protein: 2.1, carbs: 16.5, fat: 0.1, portion: '2 pieces', categories: ['grain', 'indian', 'vegetarian', 'fermented'] },
    { name: 'Paratha', calories: 260, protein: 6.4, carbs: 33, fat: 12, portion: '1 medium', categories: ['grain', 'indian', 'vegetarian'] },
    { name: 'Brown Rice Khichdi', calories: 130, protein: 5, carbs: 25, fat: 2, portion: '100g', categories: ['grain', 'indian', 'vegetarian', 'whole grain'] },
  ],
  fats: [
    { name: 'Avocado', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, portion: '1/2 avocado', categories: ['fruit', 'vegan', 'vegetarian'] },
    { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 49.9, portion: '1/4 cup', categories: ['nuts', 'vegan', 'vegetarian'] },
    { name: 'Olive Oil', calories: 119, protein: 0, carbs: 0, fat: 13.5, portion: '1 tbsp', categories: ['oil', 'vegan', 'vegetarian'] },
    { name: 'Chia Seeds', calories: 486, protein: 16.5, carbs: 42, fat: 30.7, portion: '2 tbsp', categories: ['seeds', 'vegan', 'vegetarian'] },
    { name: 'Walnuts', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, portion: '1/4 cup', categories: ['nuts', 'vegan', 'vegetarian'] },
    { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, portion: '2 tbsp', categories: ['nuts', 'vegetarian'] },
    { name: 'Coconut Oil', calories: 120, protein: 0, carbs: 0, fat: 14, portion: '1 tbsp', categories: ['oil', 'vegan', 'vegetarian'] },
    { name: 'Flaxseeds', calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, portion: '2 tbsp', categories: ['seeds', 'vegan', 'vegetarian'] },
    
    // Add Indian fat sources
    { name: 'Coconut Chutney', calories: 124, protein: 2, carbs: 4, fat: 12, portion: '2 tbsp', categories: ['indian', 'vegetarian', 'condiment'] },
    { name: 'Ghee', calories: 112, protein: 0, carbs: 0, fat: 12.5, portion: '1 tbsp', categories: ['dairy', 'indian', 'vegetarian', 'oil'] },
    { name: 'Mustard Oil', calories: 124, protein: 0, carbs: 0, fat: 14, portion: '1 tbsp', categories: ['oil', 'indian', 'vegetarian', 'vegan'] },
    { name: 'Raita', calories: 59, protein: 2.5, carbs: 3.1, fat: 4, portion: '100g', categories: ['dairy', 'indian', 'vegetarian', 'condiment'] },
  ],
  vegetables: [
    { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    { name: 'Kale', calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    { name: 'Bell Peppers', calories: 31, protein: 1, carbs: 6, fat: 0.3, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    { name: 'Cauliflower', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    { name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    { name: 'Carrots', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    { name: 'Tomatoes', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    { name: 'Green Beans', calories: 31, protein: 1.8, carbs: 7, fat: 0.1, portion: '100g', categories: ['vegetable', 'vegan', 'vegetarian'] },
    
    // Add Indian vegetables
    { name: 'Bitter Gourd (Karela)', calories: 17, protein: 1, carbs: 3.7, fat: 0.2, portion: '100g', categories: ['vegetable', 'indian', 'vegan', 'vegetarian'] },
    { name: 'Okra (Bhindi)', calories: 33, protein: 1.9, carbs: 7.5, fat: 0.2, portion: '100g', categories: ['vegetable', 'indian', 'vegan', 'vegetarian'] },
    { name: 'Bottle Gourd (Lauki)', calories: 15, protein: 0.6, carbs: 3.4, fat: 0.1, portion: '100g', categories: ['vegetable', 'indian', 'vegan', 'vegetarian'] },
    { name: 'Eggplant (Baingan)', calories: 25, protein: 1, carbs: 6, fat: 0.2, portion: '100g', categories: ['vegetable', 'indian', 'vegan', 'vegetarian'] },
    { name: 'Fenugreek Leaves (Methi)', calories: 49, protein: 4.4, carbs: 6, fat: 0.9, portion: '100g', categories: ['vegetable', 'greens', 'indian', 'vegan', 'vegetarian'] },
    { name: 'Cabbage Sabzi', calories: 45, protein: 1.9, carbs: 10, fat: 0.2, portion: '100g', categories: ['vegetable', 'indian', 'vegan', 'vegetarian', 'cooked'] },
    { name: 'Palak Paneer', calories: 180, protein: 11, carbs: 6, fat: 14, portion: '100g', categories: ['vegetable', 'indian', 'vegetarian', 'cooked', 'dairy'] },
  ],
  
  // Add a new category for Indian spices and condiments
  spices: [
    { name: 'Turmeric', calories: 29, protein: 0.9, carbs: 6.3, fat: 0.3, portion: '1 tsp', categories: ['spice', 'indian', 'vegan', 'vegetarian', 'anti-inflammatory'] },
    { name: 'Cumin', calories: 22, protein: 1.1, carbs: 2.6, fat: 0.9, portion: '1 tsp', categories: ['spice', 'indian', 'vegan', 'vegetarian'] },
    { name: 'Coriander', calories: 15, protein: 0.7, carbs: 2.7, fat: 0.3, portion: '1 tsp', categories: ['spice', 'indian', 'vegan', 'vegetarian'] },
    { name: 'Mint Chutney', calories: 15, protein: 0.5, carbs: 2.6, fat: 0.3, portion: '1 tbsp', categories: ['condiment', 'indian', 'vegan', 'vegetarian'] }
  ],
  
  // Add a new category for Indian complete dishes
  indianDishes: [
    { name: 'Vegetable Biryani', calories: 241, protein: 5, carbs: 45, fat: 5, portion: '1 cup', categories: ['grain', 'rice', 'indian', 'vegetarian', 'complete meal'] },
    { name: 'Rajma Chawal', calories: 280, protein: 12, carbs: 50, fat: 3, portion: '1 cup', categories: ['legumes', 'rice', 'indian', 'vegetarian', 'complete meal'] },
    { name: 'Egg Curry with Rice', calories: 320, protein: 15, carbs: 45, fat: 7, portion: '1 serving', categories: ['eggs', 'rice', 'indian', 'vegetarian', 'complete meal'] },
    { name: 'Butter Chicken with Naan', calories: 550, protein: 32, carbs: 45, fat: 25, portion: '1 serving', categories: ['meat', 'indian', 'complete meal'] },
    { name: 'Thali (Veg)', calories: 600, protein: 20, carbs: 90, fat: 15, portion: '1 plate', categories: ['indian', 'vegetarian', 'complete meal', 'varied'] }
  ]
};

// Diet plan templates by goal
const DIET_TEMPLATES = {
  'weight-loss': {
    name: "Weight Loss Plan",
    description: "A calorie-controlled plan focused on creating a sustainable deficit",
    macroRatio: { protein: 0.40, carbs: 0.30, fat: 0.30 } // higher protein for satiety
  },
  'muscle-gain': {
    name: "Muscle Building Plan",
    description: "High protein, moderate carb plan to fuel muscle growth",
    macroRatio: { protein: 0.35, carbs: 0.45, fat: 0.20 } // higher carbs for energy
  },
  'maintenance': {
    name: "Balanced Maintenance Plan",
    description: "Well-rounded nutrition to maintain your current physique",
    macroRatio: { protein: 0.30, carbs: 0.40, fat: 0.30 } // balanced approach
  },
  'health': {
    name: "General Health Plan",
    description: "Nutrient-dense foods to support overall wellbeing",
    macroRatio: { protein: 0.25, carbs: 0.45, fat: 0.30 } // emphasis on whole foods
  },
  
  // Add Indian diet plan templates
  'indian-balanced': {
    name: "Indian Balanced Diet Plan",
    description: "Traditional Indian diet with balanced macronutrients and plenty of spices",
    macroRatio: { protein: 0.25, carbs: 0.55, fat: 0.20 },
    preferredCategories: ['indian']
  },
  'indian-weight-loss': {
    name: "Indian Weight Loss Plan",
    description: "Lower calorie Indian dishes with focus on protein and vegetables",
    macroRatio: { protein: 0.35, carbs: 0.40, fat: 0.25 },
    preferredCategories: ['indian']
  }
};

// Nutrition tips by goal
const NUTRITION_TIPS = {
  'weight-loss': [
    "Focus on protein at every meal to maintain muscle and increase satiety.",
    "Fill half your plate with non-starchy vegetables to increase volume without adding many calories.",
    "Stay hydrated—sometimes thirst can be mistaken for hunger.",
    "Plan meals ahead to avoid impulsive high-calorie choices.",
    "Consider intermittent fasting approaches if they fit your lifestyle."
  ],
  'muscle-gain': [
    "Consume protein within 30 minutes after your workout to support muscle recovery.",
    "Don't fear carbohydrates—they fuel your workouts and support muscle growth.",
    "Aim for a slight calorie surplus of 300-500 calories above maintenance.",
    "Consider splitting your protein intake evenly throughout the day.",
    "Quality sleep is essential for muscle growth and recovery."
  ],
  'maintenance': [
    "Practice mindful eating to better recognize hunger and fullness signals.",
    "Maintain a consistent meal schedule to help regulate metabolism.",
    "Include a variety of foods to ensure you get a wide range of nutrients.",
    "Balance is key—don't completely eliminate foods you enjoy.",
    "Adjust your intake based on activity level each day."
  ],
  'health': [
    "Include a rainbow of vegetables and fruits to get diverse phytonutrients.",
    "Focus on whole, minimally processed foods most of the time.",
    "Include omega-3 rich foods for heart and brain health.",
    "Fiber from whole grains, vegetables and fruits supports gut health.",
    "Moderate your intake of added sugars, salt, and highly processed foods."
  ],
  
  // Add Indian-specific tips
  'indian-balanced': [
    "Incorporate a variety of dals (lentils) for complete protein.",
    "Use smaller portions of rice and more vegetables in your meals.",
    "Choose whole grain options like brown rice or whole wheat chapati.",
    "Include curd (yogurt) daily for probiotics and protein.",
    "Utilize Indian spices like turmeric, cumin and coriander which have health benefits.",
    "Limit deep-fried snacks like pakoras and samosas to occasional treats."
  ],
  'indian-weight-loss': [
    "Replace rice with cauliflower rice or reduce portions.",
    "Choose tandoori or grilled preparations over curries with heavy gravies.",
    "Use yogurt-based marinades instead of cream-based ones.",
    "Include protein-rich sprouts and dals in every meal.",
    "Prepare dishes with minimal oil using non-stick cookware.",
    "Choose roti or chapati over paratha or naan to reduce fat intake."
  ]
};

// Diet type modifiers
const DIET_TYPE_MODIFIERS = {
  'balanced': {
    description: "Includes all food groups in moderate proportions",
    excludedCategories: []
  },
  'high-protein': {
    description: "Emphasizes protein-rich foods",
    macroAdjustment: { protein: 0.10, carbs: -0.10, fat: 0 }
  },
  'low-carb': {
    description: "Reduces carbohydrate intake, emphasizes protein and healthy fats",
    macroAdjustment: { protein: 0.05, carbs: -0.15, fat: 0.10 }
  },
  'vegetarian': {
    description: "Excludes meat but includes dairy and eggs",
    excludedCategories: ['meat', 'fish', 'seafood']
  },
  'vegan': {
    description: "Exclusively plant-based foods",
    excludedCategories: ['meat', 'fish', 'seafood', 'dairy', 'eggs']
  },
  'keto': {
    description: "Very low carb, high fat, moderate protein",
    macroAdjustment: { protein: 0, carbs: -0.35, fat: 0.35 }
  },
  
  // Add Indian diet type modifiers
  'indian-vegetarian': {
    description: "Traditional Indian vegetarian diet",
    excludedCategories: ['meat', 'fish', 'seafood'],
    preferredCategories: ['indian', 'vegetarian']
  },
  'south-indian': {
    description: "South Indian cuisine focusing on rice, fermented foods and coconut",
    preferredCategories: ['indian', 'fermented'],
    preferredFoods: ['Idli', 'Dosa', 'Coconut Chutney', 'Sambar']
  },
  'north-indian': {
    description: "North Indian cuisine with emphasis on wheat, dairy and vegetables",
    preferredCategories: ['indian'],
    preferredFoods: ['Chapati', 'Paneer', 'Dal Makhani', 'Rajma Chawal']
  }
};

// Function to create standard meal names based on meal count
const getMealNames = (mealCount) => {
  if (mealCount === 3) return ["Breakfast", "Lunch", "Dinner"];
  if (mealCount === 4) return ["Breakfast", "Lunch", "Afternoon Snack", "Dinner"];
  if (mealCount === 5) return ["Breakfast", "Morning Snack", "Lunch", "Afternoon Snack", "Dinner"];
  if (mealCount === 6) return ["Breakfast", "Morning Snack", "Lunch", "Afternoon Snack", "Dinner", "Evening Snack"];
  
  // Default fallback
  return Array(mealCount).fill().map((_, i) => `Meal ${i+1}`);
};

// Helper function to check if diet type is Indian
const isIndianDietType = (dietType) => {
  return dietType && (
    dietType.includes('indian') || 
    dietType === 'south-indian' || 
    dietType === 'north-indian'
  );
};

// Function to get appropriate food categories based on diet type and meal
const getAppropriateFood = (mealIndex, availableFoods, dietType, mealCount) => {
  // For main meals like breakfast, lunch, and dinner
  const isMainMeal = mealIndex === 0 || mealIndex === Math.floor(mealCount/2) || mealIndex === mealCount-1;
  
  // If Indian diet, try to get Indian foods first
  if (isIndianDietType(dietType)) {
    const indianFoods = availableFoods.filter(food => 
      food.categories && food.categories.includes('indian')
    );
    
    // If we have Indian foods, prioritize them
    if (indianFoods.length > 0) {
      return getRandomItems(indianFoods, isMainMeal ? 2 : 1);
    }
  }
  
  // Otherwise use regular foods
  return getRandomItems(availableFoods, isMainMeal ? 1 : (mealIndex % 2 === 0 ? 1 : 0));
};

// Random selection helper function
const getRandomItems = (array, count) => {
  if (!array || array.length === 0 || count <= 0) return [];
  
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Function to filter foods based on restrictions
const filterFoodsByRestrictions = (foods, restrictions) => {
  if (!restrictions || restrictions.length === 0) return foods;
  
  return foods.filter(food => {
    if (!food.categories) return true;
    // Check if food contains any restricted category
    for (const restriction of restrictions) {
      if (food.categories.includes(restriction)) {
        return false;
      }
    }
    return true;
  });
};

// Main function to generate a diet plan
export const generateDietPlan = async (userDetails) => {
  try {
    // 1. Calculate base calories and macros
    const { 
      gender, weight, height, age, 
      dietGoal, dietType, mealCount, 
      restrictions, calorieLimit 
    } = userDetails;
    
    // Get base template for the selected goal
    const template = DIET_TEMPLATES[dietGoal] || DIET_TEMPLATES['maintenance'];
    let macroRatio = { ...template.macroRatio };
    
    // Apply diet type modifiers to macro ratios if applicable
    const typeModifier = DIET_TYPE_MODIFIERS[dietType];
    if (typeModifier && typeModifier.macroAdjustment) {
      macroRatio.protein += typeModifier.macroAdjustment.protein || 0;
      macroRatio.carbs += typeModifier.macroAdjustment.carbs || 0;
      macroRatio.fat += typeModifier.macroAdjustment.fat || 0;
    }
    
    // Ensure ratios total to 1.0
    const totalRatio = macroRatio.protein + macroRatio.carbs + macroRatio.fat;
    if (totalRatio !== 1) {
      const adjustmentFactor = 1 / totalRatio;
      macroRatio.protein *= adjustmentFactor;
      macroRatio.carbs *= adjustmentFactor;
      macroRatio.fat *= adjustmentFactor;
    }
    
    // Calculate daily macros based on calories
    const dailyProtein = Math.round((calorieLimit * macroRatio.protein) / 4); // 4 cal per gram
    const dailyCarbs = Math.round((calorieLimit * macroRatio.carbs) / 4);     // 4 cal per gram
    const dailyFat = Math.round((calorieLimit * macroRatio.fat) / 9);         // 9 cal per gram
    
    // 2. Filter foods based on diet type and restrictions
    let combinedRestrictions = [...(restrictions || [])];
    
    // Add diet-specific restrictions
    if (typeModifier && typeModifier.excludedCategories) {
      combinedRestrictions = [...combinedRestrictions, ...typeModifier.excludedCategories];
    }
    
    const availableProtein = filterFoodsByRestrictions(FOODS_DATABASE.protein, combinedRestrictions);
    const availableCarbs = filterFoodsByRestrictions(FOODS_DATABASE.carbs, combinedRestrictions);
    const availableFats = filterFoodsByRestrictions(FOODS_DATABASE.fats, combinedRestrictions);
    const availableVegetables = filterFoodsByRestrictions(FOODS_DATABASE.vegetables, combinedRestrictions);
    const availableSpices = filterFoodsByRestrictions(FOODS_DATABASE.spices, combinedRestrictions);
    
    // Add Indian dishes if appropriate
    const availableIndianDishes = isIndianDietType(dietType) ? 
      filterFoodsByRestrictions(FOODS_DATABASE.indianDishes, combinedRestrictions) : 
      [];
    
    // 3. Create meal structure based on meal count
    const mealNames = getMealNames(mealCount);
    const meals = [];
    
    // Distribute calories across meals
    // Breakfast: 25%, Lunch: 30%, Dinner: 30%, Snacks: 15% (distributed)
    let mealCalorieDistribution;
    
    if (mealCount === 3) {
      mealCalorieDistribution = [0.3, 0.35, 0.35]; // breakfast, lunch, dinner
    } else if (mealCount === 4) {
      mealCalorieDistribution = [0.25, 0.35, 0.15, 0.25]; // adding afternoon snack
    } else if (mealCount === 5) {
      mealCalorieDistribution = [0.25, 0.1, 0.3, 0.1, 0.25]; // morning snack + afternoon snack
    } else if (mealCount === 6) {
      mealCalorieDistribution = [0.2, 0.1, 0.3, 0.1, 0.2, 0.1]; // evening snack added
    } else {
      // Default equal distribution
      mealCalorieDistribution = Array(mealCount).fill(1/mealCount);
    }
    
    // 4. Generate each meal
    for (let i = 0; i < mealCount; i++) {
      const mealCalories = Math.round(calorieLimit * mealCalorieDistribution[i]);
      const mealProtein = Math.round(dailyProtein * mealCalorieDistribution[i]);
      const mealCarbs = Math.round(dailyCarbs * mealCalorieDistribution[i]);
      const mealFat = Math.round(dailyFat * mealCalorieDistribution[i]);
      
      // Select foods for this meal based on macro targets
      let mealFoods = [];
      
      // For Indian diet types, try using complete dishes for main meals
      if (isIndianDietType(dietType) && (i === 0 || i === Math.floor(mealCount/2) || i === mealCount-1) && availableIndianDishes.length > 0) {
        // Use complete Indian dishes for main meals (breakfast, lunch, dinner)
        const indianDish = getRandomItems(availableIndianDishes, 1);
        mealFoods.push(...indianDish);
        
        // Add a vegetable side
        if (availableVegetables.length > 0) {
          const veggies = availableVegetables.filter(veg => 
            veg.categories && veg.categories.includes('indian')
          );
          if (veggies.length > 0) {
            mealFoods.push(...getRandomItems(veggies, 1));
          } else {
            mealFoods.push(...getRandomItems(availableVegetables, 1));
          }
        }
        
        // Add a spice/condiment
        if (availableSpices.length > 0) {
          mealFoods.push(...getRandomItems(availableSpices, 1));
        }
      } else {
        // Standard meal building approach
        
        // Select protein sources
        if (availableProtein.length > 0) {
          const proteinCount = i === 0 || i === Math.floor(mealCount/2) || i === mealCount-1 ? 1 : 0; // Main meals get protein
          const proteins = getAppropriateFood(i, availableProtein, dietType, mealCount);
          mealFoods.push(...proteins);
        }
        
        // Select carb sources
        if (availableCarbs.length > 0) {
          const carbs = getAppropriateFood(i, availableCarbs, dietType, mealCount);
          mealFoods.push(...carbs);
        }
        
        // Select fat sources (primarily for main meals)
        if (availableFats.length > 0 && (i === 0 || i === Math.floor(mealCount/2) || i === mealCount-1)) {
          const fats = getAppropriateFood(i, availableFats, dietType, mealCount);
          mealFoods.push(...fats);
        }
        
        // Always add vegetables to main meals
        if (availableVegetables.length > 0 && (i === 0 || i === Math.floor(mealCount/2) || i === mealCount-1)) {
          const vegetables = getAppropriateFood(i, availableVegetables, dietType, mealCount);
          mealFoods.push(...vegetables);
        }
        
        // Add spices for Indian diets
        if (isIndianDietType(dietType) && availableSpices.length > 0 && 
            (i === 0 || i === Math.floor(mealCount/2) || i === mealCount-1)) {
          mealFoods.push(...getRandomItems(availableSpices, 1));
        }
      }
      
      // Ensure we have at least one food item per meal
      if (mealFoods.length === 0) {
        // Use any available food as a fallback
        const allFoods = [
          ...availableProtein, 
          ...availableCarbs, 
          ...availableFats, 
          ...availableVegetables
        ];
        if (allFoods.length > 0) {
          mealFoods.push(allFoods[Math.floor(Math.random() * allFoods.length)]);
        }
      }
      
      meals.push({
        name: mealNames[i],
        calories: mealCalories,
        protein: mealProtein,
        carbs: mealCarbs,
        fat: mealFat,
        foods: mealFoods,
      });
    }
    
    // 5. Compile the final diet plan
    const dietPlan = {
      name: isIndianDietType(dietType) ? 
        `Indian ${template.name}` : 
        template.name,
      description: template.description,
      dietGoal,
      dietType,
      totalCalories: calorieLimit,
      macros: {
        protein: dailyProtein,
        carbs: dailyCarbs,
        fat: dailyFat
      },
      meals,
      tips: isIndianDietType(dietType) ?
        (NUTRITION_TIPS[`indian-${dietGoal}`] || NUTRITION_TIPS[dietGoal] || NUTRITION_TIPS['health']) :
        (NUTRITION_TIPS[dietGoal] || NUTRITION_TIPS['health'])
    };
    
    // Add cuisine type for Indian diets
    if (isIndianDietType(dietType)) {
      dietPlan.cuisineType = dietType === 'south-indian' ? 
        "South Indian" : 
        (dietType === 'north-indian' ? "North Indian" : "Indian");
    }
    
    return dietPlan;
  } catch (error) {
    console.error('Error generating diet plan:', error);
    throw new Error('Failed to generate diet plan');
  }
};
