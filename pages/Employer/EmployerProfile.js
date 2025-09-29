import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfileDetails } from '../../utils/api';
import BottomNav from '../../component/BottomNav';
import { useAuth } from '../../utils/AuthContext';
import { BackHandler } from 'react-native';
import { Platform } from 'react-native';
import LeftNav from '../../component/LeftNav';

const ButtonComponent = ({ name, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <View style={styles.buttonContent}>
        <Ionicons name={icon} size={24} color="#444444" />
        <Text style={styles.buttonText}>{name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#444444" />
    </TouchableOpacity>
  );
};


const formatRoleText = (role) => {
  if (!role) return 'Employer';
  return role.replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const EmployerProfile = () => {
  const navigation = useNavigation();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, user, updateUser, isEmployerActive } = useAuth();

  // Check status and redirect if not active
  useEffect(() => {
    // If employer is not active, redirect to EmployerReview
    if (!isEmployerActive()) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'EmployerReview' }],
      });
    }
  }, [isEmployerActive, navigation]);


  // Handle Android back button to always go to MyJobs
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.reset({
          index: 0,
          routes: [{ name: "MyJobs" }],
        });
        return true; // prevent default pop
      }
    );

    return () => backHandler.remove();
  }, [navigation]);


  // Log the current route for debugging
  useEffect(() => {
    // Add debug logging
    console.log('EmployerProfile mounted, checking user data:');
    if (user) {
      console.log('User from context:', JSON.stringify(user));

      // Fix user type if incorrectly set - this addresses the redirecting issue
      if (user.userType !== 'employer') {
        console.log('Fixing user type to employer');
        const updatedUser = { ...user, userType: 'employer' };
        updateUser(updatedUser);
      }
    }

    // Check AsyncStorage directly to debug
    const checkAsyncStorage = async () => {
      try {
        const userData = await AsyncStorage.getItem('userDetails');
        if (userData) {
          const parsedData = JSON.parse(userData);
          console.log('User from AsyncStorage:', JSON.stringify(parsedData));

          // If AsyncStorage has wrong user type, fix it
          if (parsedData.userType !== 'employer') {
            const updatedUser = { ...parsedData, userType: 'employer' };
            await AsyncStorage.setItem('userDetails', JSON.stringify(updatedUser));
            console.log('Fixed AsyncStorage user type to employer');
          }
        }
      } catch (err) {
        console.error('AsyncStorage debug error:', err);
      }
    };

    checkAsyncStorage();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Always use employer as userType to ensure correct API call
        const userType = 'employer';
        let userId;

        // Try to get user data from context first
        if (user && user.id) {
          userId = user.id;
          console.log('Using user ID from context:', userId);

          // Ensure user type is set correctly in context
          if (user.userType !== 'employer') {
            console.log('Correcting user type in context');
            updateUser({ ...user, userType: 'employer' });
          }
        } else {
          // If no user in context, check AsyncStorage
          console.log('No user data in context, checking AsyncStorage');
          const userDataString = await AsyncStorage.getItem('userDetails');

          if (!userDataString) {
            // User is logged out, just return without showing error
            console.log('No user data in AsyncStorage, user is logged out');
            setLoading(false);
            return;
          }

          const userData = JSON.parse(userDataString);
          userId = userData.id;
          console.log('Using user ID from AsyncStorage:', userId);

          // Ensure user type is set correctly in AsyncStorage
          if (userData.userType !== 'employer') {
            console.log('Correcting user type in AsyncStorage');
            await AsyncStorage.setItem('userDetails', JSON.stringify({
              ...userData,
              userType: 'employer'
            }));
          }
        }

        if (!userId) {
          // No user ID found, user is likely logged out
          console.log('Could not determine user ID, user may be logged out');
          setLoading(false);
          return;
        }

        console.log(`Fetching employer profile for user ID: ${userId}`);

        try {
          // Attempt to fetch the profile
          const response = await getProfileDetails(userId, userType);
          processProfileResponse(response, user || JSON.parse(await AsyncStorage.getItem('userDetails')));
        } catch (apiError) {
          console.error('API Error:', apiError.message);

          // Only set error if we have a user (not logged out)
          if (user) {
            setError(`Could not load profile: ${apiError.message}`);

            // Set minimal profile data so the UI can still render
            const fallbackData = user || (await AsyncStorage.getItem('userDetails') ? JSON.parse(await AsyncStorage.getItem('userDetails')) : null);

            if (fallbackData) {
              const fullName = fallbackData.full_name || fallbackData.name || 'Employer';

              // truncate if longer than 20 chars
              const truncatedName = fullName.length > 20 ? fullName.slice(0, 20) + "…" : fullName;

              setUserDetails({
                id: fallbackData.id,
                full_name: truncatedName,
                profile_image: fallbackData.profile_image || 'https://via.placeholder.com/150',
                role: fallbackData.role || 'Employer'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error setting up profile fetch:', error);
        // Only show error if not related to logout
        if (user) {
          setError('Could not access user data. Please log in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    const processProfileResponse = (response, fallbackUserData) => {
      if (!response || !response.data) {
        console.error('Invalid response received');
        setError('Received invalid data from server');
        return;
      }

      // console.log('API Response:', response.data);

      // Handle different response formats
      if (response.data && response.data.user) {
        setUserDetails(response.data.user);
      } else if (response.data && response.data.profile) {
        setUserDetails(response.data.profile);
      } else if (response.data && response.data.employer) {
        setUserDetails(response.data.employer);
      } else if (response.data && response.data.success) {
        // Sometimes the API returns the user data directly
        setUserDetails(response.data);
      } else if (response.data) {
        // Fallback to any data in the response
        setUserDetails(response.data);
      } else {
        // Fallback to user context/AsyncStorage data
        setUserDetails({
          id: fallbackUserData.id,
          full_name: fallbackUserData.full_name || fallbackUserData.name || 'Employer',
          profile_image: fallbackUserData.profile_image || 'https://via.placeholder.com/150',
          role: fallbackUserData.role || 'Employer'
        });
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleSignOut = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BE4145" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Determine if the LeftNav is active
  const isWeb = Platform.OS === 'web';
  return (
    <>
      {/* <View style={styles.container}> */}
      <View style={[styles.container, isWeb && styles.containerWeb]}>
        <View style={styles.topWhiteBackground}>
          <View style={styles.headerRow}>
            <Text style={styles.postedJobsTitle}></Text>
          </View>
        </View>


        {/* Profile content */}
        <View style={styles.profileContent}>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          {/* Profile Section - horizontal layout */}
          <View style={styles.profileSection}>
            <Image
              source={{
                uri: userDetails?.profile_image || 'https://via.placeholder.com/150',
              }}
              style={styles.profileImage}
            />
            <View style={styles.profileTextContainer}>
              <Text
                style={styles.profileName}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {userDetails?.full_name?.split(' ')[0]}
              </Text>
              <Text style={styles.roleText}>
                {formatRoleText(userDetails?.company_industry) || 'Employer'}
              </Text>
            </View>
          </View>


          <View style={styles.card}>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('EditEmployerProfile', { userId: userDetails?.id })}>
              <View style={styles.buttonContent}>
                <Ionicons name="pencil" size={20} color="#444444" />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#444444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.lastButtonContainer} onPress={() => navigation.navigate('HelpSupport')}>
              <View style={styles.buttonContent}>
                <Ionicons name="help-circle" size={20} color="#444444" />
                <Text style={styles.buttonText}>More Info</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#444444" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* <BottomNav activeuser="employer" /> */}

      {/* Conditionally render LeftNav for web and BottomNav for others
      {Platform.OS === 'web' ? (
        <LeftNav activeuser={"employer"} />
      ) : (
        <BottomNav activeuser={"employer"} />
      )} */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    // marginBottom: 72, // or 80 (nearest valid value) (Multiple of 8s)
    padding: 0,
    alignItems: 'center',
    marginBottom: 75,
  },
  containerWeb: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    // marginBottom: 72, // or 80 (nearest valid value) (Multiple of 8s)
    padding: 0,
    alignItems: 'center',
    marginBottom: 75,
    // paddingLeft: 150, // This should match the width of your LeftNav.js
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf7f2',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#444444',
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    color: '#BE4145',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular'
  },
  topWhiteBackground: {
    backgroundColor: '#BE4145', // changed
    paddingTop: 20, // from 58 to 24
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    ...Platform.select({
      web: {
        paddingBottom: 28, // This effectively makes paddingVertical 16 for web
      },
      // You can add other platforms like 'android' or 'ios' here if needed
      default: {
        paddingBottom: 0, // Explicitly keep it 0 for other platforms
      }
    }),
  },
  headerRow: {
    flexDirection: 'column', // changed from 'row' to 'column'
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  postedJobsTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18, // 20 -> 18
    color: '#ffffff',
    marginTop: 4,
    marginBottom: 8,
  },

  profileContent: {
    width: '100%',
    alignItems: 'center',
    // marginTop: 2,
    backgroundColor: '#f',
    marginTop: -8,
    // paddingTop: -12,
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    paddingVertical: 32, // Increased vertical padding
    paddingHorizontal: 32, // Increased horizontal padding
    // marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 24,
    width: '92%', // Slightly wider card
    alignSelf: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 96, // Slightly larger image
    height: 96, // Slightly larger image
    borderRadius: 45,
    marginRight: 50, // Increased right margin
    backgroundColor: '#f4f4f4',
    alignSelf: 'center',
    // marginBottom: 16,
    borderWidth: 0,
    shadowColor: '#b4b4b4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  profileTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -24, // Decreased left margin for spacing

  },

  profileName: {
    fontSize: 24, // Slightly larger font size
    color: '#333333',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 6, // Increased bottom margin
  },

  roleText: {
    color: '#666666',
    fontSize: 16, // Slightly larger font size
    fontFamily: 'Inter-Regular',
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    width: '92%',
    alignSelf: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  lastButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 20,
    borderBottomWidth: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333333',
    fontFamily: 'Inter-Regular',
  },
  signOutButton: {
    backgroundColor: '#BE4145',
    borderRadius: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    width: '92%',
    alignSelf: 'center',
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default EmployerProfile; 