import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, TouchableWithoutFeedback, Keyboard, Dimensions, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { registerUser, uploadImage, uploadDocument, updateProfile } from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../components/CustomAlert';

const { width, height } = Dimensions.get('window');

const EmployerRegistration = ({ route }) => {
  const navigation = useNavigation();
  const { mobile, employerData, isEditing, returnToReview } = route.params || {};
  // Set userId: when editing, use employerData.id if available, else fallback to mobile
  const [userId, setUserId] = useState(isEditing ? (employerData?.mobile || '') : (mobile || ''));
  const userType = 'employers';

  // Use formData object approach like EditEmployerProfile
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: isEditing ? employerData?.phone : mobile,
    gender: '',
    designation: null,
    company: '',
    companySize: null,
    industry: null,
    foundedIn: '',
    city: '',
    state: '',
    country: 'India',
    zipcode: '',
    socialLinks: ''
  });

  const [legalDocs, setLegalDocs] = useState([]);
  const [personalDoc, setPersonalDoc] = useState(null);
  const [spacePhoto, setSpacePhoto] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // New state to track if form is valid
  const [isFormValid, setIsFormValid] = useState(false);

  // New states for searchable designation
  const [designationSearchText, setDesignationSearchText] = useState('');
  const [filteredDesignations, setFilteredDesignations] = useState([]);
  const [showDesignationDropdown, setShowDesignationDropdown] = useState(false);

  // Dropdown states for designation, company size, and industry
  const [designationOpen, setDesignationOpen] = useState(false);
  const [companySizeOpen, setCompanySizeOpen] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  const [openGender, setOpenGender] = useState(false);
  // track which dropdown is currently open – ensures only one open at a time
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [genderItems, setGenderItems] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ]);

  const [designationItems, setDesignationItems] = useState([
    { label: 'Owner', value: 'owner' },
    { label: 'Director', value: 'director' },
    { label: 'CEO', value: 'ceo' },
    { label: 'Manager', value: 'manager' },
    { label: 'HR', value: 'hr' },
    { label: 'Recruiter', value: 'recruiter' },
    { label: 'Hiring Manager', value: 'hiring_manager' },
    { label: 'Team Lead', value: 'team_lead' },
    { label: 'Executive', value: 'executive' },
    { label: 'Administrator', value: 'administrator' },
  ]);

  const [companySizeItems, setCompanySizeItems] = useState([
    { label: '0-1', value: '0-1' },
    { label: '2-10', value: '2-10' },
    { label: '11-50', value: '11-50' },
    { label: '51-200', value: '51-200' },
    { label: '201-500', value: '201-500' },
    { label: '501+', value: '501+' },
  ]);

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

  // Add new state for CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [alertOnConfirm, setAlertOnConfirm] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [panFileName, setPanFileName] = useState('');
  const [gstFileName, setGstFileName] = useState('');
  const [companyLogoFileName, setCompanyLogoFileName] = useState('');

  // Add validation helper functions
  const validateFoundedIn = (year) => {
    const yearValue = parseInt(year);
    const currentYear = new Date().getFullYear();

    if (isNaN(yearValue)) {
      return { valid: false, message: 'Please enter a valid year' };
    }

    if (year.length !== 4) {
      return { valid: false, message: 'Enter a valid founding year' };
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

  // Add new state variables for validation errors
  const [foundedInError, setFoundedInError] = useState('');
  const [pincodeError, setPincodeError] = useState('');

  // Add validation state
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    gender: '',
    designation: '',
    company: '',
    companySize: '',
    industry: '',
    foundedIn: '',
    city: '',
    state: '',
    zipcode: '',
    legalDocs: '',
    personalDoc: '',
    profileImage: ''
  });

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setOpenGender(false);
    setDesignationOpen(false);
    setCompanySizeOpen(false);
    setIndustryOpen(false);
    setOpenState(false);
  };

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Handle input changes
  const handleChange = (field, value) => {
    closeAllDropdowns();

    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [field]: '' }));

    // Special field validations
    if (field === 'foundedIn') {
      setFoundedInError('');
    }
    if (field === 'zipcode') {
      setPincodeError('');
    }
    if (field === 'email' && value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle input focus
  const handleInputFocus = (field) => {
    closeAllDropdowns();
    setFocusedInput(field);
  };

  // Handle user tapping outside dropdown or keyboard
  const handleOutsidePress = () => {
    setShowDesignationDropdown(false);
    Keyboard.dismiss();
  };

  // Fill in the form with employer data if we're in edit mode
  useEffect(() => {
    if (isEditing && employerData) {
      console.log("Pre-filling form with employer data:", employerData);

      // Set profile image
      const profileImageUri = employerData.profileImage || employerData.profile_image;
      setProfileImage(profileImageUri);
      if (profileImageUri) {
        setCompanyLogoFileName(profileImageUri.split('/').pop());
        setCompanyLogoStatusType('success');
      }

      // Handle different property name formats from the API
      const fullName = employerData.fullName || employerData.full_name || '';
      const companyName = employerData.company || employerData.company_name || '';
      const companySize = employerData.companySize || employerData.company_size || null;
      const industry = employerData.industry || employerData.company_industry || null;
      const foundedYear = employerData.foundedIn || employerData.company_founded_year || '';

      // Set form data with all possible property name variations
      setFormData({
        fullName,
        email: employerData.email || '',
        phone: employerData.phone || '',
        gender: employerData.gender || '',
        designation: employerData.designation || null,
        company: companyName,
        companySize,
        industry,
        foundedIn: foundedYear ? foundedYear.toString() : '',
        city: employerData.city || '',
        state: employerData.state || '',
        country: employerData.country || 'India',
        zipcode: employerData.zipcode || '',
        socialLinks: typeof employerData.socialLinks === 'object' ?
          employerData.socialLinks.socialLinks || '' :
          employerData.socialLinks || employerData.social_links || ''
      });

      // Set document states
      if (employerData.legal_doc_1 && Array.isArray(employerData.legal_doc_1) && employerData.legal_doc_1.length > 0) {
        setLegalDocs(employerData.legal_doc_1);
        if (typeof employerData.legalDocs[0] === 'string') {
          setPanFileName(employerData.legal_doc_1);
          setPanStatusType('success');
        }
      } else if (employerData.legal_doc_1 && typeof employerData.legal_doc_1 === 'string') {
        setLegalDocs([employerData.legal_doc_1]);
        setPanFileName(employerData.legal_doc_1);
        setPanStatusType('success');
      }

      setPersonalDoc(employerData.personal_doc || null);
      if (employerData.personal_doc && typeof employerData.personal_doc === 'string') {
        setGstFileName(employerData.personal_doc);
        setGstStatusType('success');
      }

      setSpacePhoto(employerData.spacePhoto || null);

      // Find and set designation item
      const designationItem = designationItems.find(item =>
        item.value === employerData.designation
      );

      if (designationItem) {
        setDesignationSearchText(designationItem.label);
      }

      // Log pre-filled data for debugging
      console.log("Form data pre-filled:", {
        fullName,
        designation: employerData.designation,
        company: companyName,
        companySize,
        industry
      });
    }
  }, [isEditing, employerData]);

  // On mount, if editing and employerData.id is available, set userId
  useEffect(() => {
    if (isEditing && employerData && employerData.id) {
      setUserId(employerData.id);
    } else if (!isEditing && mobile) {
      setUserId(mobile);
    }
  }, [isEditing, employerData, mobile]);

  const showAlert = (title, message, onConfirm = null, type = 'info', autoClose = true) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertOnConfirm(() => onConfirm);
    setAlertVisible(true);
    if (autoClose) {
      setTimeout(() => {
        setAlertVisible(false);
        if (onConfirm) {
          onConfirm();
        }
      }, 1000);
    }
  };

  const handleImagePick = async () => {
    try {
      closeAllDropdowns();

      // Request permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        setUploadedFileName('Please allow access to photos to upload images');
        setTimeout(() => setUploadedFileName(''), 3000);
        return;
      }

      setIsUploading(true);
      setUploadedFileName('Selecting image...');

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (result.canceled) {
        setIsUploading(false);
        setUploadedFileName('');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        const fileName = result.assets[0].fileName || imageUri.split('/').pop();

        setProfileImage(imageUri);
        setUploadedFileName('Uploading image...');

        try {
          await uploadToS3(imageUri);
          setUploadedFileName('Image uploaded successfully');

          // Clear success message after 3 seconds
          setTimeout(() => {
            setUploadedFileName('');
          }, 3000);

        } catch (error) {
          console.error('Upload error:', error);
          setProfileImage(null);
          setUploadedFileName('Failed to upload image');

          // Clear error message after 3 seconds
          setTimeout(() => {
            setUploadedFileName('');
          }, 3000);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Image pick error:', error);
      setUploadedFileName('Failed to select image');
      setIsUploading(false);

      // Clear error message after 3 seconds
      setTimeout(() => {
        setUploadedFileName('');
      }, 3000);
    }
  };

  const uploadToS3 = async (imageUri) => {
    try {
      const uploadedImageUrl = await uploadImage(imageUri, userType, userId);
      setProfileImage(uploadedImageUrl);
      return uploadedImageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setProfileImage(null);
      throw error;
    }
  };

  const handleDocumentPick = async (setDocument, allowMultiple = false) => {
    try {
      setIsUploading(true);
      setUploadedFileName('Preparing upload...');

      let result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: allowMultiple,
      });

      if (result.canceled) {
        setIsUploading(false);
        setUploadedFileName('');
        return;
      }

      if (allowMultiple) {
        setUploadedFileName('Uploading documents...');
        let uploadedDocs = await Promise.all(
          result.assets.map(async (doc) => {
            const url = await uploadDocument(doc.uri, userId);
            return url;
          })
        );
        setDocument([...legalDocs, ...uploadedDocs]);
        setUploadedFileName(`${uploadedDocs.length} documents uploaded successfully`);
      } else {
        setUploadedFileName('Uploading document...');
        const uploadedDocUrl = await uploadDocument(result.assets[0].uri, userId);
        setDocument(uploadedDocUrl);
        setUploadedFileName('Document uploaded successfully');
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadedFileName('');
      }, 3000);

    } catch (error) {
      console.error('Document upload error:', error);
      setUploadedFileName('Upload failed. Please try again.');
      // Clear error message after 3 seconds
      setTimeout(() => {
        setUploadedFileName('');
      }, 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.fullName) {
      newErrors.fullName = 'Please enter your full name';
    }
    if (!formData.email) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    if (!formData.designation) {
      newErrors.designation = 'Please select your designation';
    }
    if (!formData.company) {
      newErrors.company = 'Please enter company name';
    }
    if (!formData.companySize) {
      newErrors.companySize = 'Please select company size';
    }
    if (!formData.industry) {
      newErrors.industry = 'Please select industry';
    }
    if (!formData.city) {
      newErrors.city = 'Please enter city';
    }
    if (!formData.state) {
      newErrors.state = 'Please select state';
    }
    if (!legalDocs || legalDocs.length === 0) {
      newErrors.legalDocs = 'Please upload PAN Card';
    }
    if (!personalDoc) {
      newErrors.personalDoc = 'Invalid GST Certificate file';
    }

    if (!profileImage) {
      newErrors.profileImage = 'Please upload company logo';
    }

    // Validate founded in year
    const foundedInValidation = validateFoundedIn(formData.foundedIn);
    if (!foundedInValidation.valid) {
      newErrors.foundedIn = foundedInValidation.message;
    }

    // Validate pincode
    const pincodeValidation = validatePincode(formData.zipcode);
    if (!pincodeValidation.valid) {
      newErrors.zipcode = pincodeValidation.message;
    }

    // Update errors state
    setErrors(newErrors);

    // If there are any errors, don't proceed with submission
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      // First get the latest user data from AsyncStorage to ensure we have the most up-to-date ID
      const userDataString = await AsyncStorage.getItem('userDetails');
      if (!userDataString && isEditing) {
        showAlert('Error', 'User data not found. Please log in again.', null, 'error');
        return;
      }

      // For editing, make sure we have the correct user ID from storage or employerData
      let storedUserId = userId;
      if (isEditing) {
        if (employerData && employerData.id) {
          storedUserId = employerData.id;
        } else if (userDataString) {
          const storedUserData = JSON.parse(userDataString);
          storedUserId = storedUserData.id || userId;
        }
      }

      // Prepare data in the exact format expected by the API
      const updatedData = {
        userId: storedUserId,
        userType: "employer",
        profileImage,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        designation: formData.designation,
        company: formData.company,
        companySize: formData.companySize,
        industry: formData.industry,
        foundedIn: formData.foundedIn,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipcode: formData.zipcode,
        legalDocs,
        personalDoc,
        spacePhoto,
        socialLinks: formData.socialLinks
      };

      console.log("Submitting data:", updatedData);

      let response;

      if (isEditing) {
        // Update existing profile - use updateProfile like EditEmployerProfile.js
        response = await updateProfile(updatedData);

        if (response?.data.success) {
          // Get the updated data
          let userData = response.data.user || response.data.employer || response.data;

          // If userData is undefined or empty, use what we submitted
          if (!userData || Object.keys(userData).length === 0) {
            userData = { ...updatedData };
          }

          // Ensure we preserve the id
          if (!userData.id && storedUserId) {
            userData.id = storedUserId;
          }

          // Preserve the status from before
          const previousStatus = employerData.status ||
            employerData.Status ||
            employerData.accountStatus ||
            employerData.account_status ||
            'pending';

          userData.status = previousStatus;

          // Ensure userType is preserved
          userData.userType = "employer";

          // Save all fields we care about
          const dataToStore = {
            ...userData,
            profileImage,
            legalDocs,
            personalDoc,
            spacePhoto
          };

          console.log("Saving updated data to AsyncStorage:", dataToStore);

          // Update AsyncStorage
          await AsyncStorage.setItem('userDetails', JSON.stringify(dataToStore));

          showAlert(
            "Success",
            "Profile updated successfully!",
            () => {
              if (returnToReview) {
                navigation.navigate('EmployerReview', { updated: true });
              } else {
                navigation.goBack();
              }
            },
            "success"
          );
        } else {
          const errorMsg = response?.data?.message || response?.message || "Update failed. Please try again.";
          console.error("API Error Response:", errorMsg);
          showAlert(
            "Error",
            errorMsg,
            null,
            "error"
          );
        }
      } else {
        // Register new user
        response = await registerUser(updatedData);

        if (response?.data.success) {
          // Ensure userType is set to employer
          const userData = response.data.user;
          if (!userData.userType) {
            userData.userType = 'employer';
          }

          // Make sure status is NOT set to active initially
          userData.status = 'pending';

          // Store user data in AsyncStorage
          await AsyncStorage.setItem('userDetails', JSON.stringify(userData));

          showAlert(
            "Success",
            "Registration successful!",
            () => navigation.reset({
              index: 0,
              routes: [{ name: 'EmployerReview' }],
            }),
            "success"
          );
        } else {
          showAlert(
            "Error",
            response?.message || "Registration failed. Please try again.",
            null,
            "error"
          );
        }
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message || error);

      let errorMessage = "An error occurred. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showAlert(
        "Error",
        errorMessage,
        null,
        "error"
      );
    }
  };

  // Check form validity whenever any required field changes
  useEffect(() => {
    const checkFormValidity = () => {
      return !!(
        formData.fullName &&
        formData.email &&
        formData.gender &&
        formData.designation &&
        formData.company &&
        formData.companySize &&
        formData.industry &&
        formData.foundedIn &&
        formData.city &&
        formData.state &&
        formData.zipcode
        // legalDocs.length > 0 &&
        // personalDoc &&
        // profileImage
      );
    };

    setIsFormValid(checkFormValidity());
  }, [
    formData,
    legalDocs,
    personalDoc,
    profileImage
  ]);

  // Add new states for PAN and GST uploads
  const [isPanUploading, setIsPanUploading] = useState(false);
  const [panStatus, setPanStatus] = useState('');
  const [panStatusType, setPanStatusType] = useState(''); // 'success' | 'error' | 'loading'

  const [isGstUploading, setIsGstUploading] = useState(false);
  const [gstStatus, setGstStatus] = useState('');
  const [gstStatusType, setGstStatusType] = useState('');

  // Update company logo upload state to include status type
  const [isCompanyLogoUploading, setIsCompanyLogoUploading] = useState(false);
  const [companyLogoStatus, setCompanyLogoStatus] = useState('');
  const [companyLogoStatusType, setCompanyLogoStatusType] = useState('');

  // Helper for retry logic
  const retryAsync = async (fn, retries = 2) => {
    let lastError;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (i === retries) throw err;
      }
    }
    throw lastError;
  };

  // Company Logo Upload
  const handleCompanyLogoPick = async () => {
    try {
      setIsCompanyLogoUploading(true);
      setCompanyLogoStatus('Uploading...');
      setCompanyLogoStatusType('loading');
      closeAllDropdowns();
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        setCompanyLogoStatus('Please allow access to photos to upload logo');
        setCompanyLogoStatusType('error');
        setTimeout(() => setCompanyLogoStatus(''), 3000);
        setIsCompanyLogoUploading(false);
        return;
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });
      if (result.canceled) {
        setIsCompanyLogoUploading(false);
        setCompanyLogoStatus('');
        setCompanyLogoStatusType('');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setCompanyLogoStatus('Uploading...');
        setCompanyLogoStatusType('loading');
        try {
          const fileName = result.assets[0].fileName || imageUri.split('/').pop();
          await retryAsync(() => uploadImage(imageUri, userType, userId));
          setProfileImage(imageUri); // Save as company logo
          setCompanyLogoFileName(fileName);
          setCompanyLogoStatus('Image uploaded successfully');
          setCompanyLogoStatusType('success');
          setTimeout(() => setCompanyLogoStatus(''), 3000);
        } catch (error) {
          setProfileImage(null);
          setCompanyLogoFileName('');
          setCompanyLogoStatus('Failed to upload image');
          setCompanyLogoStatusType('error');
          setTimeout(() => setCompanyLogoStatus(''), 3000);
        } finally {
          setIsCompanyLogoUploading(false);
        }
      }
    } catch (error) {
      setCompanyLogoStatus('Failed to select logo');
      setCompanyLogoStatusType('error');
      setIsCompanyLogoUploading(false);
      setTimeout(() => setCompanyLogoStatus(''), 3000);
    }
  };

  // PAN Card Upload
  const handlePanUpload = async () => {
    try {
      setIsPanUploading(true);
      setPanStatus('Uploading...');
      setPanStatusType('loading');
      let result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: true });
      if (result.canceled) {
        setIsPanUploading(false);
        setPanStatus('');
        setPanStatusType('');
        return;
      }
      setPanStatus('Uploading...');
      setPanStatusType('loading');
      try {
        const fileName = result.assets[0].name;
        await retryAsync(() => uploadDocument(result.assets[0].uri, userId));
        setLegalDocs([result.assets[0].uri]);
        setPanFileName(fileName);
        setPanStatus('Document uploaded successfully');
        setPanStatusType('success');
        setTimeout(() => setPanStatus(''), 3000);
      } catch (error) {
        setLegalDocs([]);
        setPanFileName('');
        setPanStatus('Failed to upload document');
        setPanStatusType('error');
        setTimeout(() => setPanStatus(''), 3000);
      } finally {
        setIsPanUploading(false);
      }
    } catch (error) {
      setPanStatus('Failed to select document');
      setPanStatusType('error');
      setIsPanUploading(false);
      setTimeout(() => setPanStatus(''), 3000);
    }
  };

  // GST Certificate Upload
  const handleGstUpload = async () => {
    try {
      setIsGstUploading(true);
      setGstStatus('Uploading...');
      setGstStatusType('loading');
      let result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', multiple: true });
      if (result.canceled) {
        setIsGstUploading(false);
        setGstStatus('');
        setGstStatusType('');
        return;
      }
      setGstStatus('Uploading...');
      setGstStatusType('loading');
      try {
        const fileName = result.assets[0].name;
        await retryAsync(() => uploadDocument(result.assets[0].uri, userId));
        setPersonalDoc(result.assets[0].uri);
        setGstFileName(fileName);
        setGstStatus('Document uploaded successfully');
        setGstStatusType('success');
        setTimeout(() => setGstStatus(''), 3000);
      } catch (error) {
        setPersonalDoc(null);
        setGstFileName('');
        setGstStatus('Failed to upload document');
        setGstStatusType('error');
        setTimeout(() => setGstStatus(''), 3000);
      } finally {
        setIsGstUploading(false);
      }
    } catch (error) {
      setGstStatus('Failed to select document');
      setGstStatusType('error');
      setIsGstUploading(false);
      setTimeout(() => setGstStatus(''), 3000);
    }
  };

  return (
    // <TouchableWithoutFeedback onPress={handleOutsidePress}>
    <View style={{ flex: 1, position: 'relative' }}>
      {/* Manual Header */}
      <View style={styles.manualHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {/* {jobId ? 'Update Job' : 'Post a Job'} */}
            Employer Registration
          </Text>
        </View>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 }]}
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator = {false}
      >
        {/* Section 1: Personal Details */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle1}>{isEditing ? 'Edit Personal Details' : 'Personal Details'}</Text>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'fullName' && styles.inputFocused,
              errors.fullName ? styles.inputError : null
            ]}
            value={formData.fullName}
            onChangeText={(text) => handleChange('fullName', text)}
            placeholder=""
            onFocus={() => setFocusedInput('fullName')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

          <Text style={styles.label}>Email ID</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'email' && styles.inputFocused,
              errors.email ? styles.inputError : null
            ]}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: "#fff", color: "#b4b4b4" }
            ]}
            value={formData.phone}
            editable={false}
            keyboardType="phone-pad"
          />

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <View >
            <DropDownPicker
              open={activeDropdown === 'gender'}
              value={formData.gender}
              items={genderItems}
              setOpen={(isOpen) => { setOpenGender(isOpen); setActiveDropdown(isOpen ? 'gender' : null); }}
              setValue={(callback) => handleChange('gender', callback(formData.gender))}
              setItems={setGenderItems}
              placeholder="Select Gender"
              placeholderStyle={{
                color: "#b4b4b4",       // placeholder text color
                fontSize: 14,        // adjust font size
                fontStyle: "italic", // optional styling
              }}
              style={[styles.dropdown, errors.gender ? styles.inputError : null]}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={1002}
              zIndexInverse={3000}
              tickIconStyle={{ tintColor: "#BE4145" }}
              closeOnBackPressed={true}
            />
          </View>
          {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Designation</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <View >
            <DropDownPicker
              open={activeDropdown === 'designation'}
              value={formData.designation}
              items={designationItems}
              setOpen={(isOpen) => { setDesignationOpen(isOpen); setActiveDropdown(isOpen ? 'designation' : null); }}
              setValue={(callback) => handleChange('designation', callback(formData.designation))}
              setItems={setDesignationItems}
              placeholder="Select designation"
              placeholderStyle={{
                color: "#b4b4b4",       // placeholder text color
                fontSize: 14,        // adjust font size
                fontStyle: "italic", // optional styling
              }}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              zIndex={1000}
              zIndexInverse={1003}
              tickIconStyle={{ tintColor: "#BE4145" }}
            />
          </View>
          {errors.designation ? <Text style={styles.errorText}>{errors.designation}</Text> : null}
        </View>

        {/* Section 2: Company Details */}
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
              errors.company ? styles.inputError : null
            ]}
            value={formData.company}
            onChangeText={(text) => handleChange('company', text)}
            onFocus={() => setFocusedInput('company')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.company ? <Text style={styles.errorText}>{errors.company}</Text> : null}

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Number of Employees </Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <DropDownPicker
            open={activeDropdown === 'companySize'}
            value={formData.companySize}
            items={companySizeItems}
            setOpen={(isOpen) => { setCompanySizeOpen(isOpen); setActiveDropdown(isOpen ? 'companySize' : null); }}
            setValue={(callback) => handleChange('companySize', callback(formData.companySize))}
            setItems={setCompanySizeItems}
            placeholder="Select company size"
            placeholderStyle={{
              color: "#b4b4b4",       // placeholder text color
              fontSize: 14,        // adjust font size
              fontStyle: "italic", // optional styling
            }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            listMode="SCROLLVIEW"
            zIndex={1005}
            zIndexInverse={2000}
            tickIconStyle={{ tintColor: "#BE4145" }}
          />
          {errors.companySize ? <Text style={styles.errorText}>{errors.companySize}</Text> : null}

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Industry</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <DropDownPicker
            open={activeDropdown === 'industry'}
            value={formData.industry}
            items={industryItems}
            setOpen={(isOpen) => { setIndustryOpen(isOpen); setActiveDropdown(isOpen ? 'industry' : null); }}
            setValue={(callback) => handleChange('industry', callback(formData.industry))}
            setItems={setIndustryItems}
            placeholder="Select industry"
            placeholderStyle={{
              color: "#b4b4b4",       // placeholder text color
              fontSize: 14,        // adjust font size
              fontStyle: "italic", // optional styling
            }}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            listMode="SCROLLVIEW"
            zIndex={1000}
            zIndexInverse={3000}
            tickIconStyle={{ tintColor: "#BE4145" }}
          />
          {errors.industry ? <Text style={styles.errorText}>{errors.industry}</Text> : null}

          {/* Rest of company details */}
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Founded In (year)</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'foundedIn' && styles.inputFocused,
              errors.foundedIn ? styles.inputError : null
            ]}
            value={formData.foundedIn}
            onChangeText={(text) => handleChange('foundedIn', text)}
            keyboardType="numeric"
            maxLength={4}
            placeholder="YYYY"
            onFocus={() => setFocusedInput('foundedIn')}
            onBlur={() => {
              setFocusedInput(null);
              if (formData.foundedIn) {
                const validation = validateFoundedIn(formData.foundedIn);
                if (!validation.valid) {
                  setErrors(prev => ({ ...prev, foundedIn: validation.message }));
                }
              }
            }}
          />
          {errors.foundedIn ? <Text style={styles.errorText}>{errors.foundedIn}</Text> : null}

          <View style={styles.labelContainer}>
            <Text style={styles.label}>City</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'city' && styles.inputFocused,
              errors.city ? styles.inputError : null
            ]}
            value={formData.city}
            onChangeText={(text) => handleChange('city', text)}
            placeholder="Enter city name"
            placeholderTextColor="#b4b4b4"
            onFocus={() => setFocusedInput('city')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

          <View style={styles.labelContainer}>
            <Text style={styles.label}>State</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          {/* {console.log("Rendering State Dropdown with value:", stateItems)} */}
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
            placeholderStyle={{
              color: "#b4b4b4",       // placeholder text color
              fontSize: 14,        // adjust font size
              fontStyle: "italic", // optional styling
            }}
            // textStyle={{ fontSize: 16, color: "#222" }}
            tickIconStyle={{ tintColor: "#BE4145" }}

          />

          {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Country</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TextInput
            value={formData.country}
            style={[
              styles.input,
              { backgroundColor: "#fff", color: "#b4b4b4" }
            ]}
            onChangeText={(text) => handleChange('country', text)}
            editable={false}
          />

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Pincode</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'zipcode' && styles.inputFocused,
              errors.zipcode ? styles.inputError : null
            ]}
            value={formData.zipcode}
            onChangeText={(text) => handleChange('zipcode', text)}
            keyboardType="numeric"
            maxLength={6}
            placeholder="6-digit pincode"
            placeholderTextColor={"#b4b4b4"}
            onFocus={() => setFocusedInput('zipcode')}
            onBlur={() => {
              setFocusedInput(null);
              if (formData.zipcode) {
                const validation = validatePincode(formData.zipcode);
                if (!validation.valid) {
                  setErrors(prev => ({ ...prev, zipcode: validation.message }));
                }
              }
            }}
          />
          {errors.zipcode ? <Text style={styles.errorText}>{errors.zipcode}</Text> : null}

          <Text style={styles.label}>Company Social Media Link</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'socialLinks' && styles.inputFocused,
              errors.socialLinks ? styles.inputError : null
            ]}
            value={formData.socialLinks}
            onChangeText={(text) => handleChange('socialLinks', text)}
          />
          {errors.socialLinks ? <Text style={styles.errorText}>{errors.socialLinks}</Text> : null}
        </View>

        <View style={[styles.sectionContainer, { marginTop: 2 }]}>
          <Text style={styles.sectionTitle}>Upload Documents</Text>
          {/* PAN Card Upload */}
          <View style={styles.uploadRow}>
            <View style={{ width: '100%' }}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>PAN Card</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePanUpload}
                disabled={isPanUploading}
                activeOpacity={0.7}
              >
                {isPanUploading ? (
                  <ActivityIndicator size="small" color="#BE4145" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={20} color="#BE4145" />
                    <Text style={styles.uploadButtonText}>Upload PAN Card</Text>
                  </>
                )}
              </TouchableOpacity>
              {panStatusType === 'success' && (
                <Text style={styles.successText}>Document uploaded successfully</Text>
              )}
              {panStatusType === 'success' && panFileName ? (
                <Text style={styles.fileName}>{panFileName}</Text>
              ) : null}
              {panStatusType === 'error' && panStatus && (
                <Text style={styles.errorTextInline}>{panStatus}</Text>
              )}
            </View>
          </View>
          {errors.legalDocs && <Text style={styles.errorText}>{errors.legalDocs}</Text>}

          {/* GST Certificate Upload */}
          <View style={styles.uploadRow}>
            <View style={{ width: '100%' }}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>GST Certificate</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleGstUpload}
                disabled={isGstUploading}
                activeOpacity={0.7}
              >
                {isGstUploading ? (
                  <ActivityIndicator size="small" color="#BE4145" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={20} color="#BE4145" />
                    <Text style={styles.uploadButtonText}>Upload GST Certificate</Text>
                  </>
                )}
              </TouchableOpacity>
              {gstStatusType === 'success' && (
                <Text style={styles.successText}>Document uploaded successfully</Text>
              )}
              {gstStatusType === 'success' && gstFileName ? (
                <Text style={styles.fileName}>{gstFileName}</Text>
              ) : null}
              {gstStatusType === 'error' && gstStatus && (
                <Text style={styles.errorTextInline}>{gstStatus}</Text>
              )}
            </View>
          </View>
          {errors.personalDoc && <Text style={styles.errorText}>{errors.personalDoc}</Text>}

          {/* Company Logo Upload */}
          <View style={styles.uploadRow}>
            <View style={{ width: '100%' }}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Company Logo</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleCompanyLogoPick}
                disabled={isCompanyLogoUploading}
                activeOpacity={0.7}
              >
                {isCompanyLogoUploading ? (
                  <ActivityIndicator size="small" color="#BE4145" />
                ) : (
                  <>
                    <Ionicons name="image" size={20} color="#BE4145" />
                    <Text style={styles.uploadButtonText}>Upload Logo</Text>
                  </>
                )}
              </TouchableOpacity>
              {companyLogoStatusType === 'success' && (
                <Text style={styles.successText}>Image uploaded successfully</Text>
              )}
              {companyLogoStatusType === 'success' && companyLogoFileName ? (
                <Text style={styles.fileName}>{companyLogoFileName}</Text>
              ) : null}
              {companyLogoStatusType === 'error' && companyLogoStatus && (
                <Text style={styles.errorTextInline}>{companyLogoStatus}</Text>
              )}
            </View>
          </View>
          {errors.profileImage && <Text style={styles.errorText}>{errors.profileImage}</Text>}
        </View>
      </ScrollView>
      {/* Sticky Submit/Update Button */}
      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !isFormValid && styles.saveButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <Text style={styles.saveButtonText}>{isEditing ? 'Update Details' : 'Submit Details'}</Text>
        </TouchableOpacity>
      </View>
      {/* CustomAlert sticky at the bottom */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
        onConfirm={() => {
          setAlertVisible(false);
          if (alertOnConfirm) {
            alertOnConfirm();
          }
        }}
      />
    </View>
    // </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    padding: 24,
  },
  contentContainer: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#BE4145',
  },
  emptyProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageIcon: {
    position: 'absolute',
    bottom: 0,
    right: width / 2 - 80,
    backgroundColor: '#BE4145',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
    maxWidth: 440,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 24,
    color: '#333',
    marginBottom: 24,
    marginTop: 24,
    textAlign: 'left',
  },
  sectionTitle1: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 24,
    color: '#333',
    marginBottom: 24,
    marginTop: 24,
    textAlign: 'left',
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
    marginLeft: 2,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requiredStar: {
    color: "#BE4145",
    fontSize: 12,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 0,
    height: 48,
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#333',
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
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  dropdownContainer: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 6,
  },
  button: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#BE4145",
    minHeight: 44,
    width: '100%',
  },
  buttonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
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
    marginTop: 4,
    marginBottom: 8,
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
    color: '#444444',
  },
  searchableDropdownContainer: {
    position: 'relative',
    zIndex: 9500,
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#BE4145',
  },
  errorText: {
    color: '#BE4145',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  uploadRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    paddingBottom: 0,
    gap: 0,
    width: '100%',
  },
  uploadButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BE4145',
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: 0,
  },
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  uploadButtonText: {
    color: '#BE4145',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginLeft: 8,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    marginLeft: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorTextInline: {
    color: '#BE4145',
    fontSize: 12,
    flexShrink: 1,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    paddingTop: 16,
    paddingBottom: 24,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 0,
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

export default EmployerRegistration;