import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Switch, FlatList, Alert, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons, AntDesign } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import googleFitManager from '../utils/GoogleFitManager';
import PermissionsManager from '../utils/PermissionsManager';
import { LineChart } from 'react-native-chart-kit';

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
  const [monthlyStats, setMonthlyStats] = useState({
    totalSteps: 0,
    dailyAvgSteps: 0,
    totalCalories: 0,
    dailyAvgCalories: 0,
    totalDistance: 0, // in miles
    weeklyAvgDistance: 0,
  });
  const [stepHistory, setStepHistory] = useState({
    labels: ['', '', '', '', '', '', ''],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

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
        // Connect to the health app with better error handling
        console.log(`Attempting to connect to ${appId}...`);
        
        // Special handling for Google Fit on Android with our custom manager
        if (appId === 'googleFit' && Platform.OS === 'android') {
          try {
            // Show a specific message for Google Fit
            Alert.alert(
              "Google Fit Connection",
              "Please ensure Google Fit is installed and you've granted all necessary permissions when prompted.",
              [{ text: "Continue" }]
            );
            
            // Check activity recognition permission first
            const hasPermission = await PermissionsManager.checkActivityRecognitionPermission();
            if (!hasPermission) {
              const granted = await PermissionsManager.requestActivityRecognitionWithExplanation();
              if (!granted) {
                Alert.alert(
                  "Permission Denied",
                  "Activity recognition permission is required to track steps and fitness data.",
                  [{ text: "OK" }]
                );
                setConnectingApp(null);
                return;
              }
            }
            
            // Check if Google Fit is available first
            const isAvailable = googleFitManager.isAvailable();
            if (!isAvailable) {
              Alert.alert(
                "Google Fit Not Available",
                "The Google Fit module couldn't be loaded. Please make sure the Google Fit app is installed on your device.",
                [{ text: "OK" }]
              );
              setConnectingApp(null);
              return;
            }
            
            // Try multiple connection approaches
            const connectionResult = await googleFitManager.tryConnect();
            console.log('Connection result:', JSON.stringify(connectionResult));
            
            // Handle verification errors specifically
            if (connectionResult.verificationRequired) {
              console.log('Google verification required');
              Alert.alert(
                "Google Verification Required",
                "This app hasn't been verified by Google yet. Only test users added to the Google Cloud Console project can use Google Fit features.\n\nContact the app developer to be added as a test user.",
                [
                  { 
                    text: "Learn More", 
                    onPress: () => {
                      // If you have a way to open links, you could open Google's documentation
                      console.log("User wants to learn more about verification");
                    }
                  },
                  { text: "OK" }
                ]
              );
              setConnectingApp(null);
              return;
            }
            
            // Handle user cancellation explicitly
            if (connectionResult.cancelled) {
              console.log('User cancelled Google Fit authentication');
              Alert.alert(
                "Authentication Cancelled",
                "You cancelled the Google Fit authentication. Please try again and complete the sign-in process to connect your fitness data.",
                [{ text: "OK" }]
              );
              setConnectingApp(null);
              return;
            }
            
            if (connectionResult && connectionResult.success) {
              // Start recording if connection was successful
              await googleFitManager.startRecording();
              
              // Now connect through our regular flow
              const success = await connectHealthApp(appId);
              
              if (!success) {
                throw new Error("Final connection process failed");
              }
            } else {
              throw new Error(connectionResult?.message || "Connection failed with unknown error");
            }
          } catch (error) {
            console.error('Error with Google Fit connection:', error);
            
            // Get diagnostic info
            const diagnostics = googleFitManager.getDiagnostics();
            console.log('Google Fit diagnostics:', JSON.stringify(diagnostics));
            
            Alert.alert(
              "Connection Failed",
              `Could not connect to Google Fit.\n\nError: ${error.message}\n\nMake sure:\n1. Google Fit app is installed and set up\n2. You're signed in to Google Fit\n3. You've granted all permissions`,
              [{ text: "OK" }]
            );
            
            setConnectingApp(null);
            return;
          }
        } else {
          // Regular flow for other health apps
          const success = await connectHealthApp(appId);
          
          if (!success) {
            let errorMessage = `Could not connect to ${getHealthAppName(appId)}. Please check your permissions and try again.`;
            
            Alert.alert(
              "Connection Failed",
              errorMessage,
              [
                { 
                  text: "Try Again",
                  onPress: () => handleHealthAppConnection(appId)
                },
                { text: "Cancel" }
              ]
            );
          }
        }
      }
    } catch (error) {
      console.error('Error toggling health app connection:', error);
      Alert.alert("Error", `Failed to connect to health app: ${error.message || 'Unknown error'}`);
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

  // Fetch monthly statistics when profile loads or when health apps connection changes
  useEffect(() => {
    if (isAnyHealthAppConnected()) {
      fetchMonthlyStats();
    }
  }, [connectedHealthApps]);

  // Function to check if any health app is connected
  const isAnyHealthAppConnected = () => {
    return connectedHealthApps.googleFit || 
           connectedHealthApps.appleHealth || 
           connectedHealthApps.samsungHealth;
  };

  // Fetch monthly statistics from health services
  const fetchMonthlyStats = async () => {
    setIsLoadingStats(true);
    try {
      // Get current date info for calculations
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const daysPassed = Math.min(today.getDate(), daysInMonth);
      
      let totalSteps = 0;
      let totalCalories = 0;
      let totalDistance = 0;
      let last7DaysSteps = [0, 0, 0, 0, 0, 0, 0];
      let dayLabels = ['', '', '', '', '', '', ''];
      
      // Simulated data if we're in development/testing mode 
      // In a real app, we would fetch this from the health services
      if (__DEV__ && !connectedHealthApps.googleFit && !connectedHealthApps.appleHealth) {
        // Generate some realistic sample data for development
        totalSteps = Math.floor(Math.random() * 200000) + 50000;
        totalCalories = Math.floor(Math.random() * 40000) + 10000;
        totalDistance = Math.floor(Math.random() * 100) + 20;
        
        // Generate last 7 days of step data
        for (let i = 0; i < 7; i++) {
          last7DaysSteps[i] = Math.floor(Math.random() * 5000) + 3000;
          const day = new Date();
          day.setDate(today.getDate() - (6 - i));
          dayLabels[i] = day.getDate().toString();
        }
      } else {
        // In a real app, here we would:
        // 1. Call health services API to get monthly data
        // 2. Sum up the values and calculate averages
        
        // For Google Fit on Android
        if (Platform.OS === 'android' && connectedHealthApps.googleFit) {
          try {
            // Check if we can access Google Fit data
            if (googleFitManager.isAuthorized) {
              // Get the daily step data for the current month
              // This would normally involve date range queries to the health API
              
              // For step history, get last 7 days
              for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                
                // Get step data for this day - in a real app this would call GoogleFit API
                // Here we're just generating random data
                const daySteps = Math.floor(Math.random() * 5000) + 3000;
                last7DaysSteps[6-i] = daySteps;
                dayLabels[6-i] = date.getDate().toString();
                
                // Add to monthly totals
                totalSteps += daySteps;
                totalCalories += Math.floor(daySteps * 0.05); // Crude estimate
                totalDistance += daySteps / 2000; // Crude estimate, ~2000 steps per mile
              }
            }
          } catch (error) {
            console.error('Error fetching Google Fit data:', error);
          }
        }
        
        // For Apple Health on iOS 
        if (Platform.OS === 'ios' && connectedHealthApps.appleHealth) {
          // Similar implementation as above but for Apple Health
          // Since this is placeholder, we'll use the same random data approach
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const daySteps = Math.floor(Math.random() * 5000) + 3000;
            last7DaysSteps[6-i] = daySteps;
            dayLabels[6-i] = date.getDate().toString();
            
            totalSteps += daySteps;
            totalCalories += Math.floor(daySteps * 0.05);
            totalDistance += daySteps / 2000;
          }
        }
      }
      
      // Calculate daily and weekly averages
      const dailyAvgSteps = Math.floor(totalSteps / daysPassed);
      const dailyAvgCalories = Math.floor(totalCalories / daysPassed);
      const weeklyAvgDistance = (totalDistance / (daysPassed / 7)).toFixed(1);
      
      setMonthlyStats({
        totalSteps,
        dailyAvgSteps,
        totalCalories,
        dailyAvgCalories,
        totalDistance: totalDistance.toFixed(1),
        weeklyAvgDistance
      });
      
      setStepHistory({
        labels: dayLabels,
        datasets: [{ data: last7DaysSteps }]
      });
      
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      Alert.alert('Error', 'Could not load health statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

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

          {/* Step History Chart */}
          {isAnyHealthAppConnected() && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Step History</Text>
                <TouchableOpacity onPress={fetchMonthlyStats}>
                  <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
              </View>
              
              {isLoadingStats ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4A6FFF" />
                  <Text style={styles.loadingText}>Loading data...</Text>
                </View>
              ) : (
                <View style={styles.chartContainer}>
                  <LineChart
                    data={stepHistory}
                    width={Dimensions.get('window').width - 40}
                    height={180}
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(74, 111, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16
                      },
                      propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: "#4A6FFF"
                      }
                    }}
                    bezier
                    style={styles.chart}
                  />
                  <Text style={styles.chartLabel}>Last 7 Days Steps</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Monthly Statistics</Text>
            
            {isLoadingStats ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4A6FFF" />
                <Text style={styles.loadingText}>Loading statistics...</Text>
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={styles.statCardHeader}>
                    <MaterialCommunityIcons name="shoe-print" size={22} color="#4A6FFF" />
                    <Text style={styles.statCardLabel}>Steps</Text>
                  </View>
                  <Text style={styles.statCardValue}>{formatNumber(monthlyStats.totalSteps)}</Text>
                  <Text style={styles.statCardAverage}>{formatNumber(monthlyStats.dailyAvgSteps)} daily avg</Text>
                </View>
                
                <View style={styles.statCard}>
                  <View style={styles.statCardHeader}>
                    <FontAwesome5 name="fire" size={22} color="#FF6B6B" />
                    <Text style={styles.statCardLabel}>Calories</Text>
                  </View>
                  <Text style={styles.statCardValue}>{formatNumber(monthlyStats.totalCalories)}</Text>
                  <Text style={styles.statCardAverage}>{formatNumber(monthlyStats.dailyAvgCalories)} daily avg</Text>
                </View>
                
                <View style={[styles.statCard, { width: '100%' }]}>
                  <View style={styles.statCardHeader}>
                    <MaterialCommunityIcons name="map-marker-distance" size={22} color="#6BBF59" />
                    <Text style={styles.statCardLabel}>Miles</Text>
                  </View>
                  <Text style={styles.statCardValue}>{monthlyStats.totalDistance}</Text>
                  <Text style={styles.statCardAverage}>{monthlyStats.weeklyAvgDistance} weekly avg</Text>
                </View>
              </View>
            )}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshText: {
    fontSize: 14,
    color: '#4A6FFF',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666',
    marginTop: 10,
    fontSize: 14,
  },
});

export default Profile;
