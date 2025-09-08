import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfileDetails } from '../utils/api';
import BottomNav from '../component/BottomNav';
import { useAuth } from '../utils/AuthContext';
import { BackHandler } from 'react-native';

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


// Helper function to format role text
const formatRoleText = (role) => {
  if (!role) return 'Job Seeker';

  // Replace underscores with spaces and capitalize each word
  return role.replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const JobSeekerProfile = () => {
  const navigation = useNavigation();
  const [userDetails, setUserDetails] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, user } = useAuth();
  
  // // Handle Android back button to always go to MyJobs
  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener(
  //     "hardwareBackPress",
  //     () => {
  //       navigation.reset({
  //         index: 0,
  //         routes: [{ name: "JobListScreen" }],
  //       });
  //       return true; // prevent default pop
  //     }
  //   );

  //   return () => backHandler.remove();
  // }, [navigation]);


  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if user exists in the context
        if (!user || !user.id) {
          // If no user, just set loading to false and return early
          // This prevents the error when logging out
          setLoading(false);
          return;
        }

        // Use the exact userType value expected by the API
        const userType = 'job_seeker';
        console.log('Fetching profile for user ID:', user.id, 'userType:', userType);
        const response = await getProfileDetails(user.id, userType);
        console.log('API Response:', response.data);

        if (response.data && response.data.user) {
          setUserDetails(response.data.user);
          setUserId(response.data.user.id);
        } else if (response.data && response.data.profile) {
          // Alternative response format
          setUserDetails(response.data.profile);
          setUserId(response.data.profile.id);
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error retrieving user data:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }

        // Don't show error if user is null (logged out state)
        if (user) {
          setError('Failed to load profile. Please try again later.');

          // Use fallback to display at least basic info from auth context
          setUserDetails({
            id: user.id,
            full_name: user.full_name || 'User',
            profile_image: user.profile_image || 'https://via.placeholder.com/150',
            role: user.role || 'Job Seeker'
          });
          setUserId(user.id);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user]);

  const handleSignOut = async () => {
    // First call logout to clear the user data
    await logout();
    // Then navigate to UserTypeSelection
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

  return (
    <>
      <View style={styles.container}>
        <View style={styles.topWhiteBackground}>
          <View style={styles.headerRow}>
            <Text style={styles.homeTitle}></Text>
          </View>
          {/* <View style={styles.filters}>
            
          </View> */}
        </View>


        {/* Profile content */}
        <View style={styles.profileContent}>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Profile Section */}
          <View style={styles.profileSection}>
            {userDetails?.profile_image ? (
              <Image
                source={{ uri: userDetails.profile_image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderLogo}>
                <Text style={styles.logoText}>
                  {userDetails?.full_name?.split(' ')[0]?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}

            {/* Use the dedicated container style */}
            <View style={styles.profileTextContainer}>
              <Text
                style={styles.profileName}
                numberOfLines={1} // Only one line for the first name
                ellipsizeMode="tail"
              >
                {/* Logic to get the first name */}
                {userDetails?.full_name?.split(' ')[0] || 'User'}
              </Text>
              <Text style={styles.roleText}>
                {formatRoleText(userDetails?.role)}
              </Text>
            </View>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('EditProfile', { userId: userDetails?.id })}>
              <View style={styles.buttonContent}>
                <Ionicons name="pencil-outline" size={20} color="#444444" />
                <Text style={styles.buttonText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#444444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('JobSeekerDetails', { userId })}>
              <View style={styles.buttonContent}>
                <Ionicons name="document-text-outline" size={20} color="#444444" />
                <Text style={styles.buttonText}>Resume</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#444444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.lastButtonContainer} onPress={() => navigation.navigate('HelpSupport')}>
              <View style={styles.buttonContent}>
                <Ionicons name="help-circle-outline" size={20} color="#444444" />
                <Text style={styles.buttonText}>More Info</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#444444" />
            </TouchableOpacity>
          </View>
          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}

      </View>
      <BottomNav activeuser="job_seeker" />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    padding: 0,
    alignItems: 'center',
    marginBottom: 75,

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#444444',
    fontFamily: 'Inter-Regular'
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
    paddingTop: 16, // from 58 to 24
    paddingBottom: 0,
    paddingHorizontal: 16,
    zIndex: 1000,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'column', // changed from 'row' to 'column'
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0,
    width: '100%',
  },
  homeTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18, // 20 -> 18
    color: '#ffffff',
    marginBottom: 12,
  },
  profileContent: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#f4f2ee',
    marginTop: -28,
    paddingTop: 16,
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
  placeholderLogo: {
    width: 96,
    height: 96,
    borderRadius: 45, // makes it circular
    backgroundColor: '#ddd', // fallback bg color
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: '#b4b4b4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#555',
  },


  profileTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16, // Decreased left margin for spacing

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
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    width: '92%',
    alignSelf: 'center',
    // Remove shadow
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

export default JobSeekerProfile;
