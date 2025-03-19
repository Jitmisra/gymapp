import React, { useState, useContext, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { generateDietPlan } from '../utils/DietPlanGenerator';

const dietGoalOptions = [
  { id: 'weight-loss', label: 'Weight Loss', icon: 'scale-bathroom', color: '#FF6B6B' },
  { id: 'muscle-gain', label: 'Muscle Gain', icon: 'arm-flex', color: '#4A6FFF' },
  { id: 'maintenance', label: 'Maintenance', icon: 'clipboard-check', color: '#6BBF59' },
  { id: 'health', label: 'General Health', icon: 'heart-pulse', color: '#FFA726' },
];

const dietTypes = [
  { id: 'balanced', label: 'Balanced', description: 'Includes all food groups' },
  { id: 'high-protein', label: 'High Protein', description: 'Emphasis on protein-rich foods' },
  { id: 'low-carb', label: 'Low Carb', description: 'Reduced carbohydrate intake' },
  { id: 'vegetarian', label: 'Vegetarian', description: 'No meat but includes dairy and eggs' },
  { id: 'vegan', label: 'Vegan', description: 'Exclusively plant-based foods' },
  { id: 'keto', label: 'Ketogenic', description: 'High fat, very low carb' },
  { id: 'indian-vegetarian', label: 'Indian Vegetarian', description: 'Traditional Indian vegetarian diet' },
  { id: 'south-indian', label: 'South Indian', description: 'Rice, fermented foods and coconut based' },
  { id: 'north-indian', label: 'North Indian', description: 'Wheat, dairy and rich curries' },
];

const mealCountOptions = [3, 4, 5, 6];

// Food restrictions/allergies
const commonRestrictions = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'nuts', label: 'Nuts' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'soy', label: 'Soy' },
];

const DietPlanScreen = ({ navigation }) => {
  const { userData, bmiData, updateDietPlan } = useContext(AuthContext);
  
  // Diet preferences
  const [selectedGoal, setSelectedGoal] = useState('weight-loss');
  const [dietType, setDietType] = useState('balanced');
  const [mealCount, setMealCount] = useState(3);
  const [restrictions, setRestrictions] = useState([]);
  const [calorieLimit, setCalorieLimit] = useState('');
  
  // For custom restrictions modal
  const [showRestrictionsModal, setShowRestrictionsModal] = useState(false);
  const [customRestriction, setCustomRestriction] = useState('');
  
  // Plan generation states
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  // Set default calorie limit based on BMI data if available
  useEffect(() => {
    if (bmiData) {
      // Simple calculation based on gender, weight, height, activity level
      const baseCalories = bmiData.gender === 'male' ? 
        (10 * bmiData.weight + 6.25 * bmiData.height - 5 * bmiData.age + 5) :
        (10 * bmiData.weight + 6.25 * bmiData.height - 5 * bmiData.age - 161);
      
      // Activity level multiplier (assuming moderate)
      const activityMultiplier = 1.3; 
      
      // Default calorie goals
      const calculatedCalories = baseCalories * activityMultiplier;
      
      if (selectedGoal === 'weight-loss') {
        setCalorieLimit(Math.max(1200, Math.round(calculatedCalories * 0.8)));
      } else if (selectedGoal === 'muscle-gain') {
        setCalorieLimit(Math.round(calculatedCalories * 1.15));
      } else {
        setCalorieLimit(Math.round(calculatedCalories));
      }
    } else {
      // Fallback if no BMI data
      setCalorieLimit(selectedGoal === 'weight-loss' ? 1500 : selectedGoal === 'muscle-gain' ? 2500 : 2000);
    }
  }, [bmiData, selectedGoal]);

  const toggleRestriction = (restrictionId) => {
    if (restrictions.includes(restrictionId)) {
      setRestrictions(restrictions.filter(id => id !== restrictionId));
    } else {
      setRestrictions([...restrictions, restrictionId]);
    }
  };
  
  const addCustomRestriction = () => {
    if (customRestriction.trim()) {
      setRestrictions([...restrictions, customRestriction.trim().toLowerCase()]);
      setCustomRestriction('');
      setShowRestrictionsModal(false);
    }
  };
  
  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      // Get user details for personalized plan
      const userDetails = {
        gender: bmiData?.gender || 'unspecified',
        weight: bmiData?.weight || 70,
        height: bmiData?.height || 170,
        age: bmiData?.age || 30,
        fitnessLevel: userData?.fitnessLevel || 'beginner',
        dietGoal: selectedGoal,
        dietType: dietType,
        mealCount: mealCount,
        restrictions: restrictions,
        calorieLimit: parseInt(calorieLimit) || 2000
      };
      
      const plan = await generateDietPlan(userDetails);
      setDietPlan(plan);
      updateDietPlan(plan); // Save to context/storage
      setShowPlanModal(true);
    } catch (error) {
      console.error('Failed to generate diet plan:', error);
      alert('Failed to generate diet plan. Please try again.');
    } finally {
      setGeneratingPlan(false);
    }
  };
  
  const renderMealPlan = () => {
    if (!dietPlan) return null;
    
    return (
      <Modal
        visible={showPlanModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Custom Diet Plan</Text>
              <TouchableOpacity onPress={() => setShowPlanModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.planSummary}>
              <Text style={styles.planTitle}>{dietPlan.name}</Text>
              {dietPlan.cuisineType && (
                <View style={styles.cuisineTag}>
                  <Text style={styles.cuisineText}>{dietPlan.cuisineType} Cuisine</Text>
                </View>
              )}
              <Text style={styles.planCalories}>{dietPlan.totalCalories} calories per day</Text>
              <View style={styles.macrosContainer}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{dietPlan.macros.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{dietPlan.macros.carbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{dietPlan.macros.fat}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </View>
            
            <ScrollView style={styles.mealPlanScrollView}>
              {dietPlan.meals && dietPlan.meals.length > 0 ? dietPlan.meals.map((meal, index) => (
                <View key={index} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealTitle}>{meal.name}</Text>
                    <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                  </View>
                  {meal.foods && meal.foods.length > 0 ? (
                    <View style={styles.mealFoodsList}>
                      {meal.foods.map((food, foodIndex) => (
                        <View key={foodIndex} style={styles.foodItem}>
                          <Text style={styles.foodName}>{food.name}</Text>
                          <Text style={styles.foodPortion}>{food.portion}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noFoodsText}>No specific foods assigned</Text>
                  )}
                </View>
              )) : (
                <Text style={styles.noMealsText}>No meals generated. Please try again.</Text>
              )}
              
              <View style={styles.nutritionTips}>
                <Text style={styles.tipsTitle}>Nutrition Tips</Text>
                {dietPlan.tips && dietPlan.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="information-circle-outline" size={18} color="#4A6FFF" />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            
            <TouchableOpacity style={styles.saveButton} onPress={() => setShowPlanModal(false)}>
              <Text style={styles.saveButtonText}>Save Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Diet Plan</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diet Goal</Text>
          <View style={styles.goalOptionsContainer}>
            {dietGoalOptions.map(goal => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalOption,
                  selectedGoal === goal.id && { borderColor: goal.color, borderWidth: 2, backgroundColor: goal.color + '10' }
                ]}
                onPress={() => setSelectedGoal(goal.id)}
              >
                <MaterialCommunityIcons name={goal.icon} size={32} color={goal.color} />
                <Text style={styles.goalLabel}>{goal.label}</Text>
                {selectedGoal === goal.id && (
                  <View style={[styles.selectedIcon, { backgroundColor: goal.color }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diet Type</Text>
          <View style={styles.dietTypeContainer}>
            {dietTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.dietTypeOption,
                  dietType === type.id && styles.selectedDietType
                ]}
                onPress={() => setDietType(type.id)}
              >
                <View style={styles.dietTypeHeader}>
                  <Text style={[
                    styles.dietTypeLabel,
                    dietType === type.id && styles.selectedDietTypeLabel
                  ]}>
                    {type.label}
                  </Text>
                  {dietType === type.id && <Ionicons name="checkmark-circle" size={20} color="#4A6FFF" />}
                </View>
                <Text style={styles.dietTypeDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meals Per Day</Text>
          <View style={styles.mealCountContainer}>
            {mealCountOptions.map(count => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.mealCountOption,
                  mealCount === count && styles.selectedMealCount
                ]}
                onPress={() => setMealCount(count)}
              >
                <Text style={[
                  styles.mealCountLabel,
                  mealCount === count && styles.selectedMealCountLabel
                ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Calories</Text>
          <View style={styles.calorieSection}>
            <Text style={styles.calorieLabel}>Target Calories</Text>
            <TextInput
              style={styles.calorieInput}
              value={calorieLimit.toString()}
              onChangeText={(text) => setCalorieLimit(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="Enter calorie target"
            />
            <View style={styles.calorieNoteContainer}>
              <Ionicons name="information-circle" size={20} color="#4A6FFF" style={styles.calorieInfoIcon} />
              <Text style={styles.calorieNote}>
                Recommended daily intake based on your profile and goals
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.restrictionsHeader}>
            <Text style={styles.sectionTitle}>Food Restrictions</Text>
            <TouchableOpacity 
              style={styles.addRestrictionButton}
              onPress={() => setShowRestrictionsModal(true)}
            >
              <Ionicons name="add" size={22} color="#4A6FFF" />
              <Text style={styles.addRestrictionText}>Add Custom</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.restrictionsContainer}>
            {commonRestrictions.map(restriction => (
              <TouchableOpacity 
                key={restriction.id}
                style={[
                  styles.restrictionOption,
                  restrictions.includes(restriction.id) && styles.selectedRestriction
                ]}
                onPress={() => toggleRestriction(restriction.id)}
              >
                {restrictions.includes(restriction.id) ? (
                  <Ionicons name="checkbox" size={22} color="#4A6FFF" />
                ) : (
                  <Ionicons name="square-outline" size={22} color="#777" />
                )}
                <Text style={[
                  styles.restrictionLabel,
                  restrictions.includes(restriction.id) && styles.selectedRestrictionLabel
                ]}>
                  {restriction.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* Display custom restrictions */}
            {restrictions
              .filter(r => !commonRestrictions.map(cr => cr.id).includes(r))
              .map((custom, index) => (
                <TouchableOpacity 
                  key={`custom-${index}`}
                  style={[styles.restrictionOption, styles.selectedRestriction]}
                  onPress={() => setRestrictions(restrictions.filter(r => r !== custom))}
                >
                  <Ionicons name="checkbox" size={22} color="#4A6FFF" />
                  <Text style={[styles.restrictionLabel, styles.selectedRestrictionLabel]}>
                    {custom.charAt(0).toUpperCase() + custom.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))
            }
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGeneratePlan}
          disabled={generatingPlan}
        >
          {generatingPlan ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Diet Plan</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Custom restriction modal */}
      <Modal
        visible={showRestrictionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRestrictionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.restrictionModalContainer}>
            <Text style={styles.modalTitle}>Add Food Restriction</Text>
            <TextInput
              style={styles.restrictionInput}
              value={customRestriction}
              onChangeText={setCustomRestriction}
              placeholder="Enter food to avoid (e.g., shellfish)"
              autoFocus
            />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRestrictionsModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={addCustomRestriction}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Render meal plan modal */}
      {renderMealPlan()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  goalOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalOption: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4A6FFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalLabel: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  dietTypeContainer: {
    marginBottom: 5,
  },
  dietTypeOption: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedDietType: {
    borderColor: '#4A6FFF',
    backgroundColor: 'rgba(74, 111, 255, 0.05)',
  },
  dietTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dietTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedDietTypeLabel: {
    color: '#4A6FFF',
  },
  dietTypeDescription: {
    fontSize: 14,
    color: '#666',
  },
  mealCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mealCountOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedMealCount: {
    backgroundColor: '#4A6FFF',
    borderColor: '#4A6FFF',
  },
  mealCountLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedMealCountLabel: {
    color: '#fff',
  },
  calorieSection: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
  },
  calorieLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  calorieInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  calorieNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  calorieInfoIcon: {
    marginRight: 5,
  },
  calorieNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  restrictionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addRestrictionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addRestrictionText: {
    color: '#4A6FFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  restrictionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  restrictionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedRestriction: {
    backgroundColor: 'rgba(74, 111, 255, 0.1)',
  },
  restrictionLabel: {
    fontSize: 15,
    color: '#555',
    marginLeft: 8,
  },
  selectedRestrictionLabel: {
    color: '#4A6FFF',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  generateButton: {
    backgroundColor: '#4A6FFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restrictionModalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  restrictionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4A6FFF',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '90%',
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  planSummary: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  planCalories: {
    fontSize: 17,
    color: '#4A6FFF',
    fontWeight: '600',
    marginBottom: 15,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  mealPlanScrollView: {
    maxHeight: 400,
  },
  mealCard: {
    margin: 15,
    marginBottom: 5,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mealCalories: {
    fontSize: 16,
    color: '#4A6FFF',
    fontWeight: '500',
  },
  mealFoodsList: {
    marginBottom: 10,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodName: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  foodPortion: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  nutritionTips: {
    margin: 15,
    marginTop: 10,
    padding: 15,
    backgroundColor: 'rgba(74, 111, 255, 0.08)',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    flex: 1,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#4A6FFF',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cuisineTag: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginBottom: 10,
  },
  cuisineText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  noFoodsText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  noMealsText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
});

export default DietPlanScreen;
