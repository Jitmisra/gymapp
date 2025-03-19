import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Switch, FlatList, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons, AntDesign } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';

const profileData = {
  name: 'Alex Martin',
  email: 'alex.martin@university.edu',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  height: '5\'9"',
  weight: '165 lbs',
  bmi: '24.3',
  fitnessLevel: 'Intermediate',
};

const activityHistory = [
  {
    id: '1',
    type: 'Gym Session',
    location: 'Main Campus Gym',
    duration: '45 min',
    time: 'Today, 8:30 AM',
    icon: 'dumbbell',
    iconColor: '#6BBF59',
  },
  {
    id: '2',
    type: 'Outdoor Run',
    location: 'Campus Trail',
    duration: '32 min',
    distance: '4.2 km',
    time: 'Yesterday, 6:15 PM',
    icon: 'running',
    iconColor: '#4A6FFF',
  },
  {
    id: '3',
    type: 'Yoga Class',
    location: 'Student Center',
    duration: '60 min',
    time: 'Yesterday, 10:00 AM',
    icon: 'pray',
    iconColor: '#9C27B0',
  },
  {
    id: '4',
    type: 'Gym Session',
    location: 'Main Campus Gym',
    duration: '50 min',
    time: '2 days ago, 4:30 PM',
    icon: 'dumbbell',
    iconColor: '#6BBF59',
  },
];

const Profile = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [activeTab, setActiveTab] = useState('Activity');
  const [connectingApp, setConnectingApp] = useState(null);
  
  const { 
    isGuestMode, 
    signOut, 
    userData, 
    bmiData, 
    waterReminder, 
    toggleWaterReminder, 
    connectedHealthApps, 
    connectHealthApp, 
    disconnectHealthApp 
  } = useContext(AuthContext);

  // Handle health app connection toggle
  const handleHealthAppConnection = async (appId) => {
    setConnectingApp(appId);
    try {
      const isConnected = connectedHealthApps[appId];
      
      if (isConnected) {
        // Ask for confirmation before disconnecting
        Alert.alert(
          "Disconnect Health App",
          `Are you sure you want to disconnect from ${getHealthAppName(appId)}?`,
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Disconnect",
              style: "destructive",
              onPress: async () => {
                await disconnectHealthApp(appId);
              }
            }
          ]
        );
      } else {
        // Connect to the health app
        const success = await connectHealthApp(appId);
        if (!success) {
          Alert.alert(
            "Connection Failed",
            `Could not connect to ${getHealthAppName(appId)}. Please check your permissions and try again.`
          );
        }
      }
    } catch (error) {
      console.error('Error toggling health app connection:', error);
      Alert.alert("Error", "Failed to connect to health app. Please try again.");
    } finally {
      setConnectingApp(null);
    }
  };

  // Get app name from ID
  const getHealthAppName = (appId) => {
    switch (appId) {
      case 'googleFit':
        return 'Google Fit';
      case 'appleHealth':
        return 'Apple Health';
      case 'samsungHealth':
        return 'Samsung Health';
      default:
        return 'Health App';
    }
  };

  // Update the healthApps array with connection status
  const healthApps = [
    {
      id: 'googleFit',
      name: 'Google Fit',
      icon: 'google',
      iconType: 'AntDesign',
      connected: connectedHealthApps.googleFit,
      color: '#4285F4',
    },
    {
      id: 'appleHealth',
      name: 'Apple Health',
      icon: 'apple1',
      iconType: 'AntDesign',
      connected: connectedHealthApps.appleHealth,
      color: '#000000',
    },
    {
      id: 'samsungHealth',
      name: 'Samsung Health',
      icon: 'mobile-alt',
      iconType: 'FontAwesome5',
      connected: connectedHealthApps.samsungHealth,
      color: '#1428A0',
    },
  ];
  
  // If in guest mode, display a simplified profile screen with sign in option
  if (isGuestMode) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestHeader}>
          <FontAwesome5 name="user-circle" size={80} color="#ccc" />
          <Text style={styles.guestTitle}>You're in Guest Mode</Text>
          <Text style={styles.guestSubtitle}>Sign in to access your personal profile and track your progress</Text>
        </View>
        
        <View style={styles.guestButtonContainer}>
          <TouchableOpacity 
            style={styles.signInButtonGuest}
            onPress={() => {
              signOut(); // Sign out of guest mode
              navigation.navigate('SignIn'); // Go directly to sign in
            }}
          >
            <Text style={styles.signInTextGuest}>Sign In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signUpButtonGuest}
            onPress={() => {
              signOut(); // Sign out of guest mode
              navigation.navigate('SignUp'); // Go directly to sign up
            }}
          >
            <Text style={styles.signUpTextGuest}>Create Account</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.guestFeatures}>
          <Text style={styles.guestFeaturesTitle}>Features available in full account:</Text>
          <View style={styles.guestFeatureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4A6FFF" />
            <Text style={styles.guestFeatureText}>Personal workout tracking</Text>
          </View>
          <View style={styles.guestFeatureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4A6FFF" />
            <Text style={styles.guestFeatureText}>Join fitness challenges and competitions</Text>
          </View>
          <View style={styles.guestFeatureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4A6FFF" />
            <Text style={styles.guestFeatureText}>Connect with other campus fitness enthusiasts</Text>
          </View>
          <View style={styles.guestFeatureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4A6FFF" />
            <Text style={styles.guestFeatureText}>Save your favorite equipment bookings</Text>
          </View>
          <View style={styles.guestFeatureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4A6FFF" />
            <Text style={styles.guestFeatureText}>One-to-one chat with workout buddies</Text>
          </View>
        </View>
      </View>
    );
  }

  const renderHealthAppItem = ({ item }) => (
    <View style={styles.healthAppItem}>
      <View style={styles.healthAppHeader}>
        {item.iconType === 'AntDesign' ? (
          <AntDesign name={item.icon} size={22} color={item.color} />
        ) : (
          <FontAwesome5 name={item.icon} size={22} color={item.color} solid />
        )}
        <Text style={styles.healthAppName}>{item.name}</Text>
      </View>
      <TouchableOpacity 
        style={[
          styles.connectButton, 
          item.connected ? styles.connectedButton : styles.disconnectedButton,
          connectingApp === item.id && styles.connectingButton
        ]}
        onPress={() => handleHealthAppConnection(item.id)}
        disabled={connectingApp !== null}
      >
        {connectingApp === item.id ? (
          <ActivityIndicator size="small" color="#4A6FFF" />
        ) : (
          <Text style={[
            styles.connectButtonText,
            item.connected ? styles.connectedButtonText : styles.disconnectedButtonText
          ]}>
            {item.connected ? 'Connected' : 'Connect'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconContainer, { backgroundColor: item.iconColor + '20' }]}>
        <FontAwesome5 name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={styles.activityDetails}>
        <Text style={styles.activityType}>{item.type}</Text>
        <Text style={styles.activityLocation}>{item.location}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
      <View style={styles.activityStats}>
        <Text style={styles.activityDuration}>{item.duration}</Text>
        {item.distance && <Text style={styles.activityDistance}>{item.distance}</Text>}
      </View>
    </View>
  );

  // Calculate BMI category
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3498db' };
    if (bmi < 24.9) return { category: 'Normal weight', color: '#2ecc71' };
    if (bmi < 29.9) return { category: 'Overweight', color: '#f1c40f' };
    return { category: 'Obese', color: '#e74c3c' };
  };
  
  const bmiCategory = bmiData ? getBMICategory(bmiData.bmi) : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: userData?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg' }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{userData?.name || 'User'}</Text>
        <Text style={styles.email}>{userData?.email || 'user@example.com'}</Text>
        <View style={styles.statsContainer}>
          {bmiData && (
            <>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bmiData.height} cm</Text>
                <Text style={styles.statLabel}>Height</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bmiData.weight} kg</Text>
                <Text style={styles.statLabel}>Weight</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{bmiData.bmi}</Text>
                <Text style={styles.statLabel}>BMI</Text>
              </View>
            </>
          )}
          {!bmiData && (
            <TouchableOpacity 
              style={styles.updateBmiButton}
              onPress={() => navigation.navigate('BMICollection', {
                token: 'dummy-token',
                userData: userData,
                isGuest: false
              })}
            >
              <Text style={styles.updateBmiButtonText}>Add Your Health Metrics</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{profileData.fitnessLevel}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Activity' && styles.activeTab]}
          onPress={() => setActiveTab('Activity')}
        >
          <Text style={[styles.tabText, activeTab === 'Activity' && styles.activeTabText]}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Settings' && styles.activeTab]}
          onPress={() => setActiveTab('Settings')}
        >
          <Text style={[styles.tabText, activeTab === 'Settings' && styles.activeTabText]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Activity' ? (
        <>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Health App Connections</Text>
            <Text style={styles.sectionSubtitle}>Connect your health apps to sync your activity data</Text>
            <FlatList
              data={healthApps}
              renderItem={renderHealthAppItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <FlatList
              data={activityHistory}
              renderItem={renderActivityItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Activity</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Monthly Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <MaterialCommunityIcons name="shoe-print" size={22} color="#4A6FFF" />
                  <Text style={styles.statCardLabel}>Steps</Text>
                </View>
                <Text style={styles.statCardValue}>247,583</Text>
                <Text style={styles.statCardAverage}>8,252 daily avg</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <FontAwesome5 name="fire" size={22} color="#FF6B6B" />
                  <Text style={styles.statCardLabel}>Calories</Text>
                </View>
                <Text style={styles.statCardValue}>42,156</Text>
                <Text style={styles.statCardAverage}>1,405 daily avg</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <MaterialCommunityIcons name="clock-time-eight-outline" size={22} color="#FFC107" />
                  <Text style={styles.statCardLabel}>Active Hours</Text>
                </View>
                <Text style={styles.statCardValue}>87</Text>
                <Text style={styles.statCardAverage}>2.9 daily avg</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statCardHeader}>
                  <MaterialCommunityIcons name="dumbbell" size={22} color="#6BBF59" />
                  <Text style={styles.statCardLabel}>Workouts</Text>
                </View>
                <Text style={styles.statCardValue}>18</Text>
                <Text style={styles.statCardAverage}>4.5 per week</Text>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={22} color="#333" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#d0d0d0', true: '#4A6FFF80' }}
              thumbColor={notifications ? '#4A6FFF' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={22} color="#333" />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#d0d0d0', true: '#4A6FFF80' }}
              thumbColor={darkMode ? '#4A6FFF' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="location" size={22} color="#333" />
              <Text style={styles.settingText}>Location Tracking</Text>
            </View>
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{ false: '#d0d0d0', true: '#4A6FFF80' }}
              thumbColor={locationTracking ? '#4A6FFF' : '#f4f3f4'}
            />
          </View>
          
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuInfo}>
              <Ionicons name="person" size={22} color="#333" />
              <Text style={styles.menuText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuInfo}>
              <Ionicons name="shield-checkmark" size={22} color="#333" />
              <Text style={styles.menuText}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuInfo}>
              <Ionicons name="help-circle" size={22} color="#333" />
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuInfo}>
              <Ionicons name="information-circle" size={22} color="#333" />
              <Text style={styles.menuText}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {bmiData && (
        <View style={styles.bmiContainer}>
          <Text style={styles.sectionTitle}>Your Health Metrics</Text>
          
          <View style={styles.bmiCard}>
            <View style={styles.bmiHeaderRow}>
              <Text style={styles.bmiLabel}>BMI</Text>
              <View style={[styles.bmiCategoryBadge, { backgroundColor: bmiCategory.color }]}>
                <Text style={styles.bmiCategoryText}>{bmiCategory.category}</Text>
              </View>
            </View>
            
            <Text style={styles.bmiValue}>{bmiData.bmi}</Text>
            
            <View style={styles.bmiDetailsContainer}>
              <View style={styles.bmiDetail}>
                <Text style={styles.bmiDetailLabel}>Age</Text>
                <Text style={styles.bmiDetailValue}>{bmiData.age} years</Text>
              </View>
              
              <View style={styles.bmiDetail}>
                <Text style={styles.bmiDetailLabel}>Weight</Text>
                <Text style={styles.bmiDetailValue}>{bmiData.weight} kg</Text>
              </View>
              
              <View style={styles.bmiDetail}>
                <Text style={styles.bmiDetailLabel}>Height</Text>
                <Text style={styles.bmiDetailValue}>{bmiData.height} cm</Text>
              </View>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Ionicons name="water-outline" size={24} color="#4A6FFF" />
          </View>
          <Text style={styles.settingText}>Water Reminder</Text>
          <Switch
            value={waterReminder}
            onValueChange={toggleWaterReminder}
            trackColor={{ false: '#ccc', true: '#4A6FFF' }}
            thumbColor="#fff"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => navigation.navigate('BMICollection', {
            token: isGuestMode ? null : 'dummy-token',
            userData: userData,
            isGuest: isGuestMode
          })}
        >
          <View style={styles.settingIconContainer}>
            <Ionicons name="fitness-outline" size={24} color="#4A6FFF" />
          </View>
          <Text style={styles.settingText}>Update Health Metrics</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            signOut();
            navigation.navigate('Welcome');
          }}
        >
          <Text style={styles.logoutText}>
            {isGuestMode ? "Sign In" : "Log Out"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    height: 30,
    width: 1,
    backgroundColor: '#ddd',
  },
  levelBadge: {
    backgroundColor: '#4A6FFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  levelText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 5,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 0,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A6FFF',
  },
  tabText: {
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#4A6FFF',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  healthAppItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  healthAppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthAppName: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  connectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
  },
  connectedButton: {
    borderColor: '#4CAF50',
  },
  disconnectedButton: {
    borderColor: '#4A6FFF',
  },
  connectButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectedButtonText: {
    color: '#4CAF50',
  },
  disconnectedButtonText: {
    color: '#4A6FFF',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#888',
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6FFF',
    marginBottom: 2,
  },
  activityDistance: {
    fontSize: 12,
    color: '#666',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 5,
  },
  viewAllText: {
    color: '#4A6FFF',
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statCardLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statCardAverage: {
    fontSize: 12,
    color: '#888',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Guest mode styles
  guestContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
  },
  guestHeader: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  guestButtonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  signInButtonGuest: {
    backgroundColor: '#4A6FFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  signInTextGuest: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButtonGuest: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A6FFF',
  },
  signUpTextGuest: {
    color: '#4A6FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestFeatures: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guestFeaturesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  guestFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guestFeatureText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  guestNote: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  bmiContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  bmiCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bmiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bmiLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  bmiCategoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bmiCategoryText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  bmiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  bmiDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiDetail: {
    alignItems: 'center',
  },
  bmiDetailLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
  },
  bmiDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 111, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateBmiButton: {
    backgroundColor: '#4A6FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  updateBmiButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  connectingButton: {
    borderColor: '#4A6FFF',
    backgroundColor: '#f5f5f5',
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    marginTop: -10,
  },
});

export default Profile;
