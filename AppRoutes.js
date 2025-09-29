// // AppRouter.js
// import React from 'react';
// import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import Login from './pages/Login';
// import ValidateLogin from './pages/ValidateLogin';
// import JobSeekerRegistration from './pages/JobSeekerRegistration';
// import JobListScreen from './pages/JobListScreen';
// import JobDetailsScreen from './pages/JobDetailsScreen';
// import JobSeekerProfile from './pages/JobSeekerProfile';
// import EditProfile from './pages/EditProfile';
// import AppliedJobsScreen from './pages/AppliedJobsScreen';
// import EmployerRegistration from './pages/Employer/EmployerRegistration';
// import EmployerPostJob from './pages/Employer/EmployerPostJob';
// import ApplicationReceived from './pages/Employer/ApplicationReceived';
// import ShortlistedCandidates from './pages/Employer/ShortlistedCandidates';
// import MyJobs from './pages/Employer/MyJobs';
// import CandidateDetails from './pages/Employer/CandidateDetails';
// import EmployerProfile from './pages/Employer/EmployerProfile';
// import EditEmployerProfile from './pages/Employer/EditEmployerProfile';
// import Setting from './pages/Setting';
// import HelpSupport from './pages/HelpSupport';
// import JobSeekerDetails from './pages/JobSeekerDetails';
// import PostJobForm from './pages/Employer/PostJobForm';
// import { useAuth } from './utils/AuthContext';
// import EmployerReview from './pages/Employer/EmployerReview';
// import { CardStyleInterpolators } from '@react-navigation/stack';
// import { Ionicons } from '@expo/vector-icons';
// import WebLayout from './WebLayout'; // Import the layout component


// AppRouter.js
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native'; // Added Platform
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import WebLayout from './WebLayout'; // Import the layout component

// --- All your screen imports remain the same ---
import Login from './pages/Login';
import ValidateLogin from './pages/ValidateLogin';
import JobSeekerRegistration from './pages/JobSeekerRegistration';
import JobListScreen from './pages/JobListScreen';
import JobDetailsScreen from './pages/JobDetailsScreen';
import JobSeekerProfile from './pages/JobSeekerProfile';
import EditProfile from './pages/EditProfile';
import AppliedJobsScreen from './pages/AppliedJobsScreen';
import EmployerRegistration from './pages/Employer/EmployerRegistration';
import EmployerPostJob from './pages/Employer/EmployerPostJob';
import ApplicationReceived from './pages/Employer/ApplicationReceived';
import ShortlistedCandidates from './pages/Employer/ShortlistedCandidates';
import MyJobs from './pages/Employer/MyJobs';
import CandidateDetails from './pages/Employer/CandidateDetails';
import EmployerProfile from './pages/Employer/EmployerProfile';
import EditEmployerProfile from './pages/Employer/EditEmployerProfile';
import Setting from './pages/Setting';
import HelpSupport from './pages/HelpSupport';
import JobSeekerDetails from './pages/JobSeekerDetails';
import PostJobForm from './pages/Employer/PostJobForm';
import { useAuth } from './utils/AuthContext';
import EmployerReview from './pages/Employer/EmployerReview';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
const Stack = createStackNavigator();

const LoadingScreen = () => (
  <SafeAreaView style={styles.loadingContainer}>
    <StatusBar barStyle="dark-content" backgroundColor="#faf7f2" />
    <ActivityIndicator size="large" color="#BE4145" />
    <Text style={styles.loadingText}>Loading...</Text>
  </SafeAreaView>
);

const ErrorScreen = ({ message, onRetry }) => (
  <SafeAreaView style={styles.errorContainer}>
    <StatusBar barStyle="dark-content" backgroundColor="#faf7f2" />
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    )}
  </SafeAreaView>
);

const AppRouter = () => {
  const { loading, isLoggedIn, getUserType, isEmployerActive, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Your initial route logic remains exactly the same
  let initialRoute = 'Login';
  if (isLoggedIn()) {
    const userType = getUserType();
    if (userType === 'employer') {
      const isActive = isEmployerActive();
      if (isActive) {
        initialRoute = 'MyJobs';
      } else {
        initialRoute = 'EmployerReview';
      }
    } else {
      initialRoute = 'JobList';
    }
  }

  // We define the Stack Navigator here
  const AppStack = (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        animationEnabled: false,
        headerStyle: {
          backgroundColor: '#be4145',
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0,
          headerStatusBarHeight: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          color: '#fff',
          fontFamily: 'Montserrat-SemiBold',
          fontSize: 18,
          fontWeight: '600',
        },
        headerTitleAlign: 'center', // Center the header title
        headerSafeAreaInsets: { top: 0, headerStatusBarHeight: 0 }, // Ensure no extra top padding
        cardStyle: { backgroundColor: '#f4f2ee' }, // Set background color for all screens
      }}
    >
      {/* Authentication routes */}

      <Stack.Screen
        name="Login"
        component={Login}
        options={({ navigation }) => ({
          title: 'Login',
          headerShown: false,
          headerLeft: () => (
            <Ionicons
              name="arrow-back"
              size={24}
              color="#000"
              style={{ marginLeft: 16, position: 'absolute', left: 0, right: 0, alignSelf: 'center' }}
              onPress={() => navigation.goBack()}
            />
          ),
        })}
      />
      <Stack.Screen
        name="ValidateLogin"
        component={ValidateLogin}
        options={{
          title: 'Verify OTP',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            // mm
          },
        }}
      />
      <Stack.Screen
        name="JobSeekerRegistration"
        component={JobSeekerRegistration}
        options={{
          title: 'Job Seeker Registration',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="EmployerRegistration"
        component={EmployerRegistration}
        options={{
          title: 'Employer Registration',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />

      {/* Job Seeker routes */}
      <Stack.Screen
        name="JobList"
        component={JobListScreen}
        options={{ title: 'Jobs List', headerShown: false }}
      />
      <Stack.Screen
        name="JobDetails"
        component={JobDetailsScreen}
        options={{
          title: 'Job Details',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="JobSeekerDetails"
        component={JobSeekerDetails}
        options={{
          title: 'Resume Details',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="JobSeekerProfile"
        component={JobSeekerProfile}
        options={{ title: 'My Profile', headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          title: 'Edit Profile',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="AppliedJobs"
        component={AppliedJobsScreen}
        options={{ title: 'Applied Jobs', headerShown: false }}
      />

      {/* Employer routes */}
      <Stack.Screen
        name="MyJobs"
        component={MyJobs}
        options={{ title: 'My Jobs', headerShown: false }}
      />
      <Stack.Screen
        name="EmployerReview"
        component={EmployerReview}
        options={{
          title: 'Review Profile',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="PostJobForm"
        component={PostJobForm}
         options={{ title: 'Post a Job', headerShown: false }}
      />
      <Stack.Screen
        name="ApplicationReceived"
        component={ApplicationReceived}
        options={{
          title: 'Candidates',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="ShortlistedCandidates"
        component={ShortlistedCandidates}
        options={{
          title: 'Shortlisted Candidates',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="EmployerProfile"
        component={EmployerProfile}
        options={{ title: 'Profile', headerShown: false }}
      />
      <Stack.Screen
        name="CandidateDetails"
        component={CandidateDetails}
        options={{
          title: 'Applicant Details',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            // padding: '8%',
          },
        }}
      />
      <Stack.Screen
        name="EditEmployerProfile"
        component={EditEmployerProfile}
        options={{
          title: 'Edit Profile',
          headerShown: false,
        }}
      />

      {/* Common routes */}
      <Stack.Screen
        name="Setting"
        component={Setting}
        options={{
          title: 'Setting',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupport}
        options={{
          title: 'More Info',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#be4145',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
    </Stack.Navigator>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f2ee' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f2ee" />
      {/* This is the crucial change:
              On web, we wrap the Stack Navigator with the WebLayout.
              On mobile, we render it directly.
              This ensures LeftNav is always inside the navigation context.
            */}
      {/* {Platform.OS === 'web' ? (
        <WebLayout>
          {AppStack}
        </WebLayout>
      ) : (
        AppStack
      )} */}
      <WebLayout>
        {AppStack}
      </WebLayout>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf7f2',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf7f2',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    color: '#BE4145',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#444444',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#BE4145',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default AppRouter;
