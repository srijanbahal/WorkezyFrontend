import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { getProfileDetails, updateProfile, uploadImage, uploadDocument, requestOTP, verifyOTP, checkMobileExists } from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../components/CustomAlert';
import LeftNav from '../../component/LeftNav';

const EditEmployerProfile = ({ route }) => {
  // ...existing code...

  // Helper function to check if all required fields are filled (excluding file uploads)
  const isFormValid = () => {
    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'gender',
      'designation',
      'company',
      'companySize',
      'industry',
      'foundedIn',
      'city',
      'state',
      'country',
      'zipcode'
    ];
    return requiredFields.every(field => {
      const value = formData[field];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
  };

  const navigation = useNavigation();
  const { userId } = route.params;
  const userType = 'employer';

  // State Variables
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    designation: '',
    company: '',
    companySize: '',
    industry: '',
    foundedIn: '',
    city: '',
    state: '',
    country: 'India',
    zipcode: '',
    legalDocs: '',
    personalDoc: '',
    spacePhoto: '',
    socialLinks: ''
  });

  // Focus states
  const [focusedInput, setFocusedInput] = useState(null);

  // Designation search states
  const [designationSearchText, setDesignationSearchText] = useState('');
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);

  // Dropdown states
  const [openGender, setOpenGender] = useState(false);
  const [genderItems, setGenderItems] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ]);

  const [openDesignation, setOpenDesignation] = useState(false);
  const [designationItems, setDesignationItems] = useState([
    { label: 'Owner', value: 'owner' },
    { label: 'Director', value: 'director' },
    { label: 'CEO', value: 'ceo' },
    { label: 'Manager', value: 'manager' },
    { label: 'HR', value: 'hr' },
    { label: 'Others', value: 'other' },
  ]);

  const [openCompanySize, setOpenCompanySize] = useState(false);
  const [companySizeItems, setCompanySizeItems] = useState([
    { label: '0-1', value: '0-1' },
    { label: '2-10', value: '2-10' },
    { label: '11-50', value: '11-50' },
    { label: '51-200', value: '51-200' },
    { label: '201-500', value: '201-500' },
    { label: '501+', value: '501+' },
  ]);

  const [openIndustry, setOpenIndustry] = useState(false);
  const [industryItems, setIndustryItems] = useState([
    { label: 'IT', value: 'it' },
    { label: 'Finance', value: 'finance' },
    { label: 'Healthcare', value: 'healthcare' },
    { label: 'Education', value: 'education' },
    { label: 'Electrician', value: 'electrician' },
    { label: 'Plumber', value: 'plumber' },
    { label: 'Carpenter', value: 'carpenter' },
    { label: 'Painter', value: 'painter' },
    { label: 'Welder', value: 'welder' },
    { label: 'Mechanic', value: 'mechanic' },
    { label: 'Technician (AC, Refrigerator, etc.)', value: 'technician' },
    { label: 'Machine Operator', value: 'machine_operator' },
    { label: 'Hotel Manager', value: 'hotel_manager' },
    { label: 'Office Boy', value: 'office_boy' },
    { label: 'Admin', value: 'admin' },
    { label: 'Receptionist', value: 'receptionist' },
    { label: 'Bartender', value: 'bartender' },
    { label: 'Housekeeping', value: 'housekeeping' },
    { label: 'Beautician', value: 'beautician' },
    { label: 'Warehouse Worker', value: 'warehouse_worker' },
    { label: 'Procurement/Purchase', value: 'procurement_purchase' },
    { label: 'Supply Chain', value: 'supply_chain' },
    { label: 'Operations', value: 'operations' },
    { label: 'Field Sales', value: 'field_sales' },
    { label: 'Business Development', value: 'business_development' },
    { label: 'Key Account Manager (KAM)', value: 'kam' },
    { label: 'Customer Support', value: 'customer_support' },
    { label: 'Lab Technician', value: 'lab_technician' },
    { label: 'Nurse', value: 'nurse' },
    { label: 'Compounder', value: 'compounder' },
    { label: 'Content Writer', value: 'content_writer' },
    { label: 'Graphics Designer', value: 'graphics_designer' },
    { label: 'Digital Marketing', value: 'digital_marketing' },
    { label: 'Web Developer', value: 'web_developer' },
    { label: 'Tailor', value: 'tailor' },
    { label: 'Maid / Caretaker', value: 'maid_caretaker' },
    { label: 'Babysitter', value: 'babysitter' },
    { label: 'Nanny', value: 'nanny' },
    { label: 'House Cleaner', value: 'house_cleaner' },
    { label: 'Pest Control', value: 'pest_control' },
    { label: 'Data Entry', value: 'data_entry' },
    { label: 'Back Office', value: 'back_office' },
    { label: 'Other', value: 'other' },
  ]);

  const [openState, setOpenState] = useState(false);
  // Track which dropdown is currently open (only one at a time)
  const [activeDropdown, setActiveDropdown] = useState(null);
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

  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    message: '',
    type: 'info',
    title: '',
  });

  // Validation helper functions
  const validateFoundedIn = (year) => {
    const yearValue = parseInt(year);
    const currentYear = new Date().getFullYear();

    if (isNaN(yearValue)) {
      return { valid: false, message: 'Please enter a valid year' };
    }

    if (year.length !== 4) {
      return { valid: false, message: 'Year must be 4 digits' };
    }

    if (yearValue < 1850) {
      return { valid: false, message: 'Enter a valid founding year' };
    }

    if (yearValue > currentYear) {
      return { valid: false, message: 'Enter a valid founding year' };
    }

    return { valid: true };
  };

  const validatePincode = (pincode) => {
    // Check if it's a 6-digit number
    if (!/^\d{6}$/.test(pincode)) {
      return { valid: false, message: 'Pincode must be 6 digits' };
    }

    return { valid: true };
  };

  // Add state for validation errors
  const [foundedInError, setFoundedInError] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getProfileDetails(userId, userType);
        const userData = response.data.employer;
        console.log("User Data", userData);

        // Set designation search text and value
        const designationItem = designationItems.find(item => item.value === userData.designation);
        setDesignationSearchText(designationItem ? designationItem.label : '');

        setFormData({
          fullName: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          gender: userData.gender || '',
          designation: userData.designation || '',
          company: userData.company_name || '',
          companySize: userData.company_size || '',
          industry: userData.company_industry || '',
          foundedIn: userData.company_founded_year ? userData.company_founded_year.toString() : '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || 'India',
          zipcode: userData.zipcode || '',
          legalDocs: userData.legal_doc_1 || [],
          personalDoc: userData.personal_doc || '',
          spacePhoto: userData.spacePhoto || '',
          socialLinks: userData.social_links || ''
        });

        if (userData.profile_image) {
          setProfileImage(userData.profile_image);
        }
      } catch (error) {
        console.log(error);
        showAlert("Failed to load profile data", "error");
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle Input Changes
  const handleChange = (field, value) => {
    // Clear validation errors when user is typing
    if (field === 'foundedIn') {
      setFoundedInError('');
    }
    if (field === 'zipcode') {
      setPincodeError('');
    }
    if (field === 'email') {
      setEmailError('');
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Designation search & selection functions
  const handleDesignationInputChange = (text) => {
    setDesignationSearchText(text);
    setShowDesignationDropdown(true);

    const filtered = designationItems.filter((item) =>
      item.label.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredDesignations(filtered);
  };

  const handleSelectDesignation = (item) => {
    setDesignationSearchText(item.label);
    handleChange('designation', item.value);
    setShowDesignationDropdown(false);
  };

  const handleOutsidePress = () => {
    setShowDesignationDropdown(false);
    Keyboard.dismiss();
  };

  // Helper function to show alert (always provide type)
  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
    setTimeout(() => hideAlert(), 1000);
  };

  // Helper function to hide alert
  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Handle Image Upload
  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      uploadToS3(imageUri);
    }
  };

  const uploadToS3 = async (imageUri) => {
    try {
      const uploadedImageUrl = await uploadImage(imageUri, userType, formData.phone);
      showAlert("Image uploaded successfully!", "success");
      console.log("Uploaded Image URL:", uploadedImageUrl);
      setProfileImage(uploadedImageUrl);
    } catch (error) {
      showAlert("Failed to upload image. Please try again.", "error");
    }
  };

  // Handle Document Upload
  const handleDocumentPick = async (field, allowMultiple = false) => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: allowMultiple,
      });

      if (result.canceled) return;

      if (allowMultiple) {
        let uploadedDocs = await Promise.all(
          result.assets.map(async (doc) => {
            return await uploadDocument(doc.uri, userId);
          })
        );
        handleChange(field, [...formData[field], ...uploadedDocs]);
      } else {
        const uploadedDocUrl = await uploadDocument(result.assets[0].uri, userId);
        handleChange(field, uploadedDocUrl);
      }

      showAlert("Document uploaded successfully!", "success");
    } catch (error) {
      showAlert("Failed to upload document. Please try again.", "error");
      console.log(error);
    }
  };

  // Handle phone number edit
  const handlePhoneEdit = () => {
    setIsEditingPhone(true);
    setNewPhoneNumber(''); // always clear, do not use formData.phone
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
      return;
    }

    setIsLoading(true);

    try {
      // Check if mobile number already exists
      const checkResponse = await checkMobileExists({
        mobile: newPhoneNumber,
        userType: 'employer'
      });
      if (checkResponse.data.exists) {
        showAlert('Error', 'This mobile number is already in use.', 'error');
        setTimeout(() => hideAlert(), 1000);
        setIsLoading(false);
        return;
      }

      // If not exists, proceed to request OTP
      const response = await requestOTP({
        mobile: newPhoneNumber,
        userType: 'employer'
      });

      if (response.data && response.data.otpToken) {
        setOtpToken(response.data.otpToken);
        setShowOtpInput(true);
        setTimer(30);
        setIsResendVisible(false);
        showAlert('Success', 'OTP sent successfully', 'success');
        setTimeout(() => hideAlert(), 1000);
      } else if (response.data === None) {
        showAlert('Error', 'Enter a Valid Phone number', 'error');
        setTimeout(() => hideAlert(), 1000);
      } else {
        showAlert('Error', 'Failed to send OTP', 'error');
        setTimeout(() => hideAlert(), 1000);
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to send OTP', 'error');
      setTimeout(() => hideAlert(), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join('');
    if (enteredOTP.length !== 4) {
      showAlert('Please enter a valid 4-digit OTP', 'error');
      setTimeout(() => hideAlert(), 1000);
      return;
    }

    console.log("Verifying OTP:", enteredOTP);
    setIsLoading(true);

    try {
      const response = await verifyOTP({
        mobile: newPhoneNumber,
        otp: enteredOTP,
        otpToken: otpToken,
        userType: 'employer'
      });
      console.log("OTP Verification Response:", response.data);
      if (response.data && response.data.success) {
        setFormData(prev => ({ ...prev, phone: newPhoneNumber }));
        setIsPhoneVerified(true);
        setIsEditingPhone(false);
        setShowOtpInput(false);
        setOtp(['', '', '', '']);
        showAlert('Success', 'Phone number verified successfully', 'success');
        setTimeout(() => hideAlert(), 1000);
      } else {
        showAlert('Error', 'Invalid OTP. Please try again.', 'error');
        setTimeout(() => hideAlert(), 1000);
      }
    } catch (error) {
      showAlert('', error.response?.data?.message || 'Failed to verify OTP', 'error');
      // console.error("OTP Verification Error:", error);
      console.log("response data:", error.response?.data);
      setTimeout(() => hideAlert(), 1000);
    } finally {
      setIsLoading(false);
    }

  };

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!isPhoneVerified && isEditingPhone) {
      showAlert('Error', 'Please verify your phone number first', 'error');
      return;
    }

    // Validate foundation year
    if (formData.foundedIn) {
      const foundedInValidation = validateFoundedIn(formData.foundedIn);
      if (!foundedInValidation.valid) {
        setFoundedInError(foundedInValidation.message);
        showAlert("Error", foundedInValidation.message);
        return;
      }
    }

    // Validate pincode
    if (formData.zipcode) {
      const pincodeValidation = validatePincode(formData.zipcode);
      if (!pincodeValidation.valid) {
        setPincodeError(pincodeValidation.message);
        showAlert("Error", pincodeValidation.message, 'warning');
        return;
      }
    }

    // Validate email
    if (!formData.email) {
      setEmailError('Please enter your email address');
      showAlert('Error', 'Please enter your email address', 'error');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      showAlert('Error', 'Please enter a valid email address', 'error');
      return;
    }

    const updatedData = {
      ...formData,
      userId: userId,
      userType: 'employer',
      profileImage: profileImage
    };

    try {
      const response = await updateProfile(updatedData);
      if (response?.data.success) {
        showAlert('Success', 'Profile updated successfully!', 'success');
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
        // navigation.goBack();
      } else {
        showAlert('Error', response?.message || "Update failed", 'error');
      }
    } catch (error) {
      showAlert('Something went wrong', 'error');
      console.log(error);
    }
  };

  // 2. Choose the container component based on the platform
  // const ContentContainer = Platform.OS === 'web' ? View : ScrollView;


  const handleBack = () => {
    navigation.goBack();
  }
  return (
    // <TouchableWithoutFeedback onPress={handleOutsidePress}>
    <View style={styles.outerBox}>
      <LeftNav activeuser={"employer"} />

      <View style={styles.containerWeb}>
        {/* --- THIS IS YOUR NEW MANUAL HEADER --- */}
        <View style={styles.manualHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Edit Employer Profile
          </Text>
        </View>
        {/* --- END OF MANUAL HEADER --- */}


        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Image Upload */}
          <View style={styles.imageContainer}>
            <Image source={profileImage ? { uri: profileImage } : ""} style={styles.profileImage} />
            <TouchableOpacity style={styles.editImageIcon} onPress={handleImagePick}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Personal Details Section */}
          <View style={[
            styles.sectionContainer,
            (activeDropdown === 'gender' || activeDropdown === 'designation') && { zIndex: 100 }
          ]}>
            <Text style={styles.sectionTitle1}>Personal Details</Text>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'fullName' && styles.inputFocused,
              ]}
              value={formData.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              placeholder=""
              onFocus={() => setFocusedInput('fullName')}
              onBlur={() => setFocusedInput(null)}
            />
            {/* Add error text if needed */}

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Email ID</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'email' && styles.inputFocused,
              ]}
              value={formData.email}
              onChangeText={(text) => {
                handleChange('email', text);
                setEmailError('');
              }}
              keyboardType="email-address"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => {
                setFocusedInput(null);
                // Email validation
                if (!formData.email) {
                  setEmailError('Please enter your email address');
                } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                  setEmailError('Please enter a valid email address');
                } else {
                  setEmailError('');
                }
              }}
              type="email"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            {/* Add error text if needed */}

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <View style={styles.phoneContainer}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: isEditingPhone && !showOtpInput ? '#ffffff' : '#f5f5f5', paddingRight: 40, color: isEditingPhone && !showOtpInput ? '#333333' : '#999999' },
                  // Add error style if needed
                  // (add error state if you want)
                  // { paddingRight: 40 }
                ]}
                value={isEditingPhone ? newPhoneNumber : formData.phone}
                onChangeText={isEditingPhone ? setNewPhoneNumber : undefined}
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


            {/* // Gender Dropdown */}
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            {/* Add the dynamic style to this View */}
            <View style={activeDropdown === 'gender' && { zIndex: 100 }}>
              <DropDownPicker
                open={activeDropdown === 'gender'}
                value={formData.gender}
                items={genderItems}
                setOpen={(isOpen) => {
                  setOpenGender(isOpen);
                  setActiveDropdown(isOpen ? 'gender' : null);
                }}
                setValue={(callback) => handleChange('gender', callback(formData.gender))}
                setItems={setGenderItems}
                placeholder=""
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                listMode="SCROLLVIEW"
                // zIndex and zIndexInverse are no longer the primary solution, 
                // but can be kept for inner stacking if needed.
                // The parent zIndex is what solves the overlap.
                zIndex={4010}
                zIndexInverse={1000}
                tickIconStyle={{ tintColor: "#BE4145" }}
                closeOnBackPressed={true}
              />
            </View>

            {/* Designation Dropdown */}
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Designation</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            {/* Add the dynamic style to this View as well */}
            <View style={activeDropdown === 'designation' && { zIndex: 100 }}>
              <DropDownPicker
                open={activeDropdown === 'designation'}
                value={formData.designation}
                items={designationItems}
                setOpen={(isOpen) => {
                  setOpenDesignation(isOpen);
                  setActiveDropdown(isOpen ? 'designation' : null);
                }}
                setValue={(callback) => handleChange('designation', callback(formData.designation))}
                setItems={setDesignationItems}
                placeholder="Select designation"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                listMode="SCROLLVIEW"
                // zIndex={4000}
                // zIndexInverse={1010}
                tickIconStyle={{ tintColor: "#BE4145" }}
              />
            </View>
            {/* Add error text if needed */}
          </View>

          {/* Company Details Section */}
          <View style={[styles.sectionContainer, { marginTop: 2 }]}>
            <Text style={styles.sectionTitle}>Company Details</Text>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Company Name</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'company' && styles.inputFocused,
                // Add error style if needed
              ]}
              value={formData.company}
              onChangeText={(text) => handleChange('company', text)}
              onFocus={() => setFocusedInput('company')}
              onBlur={() => setFocusedInput(null)}
            />
            {/* Add error text if needed */}

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Number of Employees </Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <DropDownPicker
              open={activeDropdown === 'companySize'}
              value={formData.companySize}
              items={companySizeItems}
              setOpen={(isOpen) => { setOpenCompanySize(isOpen); setActiveDropdown(isOpen ? 'companySize' : null); }}
              setValue={(callback) => handleChange('companySize', callback(formData.companySize))}
              setItems={setCompanySizeItems}
              placeholder=""
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={1010}
              zIndexInverse={1000}
              tickIconStyle={{ tintColor: "#BE4145" }}
            />
            {/* Add error text if needed */}

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Industry</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <DropDownPicker
              open={activeDropdown === 'industry'}
              value={formData.industry}
              items={industryItems}
              setOpen={(isOpen) => { setOpenIndustry(isOpen); setActiveDropdown(isOpen ? 'industry' : null); }}
              setValue={(callback) => handleChange('industry', callback(formData.industry))}
              setItems={setIndustryItems}
              placeholder=""
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={1000}
              zIndexInverse={3000}
              tickIconStyle={{ tintColor: "#BE4145" }}
            />
            {/* Add error text if needed */}

            {/* Rest of company details */}
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Founded In (Year)</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'foundedIn' && styles.inputFocused,
              ]}
              value={formData.foundedIn}
              onChangeText={(text) => {
                handleChange('foundedIn', text);
                setFoundedInError('');
              }}
              keyboardType="numeric"
              maxLength={4}
              placeholder="YYYY"
              onFocus={() => setFocusedInput('foundedIn')}
              onBlur={() => {
                setFocusedInput(null);
                if (formData.foundedIn) {
                  const validation = validateFoundedIn(formData.foundedIn);
                  if (!validation.valid) {
                    setFoundedInError(validation.message);
                  } else {
                    setFoundedInError('');
                  }
                }
              }}
            />
            {foundedInError ? <Text style={styles.errorText}>{foundedInError}</Text> : null}
            {/* Add error text if needed */}

            <View style={styles.labelContainer}>
              <Text style={styles.label}>City</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'city' && styles.inputFocused,
                // Add error style if needed
              ]}
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
            />
            {/* Add error text if needed */}

            <View style={styles.labelContainer}>
              <Text style={styles.label}>State</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <DropDownPicker
              open={activeDropdown === 'state'}
              value={formData.state}
              items={stateItems}
              setOpen={(isOpen) => { setOpenState(isOpen); setActiveDropdown(isOpen ? 'state' : null); }}
              setValue={(callback) => handleChange('state', callback(formData.state))}
              setItems={setStateItems}
              placeholder="Select State"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={2001}
              listMode="SCROLLVIEW"
              placeholderStyle={{ color: "#b4b4b4", fontSize: 14 }}
              textStyle={{ fontSize: 14, color: "#333333" }}
              tickIconStyle={{ tintColor: "#BE4145" }}

            />
            {/* Add error text if needed */}

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Country</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <TextInput
              value={formData.country}
              style={[
                styles.input,
                { backgroundColor: "#f5f5f5", color: "#999999" }
              ]}
              onChangeText={(text) => handleChange('country', text)}
              editable={false}
            />
            {/* Add error text if needed */}

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Pincode</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'zipcode' && styles.inputFocused,
              ]}
              value={formData.zipcode}
              onChangeText={(text) => {
                handleChange('zipcode', text);
                setPincodeError('');
              }}
              keyboardType="numeric"
              maxLength={6}
              placeholder="6-digit pincode"
              onFocus={() => setFocusedInput('zipcode')}
              onBlur={() => {
                setFocusedInput(null);
                if (formData.zipcode) {
                  const validation = validatePincode(formData.zipcode);
                  if (!validation.valid) {
                    setPincodeError(validation.message);
                  } else {
                    setPincodeError('');
                  }
                }
              }}
            />
            {pincodeError ? <Text style={styles.errorText}>{pincodeError}</Text> : null}
            {/* Add error text if needed */}

            <Text style={styles.label}>Company Social Media Link (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'socialLinks' && styles.inputFocused,
                // Add error style if needed
              ]}
              value={formData.socialLinks}
              onChangeText={(text) => handleChange('socialLinks', text)}
            />
            {/* Add error text if needed */}
          </View>

          {/* Document Upload Section */}
          <View style={[styles.sectionContainer, { marginTop: 2 }]}>
            <Text style={styles.sectionTitle}>Upload Documents</Text>
            <Text style={styles.sectionText}>Contact support to update your profile</Text>
            {/* PAN Card */}
            <View style={styles.uploadRow}>
              <View style={{ width: '100%' }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>PAN Card</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={styles.documentPreview}>
                  {formData.personalDoc ? (
                    <Text style={styles.fileName}>
                      {String(formData.personalDoc).split('/').pop()}
                    </Text>
                  ) : (
                    <Text style={styles.placeholderText}>No document uploaded</Text>
                  )}
                  <Ionicons name="lock-closed" size={20} color="#999" style={styles.lock} />
                </View>
              </View>
            </View>
            {/* GST Certificate */}
            <View style={styles.uploadRow}>
              <View style={{ width: '100%' }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>GST Certificate</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={styles.documentPreview}>
                  {formData.personalDoc ? (
                    <Text style={styles.fileName}>
                      {String(formData.personalDoc).split('/').pop()}

                    </Text>
                  ) : (
                    <Text style={styles.placeholderText}>No document uploaded</Text>
                  )}
                  <Ionicons name="lock-closed" size={20} color="#999" style={styles.lock} />
                </View>
              </View>
            </View>
            {/* Company Logo */}
            <View style={styles.uploadRow}>
              <View style={{ width: '100%' }}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Company Logo</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={styles.documentPreview}>
                  {profileImage ? (
                    <Text style={styles.fileName}>
                      {String(profileImage).split('/').pop()}
                    </Text>
                  ) : (
                    <Text style={styles.placeholderText}>No logo uploaded</Text>
                  )}
                  <Ionicons name="lock-closed" size={20} color="#999" style={styles.lock} />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => navigation.navigate('HelpSupport', {
                userId: userId,
                userType: 'employer',
                subject: 'Document Update Request',
                message: `I need to update my employer documents. My employer ID is ${userId}.`
              })}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          <CustomAlert
            visible={alertConfig.visible}
            message={alertConfig.message}
            type={alertConfig.type}
            title={alertConfig.title}
            onClose={hideAlert}
          />
        </ScrollView>
        {/* Sticky Update Profile Button */}
        <View style={styles.stickyButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, !isFormValid() && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid()}
          >
            <Text style={styles.saveButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    // </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  outerBox: {
    flex: 1,
    flexDirection: 'row', // This is the most important style
    backgroundColor: '#f4f2ee',
  },
  containerWeb: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f4f2ee',
    // paddingLeft: 150, // This should match the width of your LeftNav.js
    marginHorizontal: 25,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    // zIndex: undefined,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    padding: 16,
    zIndex: undefined,
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
  contentContainer: {
    paddingBottom: 16,
    // zIndex: undefined,
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: undefined,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 28,
    color: '#222222',
    marginBottom: 12,
    marginTop: 24,
  },
  sectionTitle1: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 28,
    color: '#222222',
    marginBottom: 12,
    marginTop: 12,
  },
  label: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#444444',
    marginBottom: 2,
  },
  sectionText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    // zIndex: undefined,
  },
  requiredStar: {
    color: "#BE4145",
    fontSize: 14,
    marginLeft: 4,
    // marginBottom: -2,

  },

  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#333333',
  },
  inputFocused: {
    borderColor: '#BE4145',
    borderWidth: 2,
  },
  dropdown: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    height: 48,
  },
  dropdownContainer: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    // backgroundColor: '#333',
    // marginTop: -8,
    // marginTop: 4,.
    marginBottom: 14,
    // zIndex: 10000, // Ensure dropdown appears above other elements
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#BE4145",
  },
  buttonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#BE4145',
  },
  saveButton: {
    backgroundColor: '#BE4145',
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    width: '100%',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#fff',
  },
  fileName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    flex: 1,
    // flexWrap: 'wrap',
  },
  dropdownListContainer: {
    position: 'relative',
    zIndex: 9500,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: -8,
    marginBottom: 16,
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdownText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  searchableDropdownContainer: {
    position: 'relative',
    zIndex: 9500,
    marginBottom: 16,
  },
  imageContainer: {
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',

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
  emptyProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    alignItems: 'center',
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
  inputContainer: {
    marginBottom: 24,
  },
  selectedDropdownItem: {
    backgroundColor: '#f8e5e6',
  },
  selectedDropdownText: {
    color: '#BE4145',
    fontFamily: 'Inter-Medium',
  },
  lockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  // lockText: {
  //   fontFamily: 'Inter-Regular',
  //   fontSize: 14,
  //   color: '#666666',
  //   marginLeft: 8,
  // },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    // overflow: 'scroll',
    // flex: 'column', // allow container to shrink properly
  },
  placeholderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
  },
  supportButton: {
    backgroundColor: '#BE4145',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  supportButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  inputError: {
    borderColor: '#BE4145',
    borderWidth: 1,
  },
  errorText: {
    color: '#BE4145',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  phoneContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  editPhoneButton: {
    position: 'absolute',
    right: 12,
    top: 12,
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
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    paddingTop: 16,
    paddingBottom: 24,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  lock: {
    marginLeft: 8,
    marginBottom: 12,
    flex: 1,
  }
});

export default EditEmployerProfile;