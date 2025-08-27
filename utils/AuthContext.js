import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the AuthContext
export const AuthContext = createContext();

// Create a hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to load user data from AsyncStorage on app startup
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        console.log('Loading user data from AsyncStorage...');
        const userDataString = await AsyncStorage.getItem('userDetails');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          console.log('User data loaded successfully');
          setUser(userData);
        } else {
          console.log('No user data found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Login function
  const login = async (userData) => {
    try {
      console.log('Saving user data to AsyncStorage:', userData.id);
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('userDetails', JSON.stringify(userData));
      // Update state
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out user');
      
      // First clear the user state to prevent components from trying to access user data
      setUser(null);
      
      // Remove all user-related data from AsyncStorage
      console.log('Removing user data from AsyncStorage');
      await AsyncStorage.removeItem('userDetails');
      
      // Clear any other user-related data in AsyncStorage
      // This helps ensure a clean logout
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userId');
        console.log('Cleared additional user data from AsyncStorage');
      } catch (clearError) {
        // Non-critical error, just log it
        console.log('Note: Could not clear some additional user data:', clearError);
      }
      
      console.log('Logout successful');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if there's an error, try to set user to null to ensure UI updates
      setUser(null);
      
      // Return true anyway to allow navigation to continue
      // This prevents users from getting stuck if AsyncStorage operations fail
      return true;
    }
  };

  // Update user data
  const updateUser = async (updatedUserData) => {
    try {
      // Get existing user data
      const existingUserDataString = await AsyncStorage.getItem('userDetails');
      if (existingUserDataString) {
        const existingUserData = JSON.parse(existingUserDataString);
        // Merge existing and updated data
        const mergedUserData = { ...existingUserData, ...updatedUserData };
        console.log('Updating user data in AsyncStorage');
        // Store updated data
        await AsyncStorage.setItem('userDetails', JSON.stringify(mergedUserData));
        // Update state
        setUser(mergedUserData);
      }
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!user;
  };

  // Get user type (job_seeker or employer)
  const getUserType = () => {
    if (!user) return null;
    
    // More robust user type detection with logging
    const userType = user.userType || user.type || user.user_type;
    
    if (userType) {
      // Return the detected user type, normalized to our expected values
      if (userType.toLowerCase().includes('employer')) {
        return 'employer';
      } else if (userType.toLowerCase().includes('job') || 
                userType.toLowerCase().includes('seeker')) {
        return 'job_seeker';
      }
      
      // Otherwise return the original value
      return userType;
    }
    
    // If no user type is specified at all, log it and default to job_seeker
    console.log('No user type detected in user object, defaulting to job_seeker');
    return 'job_seeker';
  };

  // Check if employer account is active
  const isEmployerActive = () => {
    if (!user || user.userType !== 'employer') return true; // Return true for non-employers
    
    // Check all possible status property names
    const userStatus = user.status || 
                      user.Status || 
                      user.accountStatus ||
                      user.account_status || 
                      'unknown';
    
    return userStatus.toLowerCase() === 'active';
  };

  // The value to be provided to consumers of this context
  const authContextValue = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isLoggedIn,
    getUserType,
    isEmployerActive,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 