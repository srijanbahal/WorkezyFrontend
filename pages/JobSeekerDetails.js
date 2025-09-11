import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import CustomAlert from '../component/CustomAlert';
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { ResumeData, GetResumeDetails } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';

const JobSeekerDetails = ({ route }) => {
  const { userId, fromJobApply } = route.params;
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    userId: userId,
    highestEducation: "",
    educationDetails: {},
    experience: [],
  });

  const [openEducation, setOpenEducation] = useState(false);
  const [educationItems, setEducationItems] = useState([
    { label: "10th Pass", value: "10th" },
    { label: "12th Pass", value: "12th" },
    { label: "Graduate", value: "UG" },
    { label: "Post Graduate", value: "PG" },

  ]);

  // Board dropdown state
  const [openBoardDropdowns, setOpenBoardDropdowns] = useState({
    "10th": false,
    "12th": false,
    "UG": false,
    "PG": false
  });

  const [boardItems] = useState([
    { label: "CBSE", value: "CBSE" },
    { label: "State Board", value: "State Board" },
    { label: "Others", value: "Others" },
  ]);

  // UG and PG course options
  const ugCourses = [
    { label: "BTech / BE", value: "BTech / BE" },
    { label: "BSc", value: "BSc" },
    { label: "BCom", value: "BCom" },
    { label: "BA", value: "BA" },
    { label: "BBA", value: "BBA" },
    { label: "BCA", value: "BCA" },
    { label: "BArch", value: "BArch" },
    { label: "BPharm", value: "BPharm" },
    { label: "BDS", value: "BDS" },
    { label: "MBBS", value: "MBBS" },
    { label: "BPT", value: "BPT" },
    { label: "BEd", value: "BEd" },
    { label: "LLB", value: "LLB" },
    { label: "BDes", value: "BDes" },
    { label: "BMS", value: "BMS" },
    { label: "BStat", value: "BStat" },
    { label: "Other", value: "Other" },
  ];

  const pgCourses = [
    { label: "MTech / ME", value: "MTech / ME" },
    { label: "MSc", value: "MSc" },
    { label: "MCom", value: "MCom" },
    { label: "MA", value: "MA" },
    { label: "MBA / PGDM", value: "MBA / PGDM" },
    { label: "MCA", value: "MCA" },
    { label: "MArch", value: "MArch" },
    { label: "MPharm", value: "MPharm" },
    { label: "MD / MS", value: "MD / MS" },
    { label: "MPT", value: "MPT" },
    { label: "MEd", value: "MEd" },
    { label: "LLM", value: "LLM" },
    { label: "MDes", value: "MDes" },
    { label: "MStat", value: "MStat" },
    { label: "MPhil", value: "MPhil" },
    { label: "Other", value: "Other" },
  ];
  // custom alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');

  // validation errors for education percentage / year
  const [eduErrors, setEduErrors] = useState({});

  // Years, months for pickers (year not less than 1980)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) => (currentYear - i).toString());
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Keep only these states, remove all zIndex states
  const [startMonthOpen, setStartMonthOpen] = useState(false);
  const [startMonthValue, setStartMonthValue] = useState(null);

  const [startYearOpen, setStartYearOpen] = useState(false);
  const [startYearValue, setStartYearValue] = useState(null);

  const [endMonthOpen, setEndMonthOpen] = useState(false);
  const [endMonthValue, setEndMonthValue] = useState(null);

  const [endYearOpen, setEndYearOpen] = useState(false);
  const [endYearValue, setEndYearValue] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if form has complete data to enable submit button
  const hasCompleteEducationData = () => {
    if (!formData.highestEducation) return false;

    // Check if any education level has complete data
    const educationDetails = formData.educationDetails || {};
    return Object.values(educationDetails).some(level => {
      return level && level.board && level.percentage && level.year;
    });
  };

  const hasCompleteExperienceData = () => {
    if (!formData.experience || formData.experience.length === 0) return false;

    // Check if any experience entry has complete data
    return formData.experience.some(exp => {
      const hasBasicInfo = exp.jobTitle && exp.company && exp.location;
      const hasStartDate = exp.startDate;

      // If currently working, only need start date
      if (exp.currentlyWorking) {
        return hasBasicInfo && hasStartDate;
      }

      // If not currently working, need both start and end date
      return hasBasicInfo && hasStartDate && exp.endDate;
    });
  };

  const isFormValid = () => {
    return hasCompleteEducationData() || hasCompleteExperienceData();
  };

  // Add a style for picker dropdowns with border
  const pickerDropdownStyle = {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 0,
    minHeight: 44,
    justifyContent: 'center',
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      // If updating experience array (nested field)
      if (field.startsWith("experience[")) {
        const match = field.match(/experience\[(\d+)\]\.(\w+)/); // Extract index and key
        if (match) {
          const index = Number(match[1]); // Convert index to number
          const key = match[2]; // Extract the field name inside experience
          const updatedExperience = [...prev.experience]; // Copy experience array

          // Initialize the object at the index if it doesn't exist
          if (!updatedExperience[index]) {
            updatedExperience[index] = {};
          }

          updatedExperience[index] = { ...updatedExperience[index], [key]: value }; // Update specific experience object
          return { ...prev, experience: updatedExperience }; // Set updated state
        }
      }
      // For other fields
      return { ...prev, [field]: value };
    });
  };

  const handleEducationChange = (field, value, level) => {
    setFormData((prev) => {
      // Initialize educationDetails object if it doesn't exist
      const currentEducationDetails = prev.educationDetails || {};

      // Initialize the level object if it doesn't exist
      const levelDetails = currentEducationDetails[level] || {};

      return {
        ...prev,
        educationDetails: {
          ...currentEducationDetails,
          [level]: { ...levelDetails, [field]: value },
        },
      };
    });
  };

  const toggleBoardDropdown = (level, isOpen) => {
    setOpenBoardDropdowns(prev => ({
      ...prev,
      [level]: isOpen
    }));

    // Close other dropdowns when one is opened
    if (isOpen) {
      Object.keys(openBoardDropdowns).forEach(key => {
        if (key !== level) {
          setOpenBoardDropdowns(prev => ({
            ...prev,
            [key]: false
          }));
        }
      });

      // Also close the main education dropdown if any board dropdown is open
      if (isOpen) {
        setOpenEducation(false);
      }
    }
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { jobTitle: "", startDate: "", endDate: "", company: "", location: "", currentlyWorking: false },
      ],
    }));
  };

  const removeExperience = (index) => {
    setFormData((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience.splice(index, 1); // Removes the experience at the specified index
      return { ...prev, experience: updatedExperience };
    });
  };
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Fetch user details from AsyncStorage

        const response = await GetResumeDetails(userId);



        const parsedUser = response.data.resumeDetails;



        // Fetch existing resume data
        // const existingResumeData = await GetResumeData(userId);


        // Prepare initial form data with existing details
        const initialFormData = {
          userId: userId,
          highestEducation: parsedUser?.highest_education || "",
          educationDetails: parsedUser?.education || {},
          experience: parsedUser?.experience?.length
            ? parsedUser.experience
            : []
        };

        // Set the form data
        setFormData(initialFormData);

      } catch (error) {
        console.error("Error fetching user details:", error);
        setAlertTitle('Error');
        setAlertMessage('Failed to load existing details. Please try again.');
        setAlertType('error');
        setAlertVisible(true);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // Inline dropdown handlers for month/year selection in experience
  const handleExperienceMonthYear = (index, type, field, value) => {
    setFormData(prev => {
      const updatedExperience = [...prev.experience];
      const exp = updatedExperience[index] || {};
      let month = exp[`${field}Month`] || '';
      let year = exp[`${field}Year`] || '';
      if (type === 'month') month = value;
      if (type === 'year') year = value;
      // Only set if both selected
      if (month && year) {
        exp[`${field}Month`] = month;
        exp[`${field}Year`] = year;
        exp[`${field}Date`] = `${month} ${year}`;
        exp[field === 'start' ? 'startDate' : 'endDate'] = `${month} ${year}`;
      } else {
        exp[`${field}Month`] = month;
        exp[`${field}Year`] = year;
        exp[field === 'start' ? 'startDate' : 'endDate'] = '';
      }
      updatedExperience[index] = exp;
      return { ...prev, experience: updatedExperience };
    });
  };

  const toggleCurrentlyWorking = (index) => {
    setFormData((prev) => {
      const updatedExperience = [...prev.experience];

      // Ensure the experience at this index exists
      if (!updatedExperience[index]) {
        updatedExperience[index] = { jobTitle: "", startDate: "", endDate: "", company: "", location: "", currentlyWorking: false };
      }

      updatedExperience[index].currentlyWorking = !updatedExperience[index].currentlyWorking;

      // If checkbox is checked, clear and disable End Date
      if (updatedExperience[index].currentlyWorking) {
        updatedExperience[index].endDate = ""; // Clear the end date
      }

      return { ...prev, experience: updatedExperience };
    });
  };

  const showAlert = (title = '', message, type = 'error', onCloseCb) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
    if (onCloseCb) {
      // store callback in ref via state closure
      showAlert.onClose = false;
    }

  };

  const handleSubmit = async () => {
    // ----- education validation -----
    const currentYr = new Date().getFullYear();
    let eduErrs = {};
    Object.entries(formData.educationDetails || {}).forEach(([level, details]) => {
      const errs = {};
      const pct = details?.percentage;
      const yr = details?.year;
      if (pct && (isNaN(Number(pct)) || Number(pct) > 100)) {
        errs.percentage = 'Percentage must be between 1 and 100';
      }
      const minYear = 1970;
      const maxYear = 2025;
      if (yr && (!/^\d{4}$/.test(yr) || Number(yr) < minYear || Number(yr) > maxYear)) {
        errs.year = `Passing year must be between ${minYear} and ${maxYear}`;
      }
      if (Object.keys(errs).length) {
        eduErrs[level] = errs;
      }
    });

    if (Object.keys(eduErrs).length) {
      setEduErrors(eduErrs);
      setIsSubmitting(false);
      return;
    } else {
      setEduErrors({});
    }

    // Validate form before submission
    // if (!validateForm()) {
    //   return;
    // }

    // Start submission process
    setIsSubmitting(true);

    console.log("This is form data", formData);

    try {
      // Replace with your actual API endpoint
      const response = await ResumeData(formData);

      // Handle successful submission
      showAlert('', 'Details updated successfully!', 'success');
      setTimeout(() => {
        setAlertVisible(false);
        if (fromJobApply) {
          navigation.navigate('JobList');
        } else {
          navigation.navigate('JobSeekerProfile');
        }
      }, 800);

      // Note: Don't put navigation here, as it would execute before the Alert is dismissed
      // Instead, we put it in the onPress callback above

    } catch (error) {
      // Handle submission errors
      showAlert('Error', error.response?.data?.message || 'Failed to submit details. Please try again.');
      console.error("Submission error:", error);
    } finally {
      // End submission process
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 72 }}
      >
        {/* Form Fields */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Highest Education</Text>
          <DropDownPicker
            open={openEducation}
            value={formData.highestEducation}
            items={educationItems}
            setOpen={setOpenEducation}
            setValue={(callback) => {
              const newValue = callback(formData.highestEducation);
              handleChange("highestEducation", newValue);
              return newValue;
            }}
            placeholder="Select education"
            style={styles.dropdown}
            listMode="SCROLLVIEW"
            dropDownContainerStyle={styles.dropdownContainer}
            placeholderStyle={{ color: '#b4b4b4', fontSize: 14, fontFamily: 'Inter-Regular' }}
            textStyle={{ fontSize: 14, color: '#333333', fontFamily: 'Inter-Regular' }}
            zIndex={3000}
            // tickIconContainerStyle={{ marginRight: 12 }}  
            tickIconStyle={{ tintColor: "#BE4145" }}

          />

          {/* Dynamic Education Fields */}
          {formData.highestEducation && (
            <View>
              {["10th", "12th", "UG", "PG"].map(
                (level, idx) => {
                  const shouldShow =
                    formData.highestEducation === level ||
                    (formData.highestEducation === "PG" && ["10th", "12th", "UG"].includes(level)) ||
                    (formData.highestEducation === "UG" && ["10th", "12th"].includes(level)) ||
                    (formData.highestEducation === "12th" && ["10th"].includes(level));

                  if (!shouldShow) return null;

                  return (
                    <View key={level} style={styles.educationCard}>
                      <Text style={styles.label1}>{level === "UG" ? "Graduate" : level === "PG" ? "Post Graduate" : level} Details</Text>

                      {/* Board/Course Dropdown */}
                      <Text style={styles.fieldLabel}>
                        {(level === "UG" || level === "PG") ? "Course" : "Board"}
                      </Text>
                      <DropDownPicker
                        open={openBoardDropdowns[level]}
                        value={formData.educationDetails?.[level]?.board || ""}
                        items={
                          level === "UG"
                            ? ugCourses
                            : level === "PG"
                              ? pgCourses
                              : boardItems
                        }
                        setOpen={(isOpen) => toggleBoardDropdown(level, isOpen)}
                        setValue={(callback) => {
                          const newValue = callback(formData.educationDetails?.[level]?.board || "");
                          handleEducationChange("board", newValue, level);
                          return newValue;
                        }}
                        placeholder={
                          level === "UG"
                            ? "Select Course"
                            : level === "PG"
                              ? "Select Course"
                              : "Select board"
                        }
                        style={styles.dropdown}
                        listMode="SCROLLVIEW"
                        dropDownContainerStyle={styles.dropdownContainer}
                        placeholderStyle={{ color: '#b4b4b4', fontSize: 14, fontFamily: 'Inter-Regular' }}
                        textStyle={{ fontSize: 14, color: '#333333', fontFamily: 'Inter-Regular' }}
                        zIndex={2000 - idx * 100}
                        tickIconStyle={{ tintColor: "#BE4145" }}

                      />

                      <View style={styles.inputRow}>
                        <View style={{ flex: 1, marginRight: 4 }}>
                          <Text style={styles.fieldLabel}>Percentage</Text>
                          <TextInput
                            placeholder="Percentage"
                            style={styles.inputHalf}
                            keyboardType="numeric"
                            onChangeText={(text) => {
                              handleEducationChange('percentage', text, level);
                            }}
                            onBlur={() => {
                              const val = formData.educationDetails?.[level]?.percentage;
                              const num = Number(val);
                              setEduErrors(prev => ({
                                ...prev,
                                [level]: {
                                  ...prev[level],
                                  percentage: (!val || isNaN(num) || num > 100) ? 'Percentage must be between 1 and 100' : undefined,
                                },
                              }));
                            }}
                            maxLength={3}
                            value={formData.educationDetails?.[level]?.percentage || ""}
                            placeholderTextColor="#999999"
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: 4 }}>
                          <Text style={styles.fieldLabel}>Passing Year</Text>
                          <TextInput
                            placeholder="Passing Year"
                            style={styles.inputHalf}
                            onChangeText={(text) => {
                              handleEducationChange('year', text, level);
                            }}
                            onBlur={() => {
                              const val = formData.educationDetails?.[level]?.year;
                              const currentYr = new Date().getFullYear();
                              setEduErrors(prev => ({
                                ...prev,
                                [level]: {
                                  ...prev[level],
                                  year: (!/^\d{4}$/.test(val) || Number(val) > currentYr) ? `passing year  must be between ${1970} and ${currentYr}` : undefined,
                                },
                              }));
                            }}
                            maxLength={4}
                            value={formData.educationDetails?.[level]?.year || ""}
                            placeholderTextColor="#999999"
                          />
                        </View>
                      </View>
                      {eduErrors[level]?.percentage && (
                        <Text style={styles.errorText}>{eduErrors[level].percentage}</Text>
                      )}
                      {eduErrors[level]?.year && (
                        <Text style={styles.errorText}>{eduErrors[level].year}</Text>
                      )}
                    </View>
                  );
                }
              )}
            </View>
          )}

          {/* Experience Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {formData.experience.map((exp, index) => (
              <View key={index} style={styles.experienceContainer}>
                <View style={styles.headerRow}>
                  {/* <Text style={styles.experienceTitle}>Job Experience {index + 1}</Text> */}
                  <TouchableOpacity onPress={() => removeExperience(index)}>
                    <Ionicons name="remove-circle-outline" size={24} color="#BE4145" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Job Title</Text>
                <TextInput
                  placeholder="Job Title"
                  style={styles.input}
                  value={exp.jobTitle || ""}
                  onChangeText={(text) => handleChange(`experience[${index}].jobTitle`, text)}
                />
                <Text style={styles.fieldLabel}>Company Name</Text>
                <TextInput
                  placeholder="Company Name"
                  style={styles.input}
                  value={exp.company || ""}
                  onChangeText={(text) => handleChange(`experience[${index}].company`, text)}
                />
                {/* Start Date Row */}
                {/* Start Date Row */}
                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.dateInputLabel}>Start Date</Text>
                  <View style={{ flexDirection: 'row', gap: 10, padding: 10 }}>
                    {/* Month Dropdown */}
                    <View style={{ flex: 1 }}>
                      <DropDownPicker
                        open={startMonthOpen}
                        value={startMonthValue}
                        items={months.map((month, idx) => ({ label: month, value: month }))}
                        setOpen={setStartMonthOpen}
                        setValue={setStartMonthValue}
                        placeholder="Month"
                        style={{ borderRadius: 8, borderColor: '#ccc' }}
                        dropDownContainerStyle={{
                          borderRadius: 8,
                          maxHeight: 200,
                          borderColor: '#ccc',
                        }}
                        listMode="SCROLLVIEW"
                        zIndex={3000}
                        zIndexInverse={1000}
                        tickIconStyle={{ tintColor: "#BE4145" }}

                      />
                    </View>

                    {/* Year Dropdown */}
                    <View style={{ flex: 1 }}>
                      <DropDownPicker
                        open={startYearOpen}
                        value={startYearValue}
                        items={years.map(year => ({ label: year, value: year }))}
                        setOpen={setStartYearOpen}
                        setValue={setStartYearValue}
                        placeholder="Year"
                        style={{ borderRadius: 8, borderColor: '#ccc' }}
                        dropDownContainerStyle={{
                          borderRadius: 8,
                          maxHeight: 200,
                          borderColor: '#ccc',
                        }}
                        listMode="SCROLLVIEW"
                        zIndex={2000}
                        zIndexInverse={2000}
                        tickIconStyle={{ tintColor: "#BE4145" }}

                      />
                    </View>
                  </View>
                </View>

                {/* End Date Row (only if NOT currently working) */}
                {!exp.currentlyWorking && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.dateInputLabel}>End Date</Text>
                    <View style={{ flexDirection: 'row', gap: 10, padding: 10 }}>
                      {/* Month Dropdown */}
                      <View style={{ flex: 1 }}>
                        <DropDownPicker
                          open={endMonthOpen}
                          value={endMonthValue}
                          items={months.map((month, idx) => ({ label: month, value: month }))}
                          setOpen={setEndMonthOpen}
                          setValue={setEndMonthValue}
                          placeholder="Month"
                          style={{ borderRadius: 8, borderColor: '#ccc' }}
                          dropDownContainerStyle={{
                            borderRadius: 8,
                            maxHeight: 200,
                            borderColor: '#ccc',
                          }}
                          listMode="SCROLLVIEW"
                          zIndex={1000}
                          zIndexInverse={3000}
                          tickIconStyle={{ tintColor: "#BE4145" }}

                        />
                      </View>

                      {/* Year Dropdown */}
                      <View style={{ flex: 1 }}>
                        <DropDownPicker
                          open={endYearOpen}
                          value={endYearValue}
                          items={years.map(year => ({ label: year, value: year }))}
                          setOpen={setEndYearOpen}
                          setValue={setEndYearValue}
                          placeholder="Year"
                          style={{ borderRadius: 8, borderColor: '#ccc' }}
                          dropDownContainerStyle={{
                            borderRadius: 8,
                            maxHeight: 200,
                            borderColor: '#ccc',
                          }}
                          listMode="SCROLLVIEW"
                          zIndex={1000}
                          zIndexInverse={4000}
                          tickIconStyle={{ tintColor: "#BE4145" }}

                        />
                      </View>
                    </View>
                  </View>
                )}


                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleCurrentlyWorking(index)}
                  >
                    <Ionicons
                      name={exp.currentlyWorking ? "checkbox-outline" : "square-outline"}
                      size={24}
                      color="#BE4145"
                    />
                    <Text style={styles.checkboxLabel}>Currently working</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Location</Text>
                <TextInput
                  placeholder="Location"
                  style={styles.input}
                  value={exp.location || ""}
                  onChangeText={(text) => handleChange(`experience[${index}].location`, text)}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addExperience}>
              <Ionicons name="add-circle-outline" size={24} color="#BE4145" />
              <Text style={styles.addButtonText}>Add Experience</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Alert */}
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
          onClose={() => {
            setAlertVisible(false);
            if (alertType === 'success' && typeof showAlert.onClose === 'function') {
              const cb = showAlert.onClose;
              showAlert.onClose = undefined;
              cb();
            }
          }}
          showButton={alertType !== 'success'}
        />
      </ScrollView>
      {/* Sticky button container, absolutely positioned at the bottom */}
      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid() || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Submit Details"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f2ee', padding: 16, marginBottom: 36, },
  inputContainer: { marginBottom: 0 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    alignSelf: 'center',

  },
  sectionTitle: {
    fontSize: 18,
    color: '#333333',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  errorText: { color: '#BE4145', fontSize: 12, marginTop: 0, marginBottom: 8, fontFamily: 'Inter-Regular' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    height: 44,
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  dropdown: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
    minHeight: 44,
    height: 44,
    paddingHorizontal: 16,
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    zIndex: 6000,
  },
  addButton: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: '#BE4145', padding: 10, borderRadius: 8, marginTop: 10, marginBottom: 12, backgroundColor: "#fff" },
  addButtonText: { color: "#Be4145", fontSize: 16, marginLeft: 8 },
  experienceContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 5,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateInputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  educationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 0,
  },
  label1: {
    fontSize: 18,
    color: '#333333',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: '#BE4145',
    borderRadius: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',

  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#b4b4b4',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
  // Add a new style for the row
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  inputHalf: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    height: 44,
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter-Regular',
    marginBottom: 0,
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

export default JobSeekerDetails;