import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { verifyOTP, requestOTP } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';
import { useAuth } from '../utils/AuthContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';


const ValidateLogin = ({ route, navigation }) => {
  const { mobile, otpToken, activeProfile, selectedCountry } = route.params;
  const [otpTokens, setOptTokens] = useState(otpToken);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const userType = activeProfile ? 'job_seeker' : 'employer';
  const [timer, setTimer] = useState(30); // Timer state (starting at 30 seconds)
  const [isResendVisible, setIsResendVisible] = useState(false); // To control resend button visibility
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    message: '',
    type: 'info'
  });
  const { login } = useAuth();
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Refs for OTP input fields
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Update OTP values and handle navigation between input boxes
  const handleOtpChange = (text, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = text.slice(0, 1); // Only accept 1 character
    setOtp(updatedOtp);

    // Focus on the next input if a valid digit is entered
    if (text && index < otpRefs.length - 1) {
      otpRefs[index + 1].current.focus();
    }
  };

  // Handle backward navigation when deleting
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus(); // Move to the previous input
    }
  };

  // Handle paste functionality
  const handlePaste = async (text, index) => {
    // Check if the pasted text is a 4-digit number
    if (text.length === 4 && /^\d+$/.test(text)) {
      // Split the pasted text into individual digits
      const digits = text.split('');

      // Update all OTP boxes with the pasted digits
      setOtp(digits);

      // Focus on the last input box
      otpRefs[3].current.focus();
    } else {
      // If not a 4-digit number, handle as a single character
      handleOtpChange(text, index);
    }
  };

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

  // Validate OTP input
  const handleValidation = async () => {
    const enteredOTP = otp.join('');

    if (enteredOTP.length !== 4) {
      showAlert('Please enter a 4-digit OTP.', 'error');
      setTimeout(() => hideAlert(), 1000);
      return;
    }

    setIsLoading(true);

    const payload = {
      mobile: mobile,
      otp: enteredOTP,
      otpToken: otpTokens,
      userType: userType,
    };

    try {
      const response = await verifyOTP(payload);

      if (response && response.data) {
        if (response.data.newUser) {
          // New user - redirect to registration
          if (activeProfile) {
            navigation.replace("JobSeekerRegistration", {
              mobile: mobile,
              countryCode: selectedCountry.callingCode
            });
          } else {
            navigation.replace("EmployerRegistration", {
              mobile: mobile,
              countryCode: selectedCountry.callingCode
            });
          }
        } else if (response.data.user) {
          // Existing user - login and redirect
          // Ensure the userType is explicitly set before login
          if (!response.data.user.userType) {
            console.log('Setting user type explicitly:', activeProfile ? 'job_seeker' : 'employer');
            response.data.user.userType = activeProfile ? 'job_seeker' : 'employer';
          }

          // Make sure user type is normalized
          const normalizedType = activeProfile ? 'job_seeker' : 'employer';
          if (response.data.user.userType !== normalizedType) {
            console.log(`Normalizing user type from ${response.data.user.userType} to ${normalizedType}`);
            response.data.user.userType = normalizedType;
          }

          try {
            const loginSuccess = await login(response.data.user);

            if (loginSuccess) {
              if (activeProfile) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'JobList' }],
                });
              } else {
                // For employer: check status with multiple property possibilities
                const userStatus = response.data.user.status ||
                  response.data.user.Status ||
                  response.data.user.accountStatus ||
                  response.data.user.account_status ||
                  'unknown';

                if (userStatus && userStatus.toLowerCase() === 'active') {
                  // If status is active, navigate to MyJobs
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'MyJobs' }],
                  });
                } else {
                  // If status is not active, navigate to EmployerReview
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'EmployerReview' }],
                  });
                }
              }
            } else {
              showAlert('Failed to save user session. Please try again.', 'error');
              setTimeout(() => hideAlert(), 1000);
            }
          } catch (loginError) {
            console.error('Login error:', loginError);
            showAlert('Error during login process. Please try again.', 'error');
            setTimeout(() => hideAlert(), 1000);
          }
        } else {
          showAlert('Unexpected response from server. Please try again.', 'error');
          setTimeout(() => hideAlert(), 1000);
        }
      } else {
        showAlert('Invalid OTP or verification failed. Please try again.', 'error');
        setTimeout(() => hideAlert(), 1000);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showAlert(
        error.response?.data?.message ||
        'OTP verification failed. Please check your connection and try again.',
        'error'
      );
      setTimeout(() => hideAlert(), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Start the timer countdown on component mount or when timer is reset
  useEffect(() => {
    if (timer === 0) {
      setIsResendVisible(true); // Show Resend OTP button when timer reaches 0
      return; // Stop the countdown
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1); // Decrease timer by 1 second
    }, 1000);

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [timer]);

  // Resend OTP function (reset timer)
  const handleResendOtp = async () => {
    setIsResending(true);

    try {
      const payload = {
        mobile: mobile,
        userType: userType
      };

      const response = await requestOTP(payload);

      if (response?.data?.otpToken) {
        setOptTokens(response.data.otpToken);
        setOtp(['', '', '', '']);
        setTimer(30);
        setIsResendVisible(false);
        showAlert('OTP resent successfully!', 'success');
        setTimeout(() => {
          hideAlert();
        }, 1000);
      } else {
        showAlert('Failed to resend OTP. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showAlert(
        error.response?.data?.message ||
        'Failed to send OTP. Please check your connection.',
        'error'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      {/* OTP Instruction and Input Boxes */}
      {/* Manual Header */}
      <View style={styles.manualHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Verify OTP
          </Text>
        </View>
      </View>

      <View style={styles.topContainer}>
        <Text style={styles.infoText}>
          We sent an OTP to your mobile number +91{mobile}
        </Text>
        <View style={styles.otpContainer}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              style={[
                styles.otpBox,
                focusedIndex === index ? styles.otpBoxFocused : null,
                alertConfig.type === 'error' ? styles.otpBoxError : null
              ]}
              keyboardType="number-pad"
              maxLength={4}
              value={value}
              onChangeText={(text) => handlePaste(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              ref={otpRefs[index]}
              contextMenuHidden={true}
              editable={!isLoading}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
            />
          ))}
        </View>

        {/* Timer or Resend Button */}
        {isResendVisible ? (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
            <Text style={{ color: '#666', fontFamily: 'Inter-Regular', fontSize: 14 }}>
              Didn't receive code?{' '}
            </Text>
            <TouchableOpacity onPress={handleResendOtp} disabled={isResending}>
              <Text style={[
                styles.resendText,
                isResending && styles.resendDisabled
              ]}>
                {isResending ? 'Sending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.timerText}>{`Resend OTP in ${timer} seconds`}</Text>
        )}
      </View>

      {/* Validate OTP Button */}
      <TouchableOpacity
        style={[
          styles.button,
          (otp.join('').length !== 4 || isLoading) ? styles.buttonDisabled : null
        ]}
        onPress={handleValidation}
        disabled={otp.join('').length !== 4 || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>

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
    // paddingHorizontal: 24,
    backgroundColor: '#f4f2ee', // base color change from f9f9f9 to FDF7F2 for consistency
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },

  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // This centers the title container
    backgroundColor: '#ffffff', // White background
    height: 56, // A standard header height
    paddingHorizontal: 16,
    borderBottomWidth: 1, // Creates the subtle separator line
    borderBottomColor: '#e0e0e0', // Light gray color for the line
    // width: 750,
  },
  backButton: {
    position: 'absolute', // Position it independently of the title
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center', // Center the icon vertically
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center', // Center title horizontally
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#333333', // Dark text color
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
  },

  topContainer: {
    marginTop: 120,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  otpBox: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    fontFamily: 'Inter-Regular',
    color: '#222222',
  },
  otpBoxError: {
    borderColor: '#be4145',
  },
  otpBoxFocused: {
    borderColor: '#be4145',
  },
  timerText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  resend: {
    fontSize: 14,
    color: '#45a6be',
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#45a6be',
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: '#b4b4b4',
    textDecorationLine: 'none',
  },
  button: {
    width: '90%',
    minHeight: 44,
    backgroundColor: '#be4145',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 32,
    alignSelf: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#b4b4b4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
});

export default ValidateLogin;
