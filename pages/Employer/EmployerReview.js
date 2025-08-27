import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Alert,
  Dimensions 
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfileDetails } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';

const { width, height } = Dimensions.get('window');

const EmployerReview = ({ navigation, route }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { updateUser, logout } = useAuth();

  // Initial profile data fetch
  useEffect(() => {
    fetchProfileData();
  }, [route.params?.updated]);

  // Comment out or replace the periodic status check useEffect
  // Set up periodic status check - every 30 seconds
  useEffect(() => {
    // Initial check once
    checkProfileStatus();
    
    // Comment out the interval-based checking
    // const statusCheckInterval = setInterval(() => {
    //   checkProfileStatus();
    // }, 30000); // Check every 30 seconds

    // // Clean up interval on unmount
    // return () => clearInterval(statusCheckInterval);
  }, []);

  const fetchProfileData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userDetails');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('Profile data loaded from AsyncStorage in EmployerReview');
        setProfileData(userData);
        
        // Try to get fresh data from API
        if (userData.id) {
          try {
            const response = await getProfileDetails(userData.id, 'employer');
            if (response && response.data) {
              let updatedData;
              
              // Handle different response formats
              if (response.data.user) {
                updatedData = response.data.user;
              } else if (response.data.profile) {
                updatedData = response.data.profile;
              } else if (response.data.employer) {
                updatedData = response.data.employer;
              } else if (response.data) {
                updatedData = response.data;
              }
              
              if (updatedData) {
                console.log('Updated profile data from API in EmployerReview');
                setProfileData(updatedData);
                // Update the context/AsyncStorage with latest data
                await updateUser(updatedData);
              }
            }
          } catch (apiError) {
            console.error('Error fetching fresh profile data:', apiError);
            // Continue with existing data from AsyncStorage
          }
        }
      } else {
        Alert.alert("Error", "No profile data found. Please register again.");
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert("Error", "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const checkProfileStatus = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userDetails');
      if (!userDataString) return;

      const userData = JSON.parse(userDataString);
      const userId = userData.id;
      
      // Fetch latest profile data from API
      const response = await getProfileDetails(userId, 'employer');
      
      if (response && response.data) {
        let updatedUserData;
        
        // Handle different response formats
        if (response.data.user) {
          updatedUserData = response.data.user;
        } else if (response.data.profile) {
          updatedUserData = response.data.profile;
        } else if (response.data.employer) {
          updatedUserData = response.data.employer;
        } else if (response.data) {
          updatedUserData = response.data;
        }
        
        if (updatedUserData) {
          // Check all possible status property names
          const userStatus = updatedUserData.status || 
                            updatedUserData.Status || 
                            updatedUserData.accountStatus ||
                            updatedUserData.account_status || 
                            'unknown';
          
          // If status is now active, update local data and navigate to MyJobs
          if (userStatus.toLowerCase() === 'active') {
            // Update user context with new status
            await updateUser(updatedUserData);
            
            // Navigate to MyJobs screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'MyJobs' }],
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      // Silent error - don't show alert for background status check
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('EmployerRegistration', { 
      employerData: profileData, 
      isEditing: true,
      returnToReview: true,
      mobile: profileData.mobile
    });
  };

  const handleContinue = () => {
    navigation.navigate('PostJob');
  };

  // Handle back arrow press: log out and go to UserTypeSelection
  const handleBack = async () => {
    try {
      await AsyncStorage.removeItem('userDetails');
      if (logout) await logout();
    } catch (e) {
      // ignore
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // Set the header back button
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBack} style={{ marginLeft: 16 }}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      ),
      headerTitle: 'Profile Under Review',
      headerStyle: { backgroundColor: '#BE4145', elevation: 0, shadowOpacity: 0 },
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.reviewCard}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="access-time" size={64} color="#BE4145" />
        </View>
        
        <Text style={styles.reviewTitle}>Profile Under Review</Text>
        
        <Text style={styles.reviewMessage}>
          Thank you for registering with Workezy. Your profile is currently under review.
          Our team will verify your details and documents.
        </Text>
        
        <View style={styles.timelineContainer}>
          <View style={styles.timelineDot} />
          <View style={styles.timelineLine} />
          <View style={styles.timelineDot} />
        </View>
        
        <Text style={styles.timeframeText}>
          You will be notified within <Text style={styles.highlightText}>24 hours</Text>
        </Text>
        
        <Text style={styles.noteText}>
          Once approved, you'll be able to post jobs and access all employer features.
        </Text>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Feather name="edit-2" size={18} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Profile Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f2ee', 
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#BE4145',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  reviewMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '60%',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#BE4145',
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#BE4145',
  },
  timeframeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  highlightText: {
    color: '#45A6BE',
    fontFamily: 'Inter-Regular',
  },
  noteText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#BE4145',
    width: '100%',
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#fff',
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#BE4145',
    width: '100%',
  },
  continueButtonText: {
    fontSize: 16, 
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default EmployerReview; 