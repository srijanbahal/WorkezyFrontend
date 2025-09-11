import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Platform, Modal } from 'react-native';
import { TextInput, Button } from 'react-native-paper'; // Import TextInput from react-native-paper
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { registerUser, uploadImage } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';
import { ActivityIndicator } from 'react-native';

const JobSeekerRegistration = ({ route }) => {
  const navigation = useNavigation();
  const { mobile, countryCode } = route.params;
  const userType = 'job_seeker';
  const userId = mobile;

  // State Variables
  const [profileImage, setProfileImage] = useState("");
  const [isReloading, setIsReloading] = useState(false);

  const [formData, setFormData] = useState({
    userType: 'job_seeker',
    profileImage: profileImage,
    full_name: '',
    email: '',
    countryCode: countryCode,
    phone: mobile,
    city: "",
    state: '',
    country: 'India',
    experience: '',
    industry: '',
    gender: null,
    highestEducation: null,

    dateOfBirth: ''
  });

  // Dropdown states
  const [openGender, setOpenGender] = useState(false);
  // track which dropdown is currently open – ensures only one open at a time
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [genderItems, setGenderItems] = useState([
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ]);

  const [industryOpen, setIndustryOpen] = useState(false);
  const [industryItems, setIndustryItems] = useState([
    // { label: 'IT', value: 'it' },
    // { label: 'Finance', value: 'finance' },
    // { label: 'Healthcare', value: 'healthcare' },
    // { label: 'Education', value: 'education' },
    // { label: 'Electrician', value: 'electrician' },
    // { label: 'Plumber', value: 'plumber' },
    // { label: 'Carpenter', value: 'carpenter' },
    // { label: 'Painter', value: 'painter' },
    // { label: 'Welder', value: 'welder' },
    // { label: 'Mechanic', value: 'mechanic' },
    // { label: 'Technician (AC, Refrigerator, etc.)', value: 'technician' },
    // { label: 'Machine Operator', value: 'machine_operator' },
    // { label: 'Hotel Manager', value: 'hotel_manager' },
    // { label: 'Office Boy', value: 'office_boy' },
    // { label: 'Admin', value: 'admin' },
    // { label: 'Receptionist', value: 'receptionist' },
    // { label: 'Bartender', value: 'bartender' },
    // { label: 'Housekeeping', value: 'housekeeping' },
    // { label: 'Beautician', value: 'beautician' },
    // { label: 'Warehouse Worker', value: 'warehouse_worker' },
    // { label: 'Procurement/Purchase', value: 'procurement_purchase' },
    // { label: 'Supply Chain', value: 'supply_chain' },
    // { label: 'Operations', value: 'operations' },
    // { label: 'Field Sales', value: 'field_sales' },
    // { label: 'Business Development', value: 'business_development' },
    // { label: 'Key Account Manager (KAM)', value: 'kam' },
    // { label: 'Customer Support', value: 'customer_support' },
    // { label: 'Lab Technician', value: 'lab_technician' },
    // { label: 'Nurse', value: 'nurse' },
    // { label: 'Compounder', value: 'compounder' },
    // { label: 'Content Writer', value: 'content_writer' },
    // { label: 'Graphics Designer', value: 'graphics_designer' },
    // { label: 'Digital Marketing', value: 'digital_marketing' },
    // { label: 'Web Developer', value: 'web_developer' },
    // { label: 'Tailor', value: 'tailor' },
    // { label: 'Maid / Caretaker', value: 'maid_caretaker' },
    // { label: 'Babysitter', value: 'babysitter' },
    // { label: 'Nanny', value: 'nanny' },
    // { label: 'House Cleaner', value: 'house_cleaner' },
    // { label: 'Pest Control', value: 'pest_control' },
    // { label: 'Data Entry', value: 'data_entry' },
    // { label: 'Back Office', value: 'back_office' },
    // { label: 'Other', value: 'other' },
     { label: "All", value: "all" },
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

  const [openEducation, setOpenEducation] = useState(false);
  const [educationItems, setEducationItems] = useState([
    { label: '10th Pass', value: '10th' },
    { label: '12th Pass', value: '12th' },
    { label: 'Graduate', value: 'UG' },
    { label: 'Postgraduate', value: 'PG' },
    // { label: 'PhD', value: 'PhD' },
  ]); // Only used for dropdown

  const [experienceOpen, setExperienceOpen] = useState(false);
  const ExperienceItems = [
    { label: 'Fresher', value: 'fresher' },
    { label: '1-2 Years', value: '1-2years' },
    { label: '3-5 Years', value: '3-5years' },
    { label: '6-8 Years', value: '6-8years' },
    { label: '9-12 Years', value: '9-12years' },
    { label: '13-15 Years', value: '13-15years' },
    { label: '15+ Years', value: '15+years' },
  ];

  const [openState, setOpenState] = useState(false);
  const [stateItems, setStateItems] = useState([
    { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
    { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
    { label: 'Assam', value: 'Assam' },
    { label: 'Bihar', value: 'Bihar' },
    { label: 'Chhattisgarh', value: 'Chhattisgarh' },
    { label: 'Goa', value: 'Goa' },
    { label: 'Gujarat', value: 'Gujarat' },
    { label: 'Haryana', value: 'Haryana' },
    { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
    { label: 'Jharkhand', value: 'Jharkhand' },
    { label: 'Karnataka', value: 'Karnataka' },
    { label: 'Kerala', value: 'Kerala' },
    { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
    { label: 'Maharashtra', value: 'Maharashtra' },
    { label: 'Manipur', value: 'Manipur' },
    { label: 'Meghalaya', value: 'Meghalaya' },
    { label: 'Mizoram', value: 'Mizoram' },
    { label: 'Nagaland', value: 'Nagaland' },
    { label: 'Odisha', value: 'Odisha' },
    { label: 'Punjab', value: 'Punjab' },
    { label: 'Rajasthan', value: 'Rajasthan' },
    { label: 'Sikkim', value: 'Sikkim' },
    { label: 'Tamil Nadu', value: 'Tamil Nadu' },
    { label: 'Telangana', value: 'Telangana' },
    { label: 'Tripura', value: 'Tripura' },
    { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
    { label: 'Uttarakhand', value: 'Uttarakhand' },
    { label: 'West Bengal', value: 'West Bengal' },
    { label: 'Andaman and Nicobar Islands', value: 'Andaman and Nicobar Islands' },
    { label: 'Chandigarh', value: 'Chandigarh' },
    { label: 'Daman and Diu', value: 'Dadra and Nagar Haveli and Daman and Diu' },
    { label: 'Lakshadweep', value: 'Lakshadweep' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Puducherry', value: 'Puducherry' },
    { label: 'Ladakh', value: 'Ladakh' },
    { label: 'Jammu and Kashmir', value: 'Jammu and Kashmir' }
  ]);

  // Alert state (EditProfile style)
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    message: '',
    type: 'info',
    title: '',
  });

  // Add validation state
  const [errors, setErrors] = useState({
    name: '',
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

  // Add DOB state
  const [openDay, setOpenDay] = useState(false);
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

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

  // Handle dropdown changes
  useEffect(() => {
    if (formData.gender) {
      setOpenGender(false);
    }
  }, [formData.gender]);

  useEffect(() => {
    if (formData.highestEducation) {
      setOpenEducation(false);
    }
  }, [formData.highestEducation]);

  // Handle Input Changes
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    // Clear the error for the field when it's changed
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
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
      const uploadedImageUrl = await uploadImage(imageUri, userType, userId);
      // Uploaded successfully – no alert requested
      console.log("Uploaded Image URL:", uploadedImageUrl);
      setProfileImage(uploadedImageUrl);
    } catch (error) {
      console.error('Image upload failed', error);
    }
  };

  // Add this useEffect after the selectedDay/Month/Year state declarations
  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear && isValidDate(selectedDay, selectedMonth, selectedYear)) {
      const dob = `${selectedYear}-${selectedMonth}-${selectedDay}`;
      setFormData(prev => ({ ...prev, dateOfBirth: dob }));
    } else {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  // Handle Form Submission
  const handleSubmit = async () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.full_name) {
      newErrors.full_name = 'Please enter your full name';
    }
    // if (!formData.email) {
    //   newErrors.email = 'Please enter your email address';
    // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = 'Please enter a valid email address';
    // }
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

    // If there are any errors, don't proceed with submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    const { full_name, ...rest } = formData;
    const data = {
      ...rest,
      fullName: full_name,
      profileImage: profileImage,
    };

    try {
      const response = await registerUser(data);

      if (response?.data.success) {
        await AsyncStorage.setItem('userDetails', JSON.stringify(response.data.user));
        // Reload the app to ensure fresh profile data is loaded everywhere
        try {
          await Updates.reloadAsync();
        } catch (e) {
          console.warn('App reload failed', e);
          setIsReloading(false);
          navigation.reset({ index: 0, routes: [{ name: 'JobList' }] });
        }
      } else {
        showAlert(response?.message || "Registration failed");
      }
    } catch (error) {
      console.log(error);
      showAlert("Something went wrong. Please try again.");
    }
  };

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
    setTimeout(() => hideAlert(), 1000);
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Update isFormValid to check formData.dateOfBirth
  const isFormValid = () => {
    return (
      formData.full_name.trim() &&
      // formData.email.trim() &&
      // /\S+@\S+\.\S+/.test(formData.email) &&
      formData.gender &&
      formData.city.trim() &&
      formData.state &&
      formData.country &&
      formData.highestEducation &&
      formData.experience &&
      formData.industry &&
      formData.dateOfBirth // Now checks the actual date string
    );
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      scrollViewProps={{ nestedScrollEnabled: true }}
    >
      <View style={styles.card}>
        {/* Profile Image Upload - now inside the card, above the fields */}
        <View style={styles.imageContainer}>
          <Image
            source={profileImage ? { uri: profileImage } : ""}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageIcon} onPress={handleImagePick}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          {/* Full Name */}
          <Text style={styles.label}>Full Name<Text style={{ color: '#be4145' }}>*</Text></Text>
          <TextInput
            value={formData.full_name}
            onChangeText={(text) => handleChange('full_name', text)}
            mode="outlined"
            style={[styles.input, errors.full_name ? styles.inputError : null]}
            outlineColor="#e0e0e0"
            activeOutlineColor="#BE4145"
            theme={{ roundness: 8, colors: { primary: '#A9A9A9', onSurfaceVariant: '#777777' } }}
            placeholder="Enter full name"
            placeholderTextColor="#999999"
          />
          {errors.full_name ? <Text style={styles.errorText}>{errors.full_name}</Text> : null}

          {/* Email Address */}
          {/* <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            mode="outlined"
            style={[styles.input, errors.email ? styles.inputError : null]}
            outlineColor="#e0e0e0"
            activeOutlineColor="#BE4145"
            autoCapitalize="none"
            keyboardType="email-address"
            theme={{ roundness: 8, colors: { primary: '#A9A9A9', onSurfaceVariant: '#777777' } }}
            placeholder="Enter email address"
            placeholderTextColor="#999999"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null} */}

          {/* Phone Number */}
          <Text style={styles.label}>Phone Number<Text style={{ color: '#be4145' }}>*</Text></Text>
          <TextInput
            value={mobile}
            mode="outlined"
            style={[styles.input, { backgroundColor: '#f5f5f5' }]}
            outlineColor="#e0e0e0"
            activeOutlineColor="#BE4145"
            theme={{ roundness: 8, colors: { primary: '#A9A9A9', onSurfaceVariant: '#777777' } }}
            placeholderTextColor="#999999"
            disabled
          />

          {/* Gender */}
          <Text style={styles.label}>Gender<Text style={{ color: '#be4145' }}>*</Text></Text>
          <DropDownPicker
            open={activeDropdown === 'gender'}
            value={formData.gender}
            items={genderItems}
            setOpen={(isOpen) => { setOpenGender(isOpen); setActiveDropdown(isOpen ? 'gender' : null); if (isOpen) { setOpenDay(false); setOpenMonth(false); setOpenYear(false); } }}
            setValue={(callback) => handleChange('gender', callback(formData.gender))}
            setItems={setGenderItems}
            placeholder="Select Gender"
            style={[styles.dropdown, errors.gender ? styles.inputError : null]}
            dropDownContainerStyle={styles.dropdownContainer}
            zIndex={1000}
            listMode="SCROLLVIEW"
            scrollViewProps={{ nestedScrollEnabled: true }}
            placeholderStyle={{ color: "#999999", fontSize: 14 }}
            textStyle={{ fontSize: 14, color: "#333333" }}
            tickIconStyle={{ tintColor: "#BE4145" }}
          />
          {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

          {/* Date of Birth */}
          <Text style={styles.label}>Date of Birth<Text style={{ color: '#be4145' }}>*</Text></Text>
          <View style={styles.datePickerRow}>
            <View style={styles.datePickerColumnDay}>
              <DropDownPicker
                open={openDay}
                value={selectedDay}
                items={days}
                setOpen={handleOpenDay}
                setValue={setSelectedDay}
                placeholder="Day"
                style={styles.dateDropdown}
                dropDownContainerStyle={styles.dateDropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={1010}
                zIndexInverse={1000}
                placeholderStyle={{ color: "#999999", fontSize: 14 }}
              tickIconStyle={{ tintColor: "#BE4145" }}

              />
            </View>
            <View style={styles.datePickerColumnMonth}>
              <DropDownPicker
                open={openMonth}
                value={selectedMonth}
                items={months}
                setOpen={handleOpenMonth}
                setValue={setSelectedMonth}
                placeholder="Month"
                style={styles.dateDropdown}
                dropDownContainerStyle={styles.dateDropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={1010}
                
              tickIconStyle={{ tintColor: "#BE4145" }}

                placeholderStyle={{ color: "#999999", fontSize: 14 }}
              />
            </View>
            <View style={styles.datePickerColumnYear}>
              <DropDownPicker
                open={openYear}
                value={selectedYear}
                items={years}
                setOpen={handleOpenYear}
                setValue={setSelectedYear}
                placeholder="Year"
              tickIconStyle={{ tintColor: "#BE4145" }}

                style={styles.dateDropdown}
                dropDownContainerStyle={styles.dateDropdownContainer}
                listMode="SCROLLVIEW"
                zIndex={1010}
                placeholderStyle={{ color: "#999999", fontSize: 14 }}
              />
            </View>
          </View>
          {errors.dateOfBirth ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text> : null}

          {/* City */}
          <Text style={styles.label}>City<Text style={{ color: '#be4145' }}>*</Text></Text>
          <TextInput
            value={formData.city}
            onChangeText={(text) => handleChange('city', text)}
            mode="outlined"
            style={[styles.input, errors.city ? styles.inputError : null]}
            outlineColor="#e0e0e0"
            activeOutlineColor="#BE4145"
            theme={{ roundness: 8, colors: { primary: '#A9A9A9', onSurfaceVariant: '#777777' } }}
            placeholder="Enter city"
            placeholderTextColor="#999999"
          />
          {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

          {/* State */}
          <Text style={styles.label}>State<Text style={{ color: '#be4145' }}>*</Text></Text>
          <DropDownPicker
            open={activeDropdown === 'state'}
            value={formData.state}
            items={stateItems}
            setOpen={(isOpen) => { setOpenState(isOpen); setActiveDropdown(isOpen ? 'state' : null); if (isOpen) { setOpenDay(false); setOpenMonth(false); setOpenYear(false); } }}
            setValue={(callback) => setFormData(prev => ({ ...prev, state: callback(prev.state) }))}
            setItems={setStateItems}
            placeholder="Select State"
            style={[styles.dropdown, errors.state ? styles.inputError : null]}
            dropDownContainerStyle={{ ...styles.dropdownContainer, marginBottom: 16 }}
            zIndex={1008}
            zIndexInverse={1020}
            tickIconStyle={{ tintColor: "#BE4145" }}

            listMode="SCROLLVIEW"
            scrollViewProps={{ nestedScrollEnabled: true }}
            placeholderStyle={{ color: "#999999", fontSize: 14 }}
            textStyle={{ fontSize: 14, color: "#333333" }}
          />
          {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}

          {/* Country */}
          <Text style={styles.label}>Country<Text style={{ color: '#be4145' }}>*</Text></Text>
          <TextInput
            value={formData.country}
            onChangeText={(text) => handleChange('country', text)}
            mode="outlined"
            style={[styles.input, { backgroundColor: '#f5f5f5' }, errors.country ? styles.inputError : null]}
            outlineColor="#e0e0e0"

            activeOutlineColor="#BE4145"
            theme={{ roundness: 8, colors: { primary: '#A9A9A9', onSurfaceVariant: '#777777' } }}
            placeholder="Enter country"
            placeholderTextColor="#999999"
            editable={false}
            disabled
          />
          {errors.country ? <Text style={styles.errorText}>{errors.country}</Text> : null}

          {/* Highest Education */}
          <Text style={styles.label}>Highest Education<Text style={{ color: '#be4145' }}>*</Text></Text>
          <DropDownPicker
            open={activeDropdown === 'education'}
            value={formData.highestEducation}
            items={educationItems}
            setOpen={(isOpen) => { setOpenEducation(isOpen); setActiveDropdown(isOpen ? 'education' : null); if (isOpen) { setOpenDay(false); setOpenMonth(false); setOpenYear(false); } }}
            setValue={(callback) => handleChange('highestEducation', callback(formData.highestEducation))}
            setItems={setEducationItems}
            placeholder="Select Highest education"
            style={[styles.dropdown, errors.highestEducation ? styles.inputError : null]}
            dropDownContainerStyle={{...styles.dropdownContainer, marginBottom: 16}}
            listMode="SCROLLVIEW"
            zIndex={1010}
            placeholderStyle={{ color: "#999999", fontSize: 14 }}
            textStyle={{ fontSize: 14, color: "#333333" }}
            tickIconStyle={{ tintColor: "#BE4145" }}

          />
          {errors.highestEducation ? <Text style={styles.errorText}>{errors.highestEducation}</Text> : null}

          {/* Experience */}
          <Text style={styles.label}>Experience<Text style={{ color: '#be4145' }}>*</Text></Text>
          <DropDownPicker
            open={activeDropdown === 'experience'}
            value={formData.experience}
            items={ExperienceItems}
            setOpen={(isOpen) => { setExperienceOpen(isOpen); setActiveDropdown(isOpen ? 'experience' : null); if (isOpen) { setOpenDay(false); setOpenMonth(false); setOpenYear(false); } }}
            setValue={(callback) => setFormData(prev => ({ ...prev, experience: callback(prev.experience) }))}
            placeholder="Select your experience"
            style={[styles.dropdown, errors.experience ? styles.inputError : null]}
            dropDownContainerStyle={{...styles.dropdownContainer, marginBottom: 16}}
            tickIconStyle={{ tintColor: "#BE4145" }}

            listMode="SCROLLVIEW"
            // scrollViewProps={{ nestedScrollEnabled: true }}
            zIndex={1010}
            placeholderStyle={{ color: "#999999", fontSize: 14 }}
            textStyle={{ fontSize: 14, color: "#333333" }}
          />
          {errors.experience ? <Text style={styles.errorText}>{errors.experience}</Text> : null}

          {/* Job Category */}
          <Text style={styles.label}>Job Category<Text style={{ color: '#be4145' }}>*</Text></Text>
          <DropDownPicker
            open={activeDropdown === 'industry'}
            value={formData.industry}
            items={industryItems}
            setOpen={(isOpen) => { setIndustryOpen(isOpen); setActiveDropdown(isOpen ? 'industry' : null); if (isOpen) { setOpenDay(false); setOpenMonth(false); setOpenYear(false); } }}
            setValue={(callback) => handleChange('industry', callback(formData.industry))}
            setItems={setIndustryItems}
            placeholder="Select Role"
            style={[styles.dropdown, errors.industry ? styles.inputError : null]}
            dropDownContainerStyle={{ ...styles.dropdownContainer, marginBottom: 16 }}
            tickIconStyle={{ tintColor: "#BE4145" }}

            listMode="SCROLLVIEW"
            // scrollViewProps={{ nestedScrollEnabled: true }}
            zIndex={1010}
            placeholderStyle={{ color: "#999999", fontSize: 14 }}
            textStyle={{ fontSize: 14, color: "#333333" }}
          />
          {errors.industry ? <Text style={styles.errorText}>{errors.industry}</Text> : null}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.saveButton, !isFormValid() && { backgroundColor: '#cccccc' }]}
          onPress={handleSubmit}
          disabled={!isFormValid()}
        >
          <Text style={styles.saveButtonText}>Register</Text>
        </TouchableOpacity>

        {/* Custom Alert - EditProfile style */}
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
        />
        <Modal transparent visible={isReloading} animationType="fade">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' }}>
            <ActivityIndicator size="large" color="#BE4145" />
          </View>
        </Modal>
        {/* previously overlay replaced by modal */}
        {/* Keep ScrollView closing tag below */}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 12,
    marginBottom: 24,
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
  inputContainer: {
    width: '100%',
    marginBottom: 0,
    borderColor: 'transparent',
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter-Regular',
    minHeight: 48,
    height: 48,

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
  dropdownContainer: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 2000,
    // marginTop: -8,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#be4145',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
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
  },
  errorText: {
    color: '#be4145',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    marginLeft: 2,
  },
  dateInputContainer: {
    marginBottom: 16,
    width: '100%',
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
  datePickerColumnMonth: {
    flexBasis: '40%',
    maxWidth: '40%',
  },
  datePickerColumnYear: {
    flexBasis: '35%',
    maxWidth: '30%',
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
  dateDropdownContainer: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
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
});

export default JobSeekerRegistration;