import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, BackHandler, ActivityIndicator, Platform
} from 'react-native';
import WorkezyLogo from '../assets/workezyLogo.png';
// countries import removed as it wasn't used
import { requestOTP } from '../utils/api';
import CustomAlert from '../components/CustomAlert';
import { useAuth } from '../utils/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// 1. Import the hook to detect device type
import { useDeviceType } from '../utils/detectDeviceHook';

const Login = ({ navigation, route }) => {
  const { activeProfile = true } = route.params || {};
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry] = useState({
    code: 'IN',
    callingCode: '+91',
  });
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    message: '',
    type: 'info'
  });
  const { isLoggedIn, getUserType } = useAuth();
  // 2. Use the hook and determine if it's desktop web
  const { isDesktop } = useDeviceType();
  const isDesktopWeb = Platform.OS === 'web' && isDesktop;

  // Check for existing login
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoggedIn()) {
        const userType = getUserType();

        // Navigate based on user type
        if (userType === 'employer') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MyJobs' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'JobList' }],
          });
        }
      }
    };

    checkAuth();
  }, [isLoggedIn, getUserType, navigation]);

  // 3. Add a useEffect to default to 'employer' on desktop web
  useEffect(() => {
    if (isDesktopWeb) {
      // Ensure the "Hire Candidates" toggle is active on desktop
      if (activeProfile) { // only set params if it's not already correct
        navigation.setParams({ activeProfile: false });
      }
    }
  }, [isDesktopWeb, navigation, activeProfile]);


  // Helper functions for alert
  const showAlert = (message, type = 'info') => {
    setAlertConfig({
      visible: true,
      message,
      type
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return false;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleMobile = (text) => {
    // Allow only numeric values & trim to 10 digits
    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 10);
    setMobile(cleanedText);
  };

  const handleRequestOTP = async () => {
    if (!mobile || mobile.length !== 10) {
      showAlert("Enter a valid 10-digit mobile number.", "error");
      return;
    }

    setIsLoading(true);

    const payload = {
      mobile: mobile,
      // This is the fix: It now checks if it's desktop web and forces 'employer'.
      // Otherwise, it uses the existing toggle logic.
      userType: isDesktopWeb ? 'employer' : (activeProfile ? 'job_seeker' : 'employer')
    };

    try {
      const response = await requestOTP(payload);
      if (response.data && response.data.otpToken) {
        navigation.navigate("ValidateLogin", {
          mobile: mobile,
          otpToken: response.data.otpToken,
          // We also ensure the correct state is passed to the next screen
          activeProfile: isDesktopWeb ? false : activeProfile,
          selectedCountry
        });
      } else {
        showAlert("Failed to send OTP. Please try again.", "error");
      }
    } catch (error) {
      console.log("Error requesting OTP:", error);
      showAlert(
        error.response?.data?.message ||
        "Please check your connection and try again.",
        "error"
      );
      setTimeout(() => {
        hideAlert()
      }, 2000)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={WorkezyLogo} style={styles.brandLogo} />
      <Text style={styles.title}>Verify Your Phone</Text>
      <Text style={styles.subtitle}>We will send a verification code to confirm your phone number</Text>

      {/* This entire section is now conditional and will be hidden on desktop web */}
      {!isDesktopWeb && (
        <>
          <Text style={styles.sectionLabel}>I want to</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleButton, activeProfile ? styles.toggleActive : styles.toggleInactive]}
              onPress={() => navigation.setParams({ activeProfile: true })}
            >
              <View style={styles.toggleButtonContent}>
                <Ionicons name="person-outline" size={18} color={activeProfile ? '#be4145' : '#666666'} style={styles.toggleIcon} />
                <Text style={[styles.toggleButtonText, activeProfile ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive]}>Find a Job</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, !activeProfile ? styles.toggleActive : styles.toggleInactive]}
              onPress={() => navigation.setParams({ activeProfile: false })}
            >
              <View style={styles.toggleButtonContent}>
                <MaterialCommunityIcons name="briefcase-outline" size={18} color={!activeProfile ? '#be4145' : '#666666'} style={styles.toggleIcon} />
                <Text style={[styles.toggleButtonText, !activeProfile ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive]}>Hire Candidates</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={[styles.inputContainer, { borderColor: mobile.length === 10 ? '#BE4145' : '#e0e0e0' }]}>
        <Text style={styles.callingCodeText}>{selectedCountry.callingCode}</Text>
        <View style={styles.separator} />
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          placeholderTextColor="#b4b4b4"
          keyboardType="phone-pad"
          maxLength={10}
          value={mobile}
          onChangeText={handleMobile}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, (mobile.length !== 10 || isLoading) && styles.disabledButton]}
        activeOpacity={0.8}
        disabled={mobile.length !== 10 || isLoading}
        onPress={handleRequestOTP}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {isDesktopWeb
              ? 'Continue as Employer'
              : (activeProfile ? 'Continue as Job Seeker' : 'Continue as Employer')}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.termsText}>By continuing, you agree to our</Text>
      <View style={styles.termsRow}>
        <TouchableOpacity><Text style={styles.termsLink}>Terms and Conditions</Text></TouchableOpacity>
        <Text style={styles.termsDivider}> & </Text>
        <TouchableOpacity><Text style={styles.termsLink}>Privacy Policy</Text></TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f2ee',
    padding: 24,
  },
  toggleButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  toggleIcon: {
    marginRight: 0,
    marginBottom: 4,
  },
  brandLogo: {
    width: 140,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
    width: '100%',
  },
  toggleButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  // 6. Add style for the single button on desktop
  desktopToggleButton: {
    flex: 0, // Remove flex so it doesn't expand
    width: 'auto', // Give it a specific width
    maxWidth: 300, // And a max width
    paddingHorizontal: 46,
  },
  toggleActive: {
    borderColor: '#be4145',
    backgroundColor: '#fff5f3',
  },
  toggleInactive: {
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  toggleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  toggleButtonTextActive: {
    color: '#be4145',
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
  },
  toggleButtonTextInactive: {
    color: '#666666',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  callingCodeText: {
    fontSize: 16,
    color: '#333333',
    fontFamily: 'Inter-Regular',
    marginRight: 8,
  },
  separator: {
    width: 2,
    height: 24,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    borderColor: "#fff",
    borderWidth: 2
  },
  primaryButton: {
    width: '100%',
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#be4145',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
  disabledButton: {
    backgroundColor: '#b4b4b4',
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  termsLink: {
    color: '#45a6be',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'underline',
    marginHorizontal: 2,
  },
  termsDivider: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

export default Login;

