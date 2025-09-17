import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, TextInput, Platform, Modal, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getProfileDetails, updateProfile, uploadImage, requestOTP, verifyOTP, checkMobileExists } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';

const EditProfile = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = route.params;
  const userType = 'job_seeker'


  // State Variables
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    profileImage: '',
    email: '',
    phone: '',
    city: "",
    state: '',
    country: '',
    experience: 0,
    industry: '',
    gender: "",
    highestEducation: '',
    education: {
      tenthBoard: '', tenthPercentage: '', tenthYear: '',
      twelfthBoard: '', twelfthPercentage: '', twelfthYear: '',
      ugBoard: '', ugPercentage: "", ugYear: '',
      pg: '', phd: ''
    },
    dateOfBirth: '',
  });

  // Dropdown states
  // track which dropdown is currently open – ensures only one open at a time
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [genderItems, setGenderItems] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ]);

  const [educationItems, setEducationItems] = useState([
    { label: "10th Pass", value: "10th" },
    { label: "12th Pass", value: "12th" },
    { label: "Graduate", value: "UG" },
    { label: "Post Graduate", value: "PG" },
  ]);

  const [stateItems, setStateItems] = useState([
    { label: 'Andaman and Nicobar Islands', value: 'Andaman and Nicobar Islands' },
    { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
    { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
    { label: 'Assam', value: 'Assam' },
    { label: 'Bihar', value: 'Bihar' },
    { label: 'Chandigarh', value: 'Chandigarh' },
    { label: 'Chhattisgarh', value: 'Chhattisgarh' },
    { label: 'Daman and Diu', value: 'Dadra and Nagar Haveli and Daman and Diu' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Goa', value: 'Goa' },
    { label: 'Gujarat', value: 'Gujarat' },
    { label: 'Haryana', value: 'Haryana' },
    { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
    { label: 'Jammu and Kashmir', value: 'Jammu and Kashmir' },
    { label: 'Jharkhand', value: 'Jharkhand' },
    { label: 'Karnataka', value: 'Karnataka' },
    { label: 'Kerala', value: 'Kerala' },
    { label: 'Ladakh', value: 'Ladakh' },
    { label: 'Lakshadweep', value: 'Lakshadweep' },
    { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
    { label: 'Maharashtra', value: 'Maharashtra' },
    { label: 'Manipur', value: 'Manipur' },
    { label: 'Meghalaya', value: 'Meghalaya' },
    { label: 'Mizoram', value: 'Mizoram' },
    { label: 'Nagaland', value: 'Nagaland' },
    { label: 'Odisha', value: 'Odisha' },
    { label: 'Puducherry', value: 'Puducherry' },
    { label: 'Punjab', value: 'Punjab' },
    { label: 'Rajasthan', value: 'Rajasthan' },
    { label: 'Sikkim', value: 'Sikkim' },
    { label: 'Tamil Nadu', value: 'Tamil Nadu' },
    { label: 'Telangana', value: 'Telangana' },
    { label: 'Tripura', value: 'Tripura' },
    { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
    { label: 'Uttarakhand', value: 'Uttarakhand' },
    { label: 'West Bengal', value: 'West Bengal' }
  ]);

  const [industryItems, setIndustryItems] = useState([
    { label: "Accountant", value: "accountant" },
    { label: "Admin", value: "admin" },
    { label: "Airport Ground Staff", value: "airport_ground_staff" },
    { label: "Airport Operations", value: "airport_operations" },
    { label: "Barista", value: "barista" },
    { label: "Bartender", value: "bartender" },
    { label: "Beautician", value: "beautician" },
    { label: "Business Development", value: "business_development" },
    { label: "Cabin Crew", value: "cabin_crew" },
    { label: "Compounder", value: "compounder" },
    { label: "Cook / Chef", value: "cook_chef" },
    { label: "Driver", value: "driver" },
    { label: "Factory Manager", value: "factory_manager" },
    { label: "Factory Supervisor", value: "factory_supervisor" },
    { label: "Field Sales", value: "field_sales" },
    { label: "Graphic Designer", value: "graphic_designer" },
    { label: "Gym Trainer", value: "gym_trainer" },
    { label: "Hair Stylist", value: "hair_stylist" },
    { label: "Hotel Executive", value: "hotel_executive" },
    { label: "Hotel Manager", value: "hotel_manager" },
    { label: "Lab Technician", value: "lab_technician" },
    { label: "Nurse", value: "nurse" },
    { label: "Procurement / Purchase", value: "procurement_purchase" },
    { label: "Receptionist", value: "receptionist" },
    { label: "Sales Counsellor", value: "sales_counsellor" },
    { label: "Seaman", value: "seaman" },
    { label: "Security Bouncer", value: "security_bouncer" },
    { label: "Security Officer", value: "security_officer" },
    { label: "Store Manager", value: "store_manager" },
    { label: "Supply Chain", value: "supply_chain" },
    { label: "Tailor", value: "tailor" },
    { label: "Teacher", value: "teacher" },
    { label: "Technician", value: "technician" },
    { label: "Web Developer", value: "web_developer" },
    { label: "Warehouse", value: "warehouse" },
    { label: "Yoga / Zumba Instructor", value: "yoga_zumba_instructor" },
  ]);

  const ExperienceItems = [
    { label: 'Fresher', value: 'fresher' },
    { label: '1-2 Years', value: '1-2years' },
    { label: '3-5 Years', value: '3-5years' },
    { label: '6-8 Years', value: '6-8years' },
    { label: '9-12 Years', value: '9-12years' },
    { label: '13-15 Years', value: '13-15years' },
    { label: '15+ Years', value: '15+years' },
  ];

  // Phone verification states
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isResendVisible, setIsResendVisible] = useState(false);
  const [otpToken, setOtpToken] = useState('');

  // Refs for OTP input fields
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Timer effect
  useEffect(() => {
    if (timer === 0) {
      setIsResendVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Handle OTP input change
  const handleOtpChange = (text, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = text.slice(0, 1);
    setOtp(updatedOtp);

    if (text && index < otpRefs.length - 1) {
      otpRefs[index + 1].current.focus();
    }
  };

  // Handle backspace in OTP input
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Handle paste functionality
  const handlePaste = async (text, index) => {
    if (text.length === 4 && /^\d+$/.test(text)) {
      const digits = text.split('');
      setOtp(digits);
      otpRefs[3].current.focus();
    } else {
      handleOtpChange(text, index);
    }
  };

  // Handle phone number edit
  const handlePhoneEdit = () => {
    setIsEditingPhone(true);
    setNewPhoneNumber(''); // clear the input
    setIsPhoneVerified(false);
    setShowOtpInput(false);
    setOtp(['', '', '', '']);
    setTimer(30);
    setIsResendVisible(false);
  };

  // Handle phone number change and OTP request
  const handlePhoneChange = async () => {
    if (!newPhoneNumber || newPhoneNumber.length !== 10) {
      showAlert('Error', 'Please enter a valid 10-digit phone number');
      setTimeout(() => hideAlert(), 1000);
      return;
    }

    setIsLoading(true);

    try {
      // Check if mobile number already exists
      const checkResponse = await checkMobileExists({
        mobile: newPhoneNumber,
        userType: 'job_seeker'
      });

      if (checkResponse.data.exists) {
        showAlert('', 'This mobile number is already used.', 'error');
        setIsLoading(false);
        return;
      }

      // If not exists, proceed to request OTP
      const response = await requestOTP({
        mobile: newPhoneNumber,
        userType: 'job_seeker'
      });

      if (response.data && response.data.otpToken) {
        setOtpToken(response.data.otpToken);
        setShowOtpInput(true);
        setTimer(30);
        setIsResendVisible(false);
        showAlert('', 'OTP sent successfully', 'success');
        setTimeout(() => hideAlert(), 1000);
      } else {
        showAlert('Error', 'Failed to send OTP', 'error');
      }
    } catch (error) {
      console.log(error)
      showAlert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join('');
    if (enteredOTP.length !== 4) {
      showAlert('Please enter a valid 4-digit OTP');

      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOTP({
        mobile: newPhoneNumber,
        otp: enteredOTP,
        otpToken: otpToken,
        userType: 'job_seeker'
      });
      console.log(response.data)

      if (response.data && response.data.success) {
        setFormData(prev => ({ ...prev, phone: newPhoneNumber }));
        setIsPhoneVerified(true);
        setIsEditingPhone(false);
        setShowOtpInput(false);
        setOtp(['', '', '', '']);
        showAlert('Phone number verified successfully');
        setTimeout(() => hideAlert(), 1000);
      } else {
        showAlert('', 'Invalid OTP. Please try again.');
        setTimeout(() => hideAlert(), 1000);
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to verify OTP');
      setTimeout(() => hideAlert(), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    message: '',
    type: 'info',
    title: '',
  });

  const [openDay, setOpenDay] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  // Helper to get days in a month
  const getDaysInMonth = (month, year) => {
    if (!month || !year) return 31;
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (isNaN(m) || isNaN(y)) return 31;
    return new Date(y, m, 0).getDate();
  };

  // Dynamically update days array based on selected month/year
  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => ({ label: String(i + 1).padStart(2, '0'), value: String(i + 1).padStart(2, '0') }));

  const months = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => ({
    label: String(currentYear - i - 18),
    value: String(currentYear - i - 18)
  }));

  const [errors, setErrors] = useState({
    full_name: '',
    email: '',
    city: '',
    state: '',
    country: '',
    experience: '',
    industry: '',
    gender: '',
    highestEducation: '',
    dateOfBirth: ''
  });

  // Add state for image uploading
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getProfileDetails(userId, userType);
        const userData = response.data;
        console.log("User Data:", userData);
        // Parse the date of birth if it exists
        let day = '', month = '', year = '';
        if (userData.user.dob) {
          const date = new Date(userData.user.dob);
          day = String(date.getDate()).padStart(2, '0');
          month = String(date.getMonth() + 1).padStart(2, '0');
          year = String(date.getFullYear());

          // Set the selected values for the dropdowns
          setSelectedDay(day);
          setSelectedMonth(month);
          setSelectedYear(year);
        }
        console.log("Experience Years:", userData.user.experience_years);
        setFormData({
          full_name: userData.user.full_name || '',
          profileImage: userData.user.profile_image || '',
          email: userData.user.email || '',
          phone: userData.user.phone || '',
          city: userData.user.city || '',
          state: userData.user.state || '',
          country: userData.user.country || '',
          experience: userData.user.experience_years || '',
          industry: userData.user.role || '',
          gender: userData.user.gender || "",
          highestEducation: userData.user.highest_education || null,
          education: userData.user.education || {
            tenthBoard: '', tenthPercentage: '', tenthYear: '',
            twelfthBoard: '', twelfthPercentage: '', twelfthYear: '',
            ugBoard: '', ugPercentage: '', ugYear: '',
            pg: '', phd: ''
          },
          dateOfBirth: userData.user.dob || '',
        });
        console.log("formData:", formData.experience);
        setProfileImage(userData.user.profile_image)
        console.log("userData : ", userData.user)

        if (userData.profileImage) {
          setProfileImage(userData.profileImage);
        }
      } catch (error) {
        showAlert("Error", "Failed to fetch user data", "error");
        console.log(error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle Input Changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleEducationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      education: { ...prev.education, [field]: value }
    }));
  };

  // Update handleImagePick and uploadToS3
  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setIsImageUploading(true);
      setProfileImage(imageUri);
      await uploadToS3(imageUri);
      setIsImageUploading(false);
    }
  };

  const uploadToS3 = async (imageUri) => {
    try {
      const uploadedImageUrl = await uploadImage(imageUri, userType, formData.phone);
      setProfileImage(uploadedImageUrl);
    } catch (error) {
      // No alert, just remove loader
    }
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!isPhoneVerified && isEditingPhone) {
      showAlert('Please verify your phone number first');
      setTimeout(() => hideAlert(), 1000);
      return;
    }

    const newErrors = {};

    // Validate required fields
    if (!formData.full_name) {
      newErrors.full_name = 'Please enter your full name';
    }
    // Comment out email input and validation
    if (!formData.email) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    if (!formData.city) {
      newErrors.city = 'Please enter your city';
    }
    if (!formData.state) {
      newErrors.state = 'Please select your state';
    }
    if (!formData.country) {
      newErrors.country = 'Please enter your country';
    }
    if (!formData.experience) {

      newErrors.experience = 'Please select your experience';
    }
    if (!formData.industry) {
      newErrors.industry = 'Please select your role';
    }
    if (!formData.highestEducation) {
      newErrors.highestEducation = 'Please select your highest education';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Please select your date of birth';
    }

    // Update errors state
    setErrors(newErrors);

    // If there are any errors, don't proceed with submission
    if (Object.keys(newErrors).length > 0) {
      showAlert("Please fill in all required fields");
      setTimeout(() => hideAlert(), 1000);
      return;
    }

    // In handleSubmit, add DOB validation
    const isValidDate = (day, month, year) => {
      if (!day || !month || !year) return false;
      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
      const maxDay = new Date(y, m, 0).getDate();
      return d >= 1 && d <= maxDay;
    };

    if (!isValidDate(selectedDay, selectedMonth, selectedYear)) {
      setErrors(prev => ({ ...prev, dateOfBirth: 'Please select a valid date of birth' }));
      setTimeout(() => hideAlert(), 1000);
      return;
    }

    const updatedData = {
      ...formData,
      userId: userId,
      userType: 'job_seeker',
      city: formData.city,
      state: formData.state,
      country: formData.country,
      profileImage: profileImage,
      dateOfBirth: formData.dateOfBirth,
    };

    try {
      const response = await updateProfile(updatedData);
      if (response?.data.success) {
        showAlert("Success", "Profile updated successfully!", "success");
        setTimeout(() => hideAlert(), 1000);
        navigation.goBack();
      } else {
        showAlert("Error", response?.message || "Update failed", "error");
      }
    } catch (error) {
      showAlert("Error", "Something went wrong", "error");
      console.log(error);
    }
  };

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });

    // Hide after 1 second
    setTimeout(() => {
      setAlertConfig(prev => ({
        ...prev,
        visible: false,
      }));
    }, 1000);
  };


  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleDateChange = (type, value) => {
    let newDay = selectedDay;
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    switch (type) {
      case 'day':
        newDay = value;
        setSelectedDay(value);
        break;
      case 'month':
        newMonth = value;
        setSelectedMonth(value);
        break;
      case 'year':
        newYear = value;
        setSelectedYear(value);
        break;
    }

    if (newDay && newMonth && newYear) {
      const dateString = `${newYear}-${newMonth}-${newDay}`;
      handleChange('dateOfBirth', dateString);
    }
  };

  // Date of Birth Dropdown Handlers
  const handleOpenDay = (isOpen) => {
    setOpenDay(isOpen);
    if (isOpen) {
      setOpenMonth(false);
      setOpenYear(false);
      setActiveDropdown(null);
    }
  };
  const handleOpenMonth = (isOpen) => {
    setOpenMonth(isOpen);
    if (isOpen) {
      setOpenDay(false);
      setOpenYear(false);
      setActiveDropdown(null);
    }
  };
  const handleOpenYear = (isOpen) => {
    setOpenYear(isOpen);
    if (isOpen) {
      setOpenDay(false);
      setOpenMonth(false);
      setActiveDropdown(null);
    }
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ ...styles.contentContainer, paddingBottom: 72 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Profile Image Upload - inside the card, above the fields */}
          <View style={styles.imageContainer}>
            <Image source={profileImage ? { uri: profileImage } : ""} style={styles.profileImage} />
            {isImageUploading ? (
              <View style={styles.imageUploadingOverlay}>
                <ActivityIndicator size="large" color="#BE4145" />
              </View>
            ) : (
              <TouchableOpacity style={styles.editImageIcon} onPress={handleImagePick}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.inputContainer}>
            {/* Full Name */}
            <Text style={styles.label}>Full Name<Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.full_name ? styles.inputError : null]}
              value={formData.full_name}
              onChangeText={(text) => handleChange('full_name', text)}
            />
            {errors.full_name ? <Text style={styles.errorText}>{errors.full_name}</Text> : null}
            {/* Phone Number */}
            <Text style={styles.label}>Phone Number<Text style={styles.requiredStar}>*</Text></Text>
            <View style={styles.phoneContainer}>
              <TextInput
                style={[
                  { ...styles.input, backgroundColor: "#fff", color: "#999999" },
                  { backgroundColor: isEditingPhone && !showOtpInput ? '#ffffff' : '#f5f5f5', paddingRight: 40, color: isEditingPhone ? '#333333' : '#999999' },
                  errors.phone ? styles.inputError : null
                ]}
                value={isEditingPhone ? newPhoneNumber : formData.phone}
                onChangeText={isEditingPhone ? setNewPhoneNumber : null}
                editable={isEditingPhone && !showOtpInput}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder={isEditingPhone ? "Please enter new number" : ""}
              />
              <TouchableOpacity style={styles.editPhoneButton} onPress={handlePhoneEdit}>
                <MaterialIcons name="edit" size={24} color="#45A6BE" />
              </TouchableOpacity>
            </View>
            {isEditingPhone && (
              <View style={styles.otpContainer}>
                {!showOtpInput ? (
                  <TouchableOpacity
                    style={[styles.verifyButton, { opacity: isLoading ? 0.7 : 1 }]}
                    onPress={handlePhoneChange}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.verifyButtonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <>
                    <Text style={styles.infoText}>
                      We sent an OTP to your mobile number +91{newPhoneNumber}
                    </Text>
                    <View style={styles.otpInputContainer}>
                      {otp.map((value, index) => (
                        <TextInput
                          key={index}
                          style={styles.otpBox}
                          keyboardType="number-pad"
                          maxLength={4}
                          value={value}
                          onChangeText={(text) => handlePaste(text, index)}
                          onKeyPress={(e) => handleKeyPress(e, index)}
                          ref={otpRefs[index]}
                          contextMenuHidden={true}
                          editable={!isLoading}
                        />
                      ))}
                    </View>
                    <Text style={styles.timerText}>
                      {isResendVisible ? (
                        <TouchableOpacity onPress={handlePhoneChange} disabled={isLoading}>
                          <Text style={[styles.resendText, isLoading && styles.resendDisabled]}>
                            Didn't receive code?{' '}
                            <Text style={[styles.resendActionText, isLoading && styles.resendDisabled]}>
                              {isLoading ? 'Sending...' : 'Resend OTP'}
                            </Text>
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        `Resend OTP in ${timer} seconds`
                      )}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.verifyButton,
                        {
                          opacity: isLoading || otp.join('').length !== 4 ? 0.7 : 1,
                          marginTop: 16
                        }
                      ]}
                      onPress={handleVerifyOTP}
                      disabled={isLoading || otp.join('').length !== 4}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.verifyButtonText}>Verify OTP</Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
            {/* Gender */}
            <Text style={styles.label}>Gender<Text style={styles.requiredStar}>*</Text></Text>
            <View style={{ zIndex: 10000 }}>
              <DropDownPicker
                open={activeDropdown === 'gender'}
                tickIconStyle={{ tintColor: "#BE4145" }}

                value={formData.gender}
                items={genderItems}
                setOpen={isOpen => {
                  setActiveDropdown(isOpen ? 'gender' : null);
                  if (isOpen) {
                    setActiveDropdown('gender');
                    setOpenDay && setOpenDay(false);
                    setOpenMonth && setOpenMonth(false);
                    setOpenYear && setOpenYear(false);
                  }
                }}
                setValue={callback => handleChange('gender', callback(formData.gender))}
                setItems={setGenderItems}
                placeholder="Select Gender"
                style={[styles.dropdown, errors.gender ? styles.inputError : null]}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={4000}
                zIndexInverse={1000}
                listMode="SCROLLVIEW"
                placeholderStyle={{ color: "#b4b4b4", fontSize: 14 }}
                textStyle={{ fontSize: 14, color: "#333333" }}
              />
            </View>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
            {/* Date of Birth */}
            <Text style={styles.label}>Date of Birth<Text style={styles.requiredStar}>*</Text></Text>
            <View style={styles.datePickerRow}>
              <View style={styles.datePickerColumnDay}>
                <DropDownPicker
                  open={activeDropdown === 'day'}
                  tickIconStyle={{ tintColor: "#BE4145" }}

                  value={selectedDay}
                  items={days}
                  setOpen={isOpen => {
                    setActiveDropdown(isOpen ? 'day' : null);
                    if (isOpen) {
                      setActiveDropdown('day');
                      setOpenMonth(false);
                      setOpenYear(false);
                    }
                  }}
                  setValue={(callback) => handleDateChange('day', callback(selectedDay))}
                  placeholder="Day"
                  style={styles.dateDropdown}
                  dropDownContainerStyle={styles.dateDropdownContainer}
                  zIndex={2020}
                  zIndexInverse={1000}
                  listMode="SCROLLVIEW"
                  placeholderStyle={{ color: "#b4b4b4", fontSize: 14 }}
                  textStyle={{ fontSize: 14, color: "#333333" }}
                />
              </View>
              <View style={styles.datePickerColumnMonth}>
                <DropDownPicker
                  open={activeDropdown === 'month'}
                  tickIconStyle={{ tintColor: "#BE4145" }}

                  value={selectedMonth}
                  items={months}
                  setOpen={isOpen => {
                    setActiveDropdown(isOpen ? 'month' : null);
                    if (isOpen) {
                      setActiveDropdown('month');
                      setOpenDay(false);
                      setOpenYear(false);
                    }
                  }}
                  setValue={(callback) => handleDateChange('month', callback(selectedMonth))}
                  placeholder="Month"
                  style={styles.dateDropdown}
                  dropDownContainerStyle={styles.dateDropdownContainer}
                  zIndex={2020}
                  zIndexInverse={1000}
                  listMode="SCROLLVIEW"
                  placeholderStyle={{ color: "#b4b4b4", fontSize: 14 }}
                  textStyle={{ fontSize: 14, color: "#333333" }}
                />
              </View>
              <View style={styles.datePickerColumnYear}>
                <DropDownPicker
                  open={activeDropdown === 'year'}
                  tickIconStyle={{ tintColor: "#BE4145" }}

                  value={selectedYear}
                  items={years}
                  setOpen={isOpen => {
                    setActiveDropdown(isOpen ? 'year' : null);
                    if (isOpen) {
                      setActiveDropdown('year');
                      setOpenDay(false);
                      setOpenMonth(false);
                    }
                  }}
                  setValue={(callback) => handleDateChange('year', callback(selectedYear))}
                  placeholder="Year"
                  style={styles.dateDropdown}
                  dropDownContainerStyle={styles.dateDropdownContainer}
                  zIndex={2020}
                  zIndexInverse={1000}
                  listMode="SCROLLVIEW"
                  placeholderStyle={{ color: "#b4b4b4", fontSize: 14 }}
                  textStyle={{ fontSize: 14, color: "#333333" }}
                />
              </View>
            </View>
            {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            {/* City */}
            <Text style={styles.label}>City<Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, errors.city ? styles.inputError : null]}
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
            />
            {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
            {/* State */}
            <Text style={styles.label}>State<Text style={styles.requiredStar}>*</Text></Text>
            <DropDownPicker
              open={activeDropdown === 'state'}
              tickIconStyle={{ tintColor: "#BE4145" }}
              value={formData.state}
              items={stateItems}
              setOpen={isOpen => {
                setActiveDropdown(isOpen ? 'state' : null);
                if (isOpen) {
                  setActiveDropdown('state');
                  setOpenDay(false);
                  setOpenMonth(false);
                  setOpenYear(false);
                }
              }}
              setValue={(callback) => handleChange('state', callback(formData.state))}
              setItems={setStateItems}
              placeholder="Select State"
              style={[styles.dropdown, errors.state ? styles.inputError : null]}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={2008}
              zIndexInverse={2021}
              listMode="SCROLLVIEW"
              placeholderStyle={{ color: "#b4b4b4", fontSize: 14 }}
              textStyle={{ fontSize: 14, color: "#333333" }}
            />
            {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
            {/* Country */}
            <Text style={styles.label}>Country<Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[{ ...styles.input, backgroundColor: "#f5f5f5", color: "#999999" }, errors.country ? styles.inputError : null]}
              value={formData.country}
              editable={false}
              onChangeText={(text) => handleChange('country', text)}
            />
            {/* Highest Education */}
            <Text style={styles.label}>Highest Education<Text style={styles.requiredStar}>*</Text></Text>
            <DropDownPicker
              open={activeDropdown === 'education'}
              tickIconStyle={{ tintColor: "#BE4145" }}
              value={formData.highestEducation}
              items={educationItems}
              setOpen={isOpen => {
                setActiveDropdown(isOpen ? 'education' : null);
                if (isOpen) {
                  setActiveDropdown('education');
                  setOpenDay(false);
                  setOpenMonth(false);
                  setOpenYear(false);
                }
              }}
              setValue={(callback) => handleChange('highestEducation', callback(formData.highestEducation))}
              placeholder="Select Highest education"
              style={[styles.dropdown, errors.highestEducation ? styles.inputError : null]}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={2005}
              zIndexInverse={2012}
              listMode="SCROLLVIEW"
              placeholderStyle={{ color: "#b4b4b4", fontSize: 14 }}
              textStyle={{ fontSize: 14, color: "#333333" }}
            />
            {errors.highestEducation ? <Text style={styles.errorText}>{errors.highestEducation}</Text> : null}
            {/* Experience */}
            <Text style={styles.label}>Experience<Text style={styles.requiredStar}>*</Text></Text>
            <DropDownPicker
              open={activeDropdown === 'experience'}
              value={formData.experience}
              items={ExperienceItems}
              setOpen={isOpen => {
                setActiveDropdown(isOpen ? 'experience' : null);
                if (isOpen) {
                  setActiveDropdown('experience');
                  setOpenDay(false);
                  setOpenMonth(false);
                  setOpenYear(false);
                }
              }}
              setValue={(callback) => handleChange('experience', callback(formData.experience))}
              placeholder="Select your experience"
              style={[styles.dropdown, errors.experience ? styles.inputError : null]}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={2002}
              zIndexInverse={2020}
              listMode="SCROLLVIEW"
              placeholderStyle={{ color: "#b4b4b4", fontSize: 14 }}
              textStyle={{ fontSize: 14, color: "#333333" }}
              tickIconStyle={{ tintColor: "#BE4145" }}
            />
            {errors.experience ? <Text style={styles.errorText}>{errors.experience}</Text> : null}


            {/* Role */}
            <Text style={styles.label}>Job Category<Text style={styles.requiredStar}>*</Text></Text>
            <DropDownPicker
              open={activeDropdown === 'industry'}
              value={formData.industry}
              items={industryItems}
              setOpen={isOpen => {
                setActiveDropdown(isOpen ? 'industry' : null);
                if (isOpen) {
                  setActiveDropdown('industry');
                  setOpenDay(false);
                  setOpenMonth(false);
                  setOpenYear(false);
                }
              }}
              setValue={(callback) => handleChange('industry', callback(formData.industry))}
              setItems={setIndustryItems}
              placeholder="Select Role"
              style={[styles.dropdown, errors.industry ? styles.inputError : null]}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={1000}
              zIndexInverse={2050}
              listMode="SCROLLVIEW"
              placeholderStyle={{ color: "#b4b4b4", fontSize: 14 }}
              textStyle={{ fontSize: 14, color: "#333333" }}
              tickIconStyle={{ tintColor: "#BE4145" }}
            />
            {errors.industry ? <Text style={styles.errorText}>{errors.industry}</Text> : null}
          </View>
        </View>
      </ScrollView>
      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveButtonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
      <CustomAlert
        visible={alertConfig.visible}
        message={alertConfig.message}
        type={alertConfig.type}
        title={alertConfig.title}
        onClose={hideAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    padding: 16,
    marginBottom: 36,
  },
  contentContainer: {
    paddingBottom: 26,

  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  imageContainer: {
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f4f4f4',
  },
  editImageIcon: {
    position: 'absolute',
    bottom: 18,
    right: '36%',
    backgroundColor: '#be4145',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  imageUploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
    borderColor: "#ccc"
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    marginBottom: 4,
    marginLeft: 2,
  },
  requiredStar: {
    color: '#BE4145',
    fontSize: 12,
    marginLeft: 2,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter-Regular',
    minHeight: 48,
    height: 48,
    paddingHorizontal: 16,
  },
  dropdown: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    minHeight: 48,
    height: 48,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  dateDropdown: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    height: 48,
    minHeight: 48,
    backgroundColor: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    justifyContent: 'center',
  },

  dateInputContainer: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e4e4e4",
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: 0,
  },

  datePickerColumnDay: {
    flexBasis: '25%',
    maxWidth: '25%',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#e4e4e4",
    marginBottom: 16,
  },
  datePickerColumnMonth: {
    flexBasis: '40%',
    maxWidth: '40%',
  },
  datePickerColumnYear: {
    flexBasis: '35%',
    maxWidth: '30%',
  },
  dateDropdownContainer: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: "#e4e4e4",
  },
  saveButton: {
    backgroundColor: '#be4145',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    width: '100%',
    shadowColor: 'transparent',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
  inputError: {
    borderColor: '#be4145',
    borderWidth: 1,
  },
  errorText: {
    color: '#be4145',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    marginLeft: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
    fontWeight: 'bold'
  },
  picker: {
    height: 150,
    width: '90%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  pickerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedPickerItem: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#BE4145',
  },
  selectedPickerItemText: {
    color: '#BE4145',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#BE4145',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  editIcon: {
    padding: 4,
  },
  verifyButton: {
    backgroundColor: '#BE4145',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
  },
  phoneContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editPhoneButton: {
    position: 'absolute',
    right: 12,
    top: 8,
    padding: 4,
  },
  otpContainer: {
    marginBottom: 16,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  otpBox: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 6,
    fontFamily: 'Inter-Regular',
    color: '#222222',
  },
  infoText: {
    fontSize: 14,
    color: '#444444',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  resendText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
  resendActionText: {
    fontSize: 14,
    color: '#BE4145',
    fontFamily: 'Inter-Regular',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: '#999999',
    textDecorationLine: 'none',
  },
  verifyButton: {
    backgroundColor: '#BE4145',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    height: 48,
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default EditProfile;