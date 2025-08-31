import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJobDetails, postJob } from '../../utils/api';
import { BackHandler } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { updateJob } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../component/CustomAlert';


const PostJobForm = ({ navigation }) => {
    const route = useRoute();
    const { jobId } = route.params || {};
    const [jobs, setJobs] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [jobTitle, setJobTitle] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [jobType, setJobType] = useState(null);
    const [company_logo, setCompanyLogo] = useState('');
    const [shift, setShift] = useState(null);
    const [locationType, setLocationType] = useState('');
    const [jd, setJd] = useState('');
    const [numEmployees, setNumEmployees] = useState('');
    const [employerId, setEmployerId] = useState(null);
    const [company, setCompanyName] = useState('');
    const [experience, setExperience] = useState('');
    const [industry, setIndustry] = useState('');

    // New field for JobCategory
    const [jobCategory, setJobCategory] = useState('');
    const [jobCategoryOpen, setJobCategoryOpen] = useState(false);

    // Dropdown states
    const [jobTypeOpen, setJobTypeOpen] = useState(false);
    const [shiftOpen, setShiftOpen] = useState(false);
    const [salaryOpen, setSalaryOpen] = useState(false);
    const [locationTypeOpen, setLocationTypeOpen] = useState(false);
    const [experienceOpen, setExperienceOpen] = useState(false);

    const [industryOpen, setIndustryOpen] = useState(false);
    const [currencyOpen, setCurrencyOpen] = useState(false);
    const [salary, setSalary] = useState('');
    const [currency, setCurrency] = useState('INR');
    const [exchangeRates, setExchangeRates] = useState({});
    const [convertedSalary, setConvertedSalary] = useState("");

    // Add state for custom alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertType, setAlertType] = useState(''); // 'success', 'error', 'warning', 'info'
    const [alertMessage, setAlertMessage] = useState('');
    const [alertShowCancel, setAlertShowCancel] = useState(false);
    const [alertOnConfirm, setAlertOnConfirm] = useState(null);

    // Add state for form validation errors
    const [formErrors, setFormErrors] = useState({
        jobTitle: '',
        jobType: '',
        shift: '',
        locationType: '',
        salary: '',
        jd: '',
        jobCategory: '',
        numEmployees: ''
    });

    // Add state for employees error message
    const [numEmployeesError, setNumEmployeesError] = useState('');

    // Add state to track form page and additional fields
    const [currentPage, setCurrentPage] = useState(1);
    const [minAge, setMinAge] = useState('');
    const [minEducation, setMinEducation] = useState('');
    const [prefGender, setPrefGender] = useState('');
    const [questions, setQuestions] = useState([{ question: '', correctAnswer: 'Yes' }]);

    // compute if all required fields on page 1 are filled
    const getDropdownValue = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val.trim();
        if (typeof val === 'object' && val.value) return val.value;
        return '';
    };

    const isPageOneValid = () => {
        return (
            searchText.trim() &&
            getDropdownValue(jobType) &&
            getDropdownValue(shift) &&
            getDropdownValue(locationType) &&
            salary.trim() &&
            jd.trim() &&
            getDropdownValue(jobCategory) &&
            numEmployees.trim()
        );
    };


    // Add dropdown states for new fields
    const [minEducationOpen, setMinEducationOpen] = useState(false);
    const [prefGenderOpen, setPrefGenderOpen] = useState(false);

    // Add refs for input fields to manage focus
    const scrollViewRef = useRef();
    const inputRefs = useRef({});

    // Function to dismiss all dropdowns and remove focus from inputs
    const dismissDropdownsAndFocus = () => {
        // Close all dropdowns
        setJobCategoryOpen(false);
        setJobTypeOpen(false);
        setShiftOpen(false);
        setLocationTypeOpen(false);
        setExperienceOpen(false);
        setMinEducationOpen(false);
        setPrefGenderOpen(false);

        // Remove focus from all inputs
        Object.values(inputRefs.current).forEach(ref => {
            if (ref && ref.blur) {
                ref.blur();
            }
        });
    };

    const jobTypeItems = [
        { label: 'Full-time', value: 'full-time' },
        { label: 'Part-time', value: 'part-time' },
        { label: 'Contract', value: 'contract' },
        { label: 'Internship', value: 'internship' },
    ];
    const [industryItems, setIndustryItems] = useState([

        { label: 'Admin', value: 'admin' },
        { label: 'Babysitter', value: 'babysitter' },
        { label: 'Back Office', value: 'back_office' },
        { label: 'Bartender', value: 'bartender' },
        { label: 'Beautician', value: 'beautician' },
        { label: 'Business Development', value: 'business_development' },
        { label: 'Carpenter', value: 'carpenter' },
        { label: 'Compounder', value: 'compounder' },
        { label: 'Content Writer', value: 'content_writer' },
        { label: 'Customer Support', value: 'customer_support' },
        { label: 'Data Entry', value: 'data_entry' },
        { label: 'Digital Marketing', value: 'digital_marketing' },
        { label: 'Education', value: 'education' },
        { label: 'Electrician', value: 'electrician' },
        { label: 'Field Sales', value: 'field_sales' },
        { label: 'Finance', value: 'finance' },
        { label: 'Graphics Designer', value: 'graphics_designer' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Hotel Manager', value: 'hotel_manager' },
        { label: 'House Cleaner', value: 'house_cleaner' },
        { label: 'Housekeeping', value: 'housekeeping' },
        { label: 'IT', value: 'it' },
        { label: 'Key Account Manager (KAM)', value: 'kam' },
        { label: 'Lab Technician', value: 'lab_technician' },
        { label: 'Machine Operator', value: 'machine_operator' },
        { label: 'Maid / Caretaker', value: 'maid_caretaker' },
        { label: 'Mechanic', value: 'mechanic' },
        { label: 'Nanny', value: 'nanny' },
        { label: 'Nurse', value: 'nurse' },
        { label: 'Office Boy', value: 'office_boy' },
        { label: 'Operations', value: 'operations' },
        { label: 'Other', value: 'other' },
        { label: 'Painter', value: 'painter' },
        { label: 'Pest Control', value: 'pest_control' },
        { label: 'Plumber', value: 'plumber' },
        { label: 'Procurement/Purchase', value: 'procurement_purchase' },
        { label: 'Receptionist', value: 'receptionist' },
        { label: 'Supply Chain', value: 'supply_chain' },
        { label: 'Tailor', value: 'tailor' },
        { label: 'Technician (AC, Refrigerator, etc.)', value: 'technician' },
        { label: 'Warehouse Worker', value: 'warehouse_worker' },
        { label: 'Web Developer', value: 'web_developer' },
        { label: 'Welder', value: 'welder' }
    ]
    )



    const shiftItems = [
        { label: 'Day shift', value: 'day' },
        { label: 'Night shift', value: 'night' },
        { label: 'Rotational shift', value: 'rotational' },
    ];

    const ExperienceItems = [
        { label: 'Fresher', value: 'fresher' },
        { label: '1-2 year', value: '1-2years' },
        { label: '3-5 year', value: '3-5years' },
        { label: '6-8 year', value: '6-8years' },
        { label: '9-12 year', value: '9-12years' },
        { label: '13-15 year', value: '13-15years' },
        { label: '15+ year', value: '15+years' },

    ];
    const locationItems = [
        { label: 'Work from Office', value: 'work-from-office' },
        { label: 'Work from Home', value: 'work-from-home' },
        { label: 'Hybrid', value: 'hybrid' },
    ];

    const salaryItems = [
        { label: 'Less than $20,000', value: '<20000' },
        { label: '$20,000 - $50,000', value: '20000-50000' },
        { label: '$50,000 - $100,000', value: '50000-100000' },
        { label: 'More than $100,000', value: '>100000' },
    ];

    // Add dropdown items for the new fields
    const minEducationItems = [
        { label: '10th pass', value: '10th' },
        { label: 'Secondary Education', value: 'secondary' },
        { label: 'High School', value: 'high_school' },
        { label: 'Diploma', value: 'diploma' },
        { label: 'Bachelor\'s Degree', value: 'bachelors' },
        { label: 'Master\'s Degree', value: 'masters' },
        { label: 'Doctorate', value: 'doctorate' },
        { label: 'Not Required', value: 'not_required' },
    ];

    const genderItems = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Any', value: 'any' },
    ];



    // Add yes/no answer options
    const answerOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
    ];

    const currencyItems = [
        { label: 'INR (₹)', value: 'INR' },  // India
        { label: 'USD ($)', value: 'USD' },  // USA
        { label: 'EUR (€)', value: 'EUR' },  // Germany, France, Luxembourg, Netherlands, Ireland
        { label: 'GBP (£)', value: 'GBP' },  // UK
        { label: 'JPY (¥)', value: 'JPY' },  // Japan
        { label: 'AED (د.إ)', value: 'AED' },  // UAE
        { label: 'SAR (﷼)', value: 'SAR' },  // Saudi Arabia
        { label: 'AUD (A$)', value: 'AUD' },  // Australia
        { label: 'NZD (NZ$)', value: 'NZD' },  // New Zealand
        { label: 'HUF (Ft)', value: 'HUF' },  // Hungary
        { label: 'AZN (₼)', value: 'AZN' },  // Azerbaijan
        { label: 'QAR (ر.ق)', value: 'QAR' },  // Qatar
        { label: 'KWD (د.ك)', value: 'KWD' }   // Kuwait
    ];

    useEffect(() => {
        fetch('https://api.exchangerate-api.com/v4/latest/INR')
            .then(response => response.json())
            .then(data => setExchangeRates(data.rates));
    }, []);

    useEffect(() => {
        if (salary && currency) {
            const inrSalary = convertToINR(salary, currency);
            setConvertedSalary(inrSalary);
            console.log("Converted Salary (INR):", inrSalary); // Debugging output
        }
    }, [salary, currency]);

    const convertToINR = (amount, selectedCurrency) => {
        if (!amount || !exchangeRates[selectedCurrency]) return '';

        // Convert to INR
        let converted = parseFloat(amount) * exchangeRates['INR'] / exchangeRates[selectedCurrency];

        // Round to the nearest thousand
        let roundedSalary = Math.round(converted / 100) * 100;

        console.log(`Converted ${amount} ${selectedCurrency} to INR: ₹${roundedSalary}`); // Debugging output

        return roundedSalary;
    };

    const handleSalaryChange = (text) => {
        setSalary(text);
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Do nothing or handle custom behavior
            return false;
        });

        return () => backHandler.remove();
    }, []);

    // Set up header navigation when component mounts
    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    style={{ marginLeft: 16 }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
            ),
            title: jobId ? 'Update Job' : 'Post Job',
            headerTitleStyle: {
                fontFamily: 'Montserrat-SemiBold',
                fontSize: 18,
            },
            headerStyle: {
                backgroundColor: '#BE4145',
                elevation: 0,
                shadowOpacity: 0,
            }
        });
    }, [navigation, jobId]);


    // Fetch employerId and company name from AsyncStorage
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userDetails = await AsyncStorage.getItem('userDetails');
                if (userDetails) {
                    const parsedUser = JSON.parse(userDetails);
                    setEmployerId(parsedUser.id);
                    setCompanyName(parsedUser.company_name);
                    setCompanyLogo(parsedUser.profile_image)

                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };
        fetchUserId();
    }, []);



    //    Edit Job Functionality
    useEffect(() => {
        const fetchJobDetails = async () => {
            if (jobId) {
                try {
                    const response = await getJobDetails(jobId);
                    const jobData = response.data.job;

                    console.log("Response data", response.data.job);

                    // Debug log field values
                    console.log("Job Title:", jobData.title);
                    console.log("Job Category:", jobData.category);
                    console.log("Shift:", jobData.shift, "Job Shift:", jobData.job_shift);
                    console.log("No of Employees:", jobData.numEmployees, "Employees Count:", jobData.no_of_employees, "Count:", jobData.employees_count);

                    // Set all form fields with existing data
                    setJobTitle(jobData.title || '');
                    // Set the search text to display job title
                    setSearchText(jobData.title || '');

                    setCity(jobData.city || '');
                    setCountry(jobData.country || 'India');
                    setJobType(jobData.job_type || null);

                    // Fix for shift field - use job_shift instead of shift
                    setShift(jobData.job_shift || jobData.shift || null);

                    setLocationType(jobData.location_type || null);
                    setSalary(jobData.salary?.toString() || '');
                    setJd(jobData.description || '');

                    // Fix for numEmployees field - check all possible field names
                    setNumEmployees(
                        jobData.numEmployees?.toString() ||
                        jobData.employees_required?.toString() ||
                        jobData.no_of_employees?.toString() ||
                        jobData.employees_count?.toString() ||
                        ''
                    );

                    setExperience(jobData.experience || null);

                    // Set industry field
                    setIndustry(jobData.industry || jobData.category || '');

                    // Fix for job category field
                    setJobCategory(jobData.category || jobData.jobCategory || jobData.industry || jobData.title || null);

                    // Set the new fields
                    setMinAge(jobData.min_age?.toString() || '');
                    setMinEducation(jobData.min_education || '');
                    setPrefGender(jobData.preferred_gender || '');

                    // Handle screening questions which might have a different format
                    if (jobData.screening_questions && jobData.screening_questions.length > 0) {
                        // Check the format of the screening questions
                        const formattedQuestions = jobData.screening_questions.map(q => {
                            // Check if the question is in the format with id, question_text, and ideal_answer
                            if (q.question_text && (q.ideal_answer || q.ideal_answer === false)) {
                                return {
                                    question: q.question_text,
                                    correctAnswer: q.ideal_answer?.toString().toLowerCase() === 'yes' ? 'Yes' : 'No'
                                };
                            }
                            // If it's already in the format with question and correctAnswer
                            else if (q.question && (q.correctAnswer || q.correctAnswer === false)) {
                                return q;
                            }
                            // Fallback format
                            else {
                                return {
                                    question: q.question || q.question_text || '',
                                    correctAnswer: q.correctAnswer || q.ideal_answer || 'Yes'
                                };
                            }
                        });

                        setQuestions(formattedQuestions);
                    }

                    // Open the modal automatically for editing
                    setModalVisible(true);
                } catch (error) {
                    console.error('Error fetching job details:', error);
                    showCustomAlert('Error', 'Failed to load job details', false);
                }
            }
        };
        fetchJobDetails();
    }, [jobId]);

    // Automatically show modal when jobId is present
    useEffect(() => {
        if (jobId) {
            setModalVisible(true);
        }
    }, [jobId]);

    // Helper to show alert
    const showCustomAlert = (title, message, showCancel = false, onConfirm = null) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertShowCancel(showCancel);
        setAlertOnConfirm(() => onConfirm);
        setAlertVisible(true);
    };

    const handlepostJob = async () => {
        if (currentPage === 1) {
            handleNext();
            return;
        }

        if (!employerId) {
            showCustomAlert('Error', 'Employer ID not found', false);
            return;
        }

        // Format screening questions to match API expectations
        const formattedQuestions = questions
            .filter(q => q.question.trim() !== '')
            .map(q => ({
                question_text: q.question,
                ideal_answer: q.correctAnswer.toLowerCase()
            }));

        const jobData = {
            employerId,
            employer_id: employerId, // Adding alternative format for API compatibility
            title: searchText,
            jobTitle: searchText,
            company_logo,
            company: company,
            city,
            country: "India",
            job_type: jobType,
            jobType,
            experience,
            job_shift: shift,
            shift,
            location_type: locationType,
            locationType,
            salary: convertedSalary || salary,
            description: jd,
            jd,
            numEmployees,
            no_of_employees: numEmployees,
            employees_required: numEmployees, // Adding alternative format for API compatibility
            category: jobCategory,
            jobCategory,
            industry: industry,
            // Add the new fields
            min_age: minAge,
            min_education: minEducation,
            preferred_gender: prefGender,
            // Add the formatted questions
            screening_questions: formattedQuestions,
        };

        try {
            let response;
            if (jobId) {
                response = await updateJob(jobId, jobData);
            } else {
                response = await postJob(jobData);
            }

            console.log("This is Response ", response.data);

            if (response.data?.success) {
                // setAlertTitle('Success');
                setAlertMessage(jobId ? 'Job Updated Successfully' : 'Job Posted Successfully');
                setAlertType('success');
                setAlertShowCancel(false);
                setAlertOnConfirm(null);
                setAlertVisible(true);
                setTimeout(() => {
                    setAlertVisible(false);
                    setModalVisible(false);
                    // navigation.navigate("MyJobs");
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'MyJobs' }],
                    });
                }, 1000);
            } else {
                showCustomAlert('Error', response?.message || "Something went wrong", false);
            }
        } catch (error) {
            console.error('Error submitting job:', error);
            showCustomAlert('Error', 'An error occurred. Please try again.', false);
        }
    };

    const resetForm = () => {
        setJobTitle('');
        setLocation('');
        setJobType(null);
        setShift(null);
        setLocationType('');
        setSalary(null);
        setJd('');
        setNumEmployees('');
        setJobCategory(''); // Reset the new field
    };

    const [searchText, setSearchText] = useState('');
    const [filteredIndustries, setFilteredIndustries] = useState([]);

    const handleSearch = (text) => {
        setSearchText(text);
    };

    const handleNumEmployeesChange = (text) => {
        // Allow only numbers
        const numericValue = text.replace(/[^0-9]/g, '');

        // Limit to 20 employees
        if (numericValue === '' || parseInt(numericValue) <= 5) {
            setNumEmployees(numericValue);
            setNumEmployeesError(''); // Clear error when valid
        } else {
            setNumEmployees('5');
            setNumEmployeesError('Maximum allowed employees is 5');
        }
    };

    // Handle adding and removing questions
    const addQuestion = () => {
        if (questions.length < 3) {
            setQuestions([...questions, { question: '', correctAnswer: 'Yes' }]);
        } else {
            showCustomAlert('Limit Reached', 'You can only add up to 3 questions', false);
        }
    };

    const removeQuestion = (index) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index, 1);
        setQuestions(updatedQuestions);
    };

    const updateQuestion = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setQuestions(updatedQuestions);
    };

    // Validate form fields
    const validateForm = () => {
        const errors = {
            jobTitle: !searchText ? 'Job title is required' : '',
            jobType: !jobType ? 'Job type is required' : '',
            city: !city ? 'City is required' : '',
            salary: !salary ? 'Monthly salary is required' : '',
            shift: !shift ? 'Shift is required' : '',
            locationType: !locationType ? 'Location type is required' : '',
            jd: !jd ? 'Job description is required' : '',
            jobCategory: !jobCategory ? 'Job category is required' : '',
            numEmployees: !numEmployees ? 'Number of employees is required' : ''
        };
        setFormErrors(errors);
        // Return true if no errors
        return !Object.values(errors).some(error => error !== '');
    };

    // Handle navigating between form pages
    const handleNext = () => {
        if (validateForm()) {
            setCurrentPage(2);
        }
    };

    const handleBack = () => {
        setCurrentPage(1);
    };

    return (
        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.contentContainer, { paddingBottom: 120 }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.cardContainer}>
                    {currentPage === 1 ? (
                        // Page 1 - Basic Job Details
                        <>
                            <View style={styles.inputContainer}>
                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>
                                        Job Title<Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <TextInput
                                        ref={(ref) => inputRefs.current.jobTitle = ref}
                                        value={searchText}
                                        onChangeText={(text) => {
                                            handleSearch(text);
                                            setFormErrors({ ...formErrors, jobTitle: '' });
                                        }}
                                        style={[
                                            styles.input,
                                            formErrors.jobTitle ? styles.inputError : null
                                        ]}
                                        mode="outlined"
                                        outlineColor={formErrors.jobTitle ? "#BE4145" : "#e0e0e0"}
                                        activeOutlineColor="#BE4145"
                                        theme={{
                                            roundness: 8,
                                            colors: {
                                                primary: '#444444',
                                                onSurfaceVariant: '#666666'
                                            },
                                            fonts: {
                                                regular: {
                                                    fontFamily: 'Inter-Regular'
                                                }
                                            }
                                        }}
                                        placeholderTextColor="#b4b4b4"
                                    />
                                    {formErrors.jobTitle ? <Text style={styles.errorText}>{formErrors.jobTitle}</Text> : null}
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>
                                        Job Type<Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <DropDownPicker
                                        open={jobCategoryOpen}
                                        value={jobCategory}
                                        items={industryItems}
                                        setOpen={(open) => {
                                            if (open) dismissDropdownsAndFocus();
                                            setJobCategoryOpen(open);
                                        }}
                                        setValue={setJobCategory}
                                        placeholder="Job Category"
                                        style={[
                                            styles.dropdown,
                                            formErrors.jobCategory ? styles.dropdownError : null
                                        ]}
                                        dropDownContainerStyle={styles.dropdownList}
                                        listMode="SCROLLVIEW"
                                        zIndex={7000}
                                        zIndexInverse={1000}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        textStyle={styles.dropdownText}
                                        tickIconStyle={{ tintColor: "#BE4145" }}
                                    />
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>
                                        City<Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <TextInput
                                        ref={(ref) => inputRefs.current.city = ref}
                                        value={city}
                                        onChangeText={text => {
                                            setCity(text);
                                            setFormErrors({ ...formErrors, city: '' });
                                        }}
                                        style={[
                                            styles.input,
                                            formErrors.city ? styles.inputError : null
                                        ]}
                                        mode="outlined"
                                        outlineColor={formErrors.city ? "#BE4145" : "#e0e0e0"}
                                        activeOutlineColor="#BE4145"
                                        theme={{
                                            roundness: 8,
                                            colors: {
                                                primary: '#444444',
                                                onSurfaceVariant: '#b4b4b4'
                                            },
                                            fonts: {
                                                regular: {
                                                    fontFamily: 'Inter-Regular'
                                                }
                                            }
                                        }}
                                        placeholderTextColor="#666666"
                                    />
                                    {formErrors.city ? <Text style={styles.errorText}>{formErrors.city}</Text> : null}
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>Country</Text>
                                    <TextInput
                                        ref={(ref) => inputRefs.current.country = ref}
                                        value={"India"}
                                        onChangeText={setCountry}
                                        style={[styles.input, styles.disabledInput]}
                                        mode="outlined"
                                        outlineColor="#e0e0e0"
                                        activeOutlineColor="#BE4145"
                                        theme={{
                                            roundness: 8,
                                            colors: {
                                                primary: '#444444',
                                                onSurfaceVariant: '#666666'
                                            },
                                            fonts: {
                                                regular: {
                                                    fontFamily: 'Inter-Regular'
                                                }
                                            }
                                        }}
                                        placeholderTextColor="#666666"
                                        editable={false}
                                        disabled={true}
                                    />
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>
                                        Job Type<Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <DropDownPicker
                                        open={jobTypeOpen}
                                        value={jobType}
                                        items={jobTypeItems}
                                        setOpen={(open) => {
                                            if (open) dismissDropdownsAndFocus();
                                            setJobTypeOpen(open);
                                            if (!open && !jobType) {
                                                setFormErrors({ ...formErrors, jobType: 'Job type is required' });
                                            } else {
                                                setFormErrors({ ...formErrors, jobType: '' });
                                            }
                                        }}
                                        setValue={(value) => {
                                            setJobType(value);
                                            if (value) {
                                                setFormErrors({ ...formErrors, jobType: '' });
                                            }
                                        }}
                                        placeholder="Select job type"
                                        style={[
                                            styles.dropdown,
                                            formErrors.jobType ? styles.dropdownError : null
                                        ]}
                                        dropDownContainerStyle={styles.dropdownList}
                                        listMode="SCROLLVIEW"
                                        zIndex={6000}
                                        zIndexInverse={2000}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        textStyle={styles.dropdownText}
                                        tickIconStyle={{ tintColor: "#BE4145" }}

                                    />
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>
                                        Shift<Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <DropDownPicker
                                        open={shiftOpen}
                                        value={shift}
                                        items={shiftItems}
                                        setOpen={(open) => {
                                            if (open) dismissDropdownsAndFocus();
                                            setShiftOpen(open);
                                            if (!open && !shift) {
                                                setFormErrors({ ...formErrors, shift: 'Shift is required' });
                                            } else {
                                                setFormErrors({ ...formErrors, shift: '' });
                                            }
                                        }}
                                        setValue={(value) => {
                                            setShift(value);
                                            if (value) {
                                                setFormErrors({ ...formErrors, shift: '' });
                                            }
                                        }}
                                        placeholder="Select shift"
                                        style={[
                                            styles.dropdown,
                                            formErrors.shift ? styles.dropdownError : null
                                        ]}
                                        dropDownContainerStyle={styles.dropdownList}
                                        listMode="SCROLLVIEW"
                                        zIndex={5000}
                                        zIndexInverse={3000}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        textStyle={styles.dropdownText}
                                        tickIconStyle={{ tintColor: "#BE4145" }}

                                    />
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>
                                        Location Type<Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <DropDownPicker
                                        open={locationTypeOpen}
                                        value={locationType}
                                        items={locationItems}
                                        setOpen={(open) => {
                                            if (open) dismissDropdownsAndFocus();
                                            setLocationTypeOpen(open);
                                            if (!open && !locationType) {
                                                setFormErrors({ ...formErrors, locationType: 'Location type is required' });
                                            } else {
                                                setFormErrors({ ...formErrors, locationType: '' });
                                            }
                                        }}
                                        setValue={(value) => {
                                            setLocationType(value);
                                            if (value) {
                                                setFormErrors({ ...formErrors, locationType: '' });
                                            }
                                        }}
                                        placeholder="Select location type"
                                        style={[
                                            styles.dropdown,
                                            formErrors.locationType ? styles.dropdownError : null
                                        ]}
                                        dropDownContainerStyle={styles.dropdownList}
                                        listMode="SCROLLVIEW"
                                        zIndex={4000}
                                        zIndexInverse={4000}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        textStyle={styles.dropdownText}
                                        tickIconStyle={{ tintColor: "#BE4145" }}

                                    />
                                </View>

                                {/* Salary Input with Currency Dropdown */}
                                <View style={[styles.salaryContainer, styles.fieldWrapper]}>
                                    <View style={styles.dropdownWrapper}>
                                        <TextInput
                                            ref={(ref) => inputRefs.current.currency = ref}
                                            label="Currency"
                                            value={currencyItems.find(item => item.value === currency)?.label || currency}
                                            style={[styles.input, styles.disabledInput]}
                                            mode="outlined"
                                            editable={false}
                                            disabled={true}
                                            outlineColor="#e0e0e0"
                                            activeOutlineColor="#BE4145"
                                            theme={{
                                                roundness: 8,
                                                colors: {
                                                    primary: '#444444',
                                                    onSurfaceVariant: '#666666'
                                                },
                                                fonts: {
                                                    regular: {
                                                        fontFamily: 'Inter-Regular'
                                                    }
                                                }
                                            }}
                                            placeholderTextColor="#666666"
                                        />
                                    </View>
                                    <View style={styles.salaryInputWrapper}>
                                        <Text style={styles.label}>
                                            Monthly Salary<Text style={styles.requiredStar}>*</Text>
                                        </Text>
                                        <TextInput
                                            ref={(ref) => inputRefs.current.salary = ref}
                                            value={salary}
                                            onChangeText={text => {
                                                setSalary(text);
                                                setFormErrors({ ...formErrors, salary: '' });
                                            }}
                                            style={[
                                                styles.input,
                                                formErrors.salary ? styles.inputError : null
                                            ]}
                                            mode="outlined"
                                            keyboardType="numeric"
                                            outlineColor={formErrors.salary ? "#BE4145" : "#e0e0e0"}
                                            activeOutlineColor="#BE4145"
                                            theme={{
                                                roundness: 8,
                                                colors: {
                                                    primary: '#444444',
                                                    onSurfaceVariant: '#666666'
                                                },
                                                fonts: {
                                                    regular: {
                                                        fontFamily: 'Inter-Regular'
                                                    }
                                                }
                                            }}
                                            placeholderTextColor="#666666"
                                            maxLength={6}
                                        />
                                        {formErrors.salary ? <Text style={styles.errorText}>{formErrors.salary}</Text> : null}
                                    </View>
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>
                                        Minimum Experience<Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <DropDownPicker
                                        open={experienceOpen}
                                        value={experience}
                                        items={ExperienceItems}
                                        setOpen={(open) => {
                                            if (open) dismissDropdownsAndFocus();
                                            setExperienceOpen(open);
                                        }}
                                        setValue={setExperience}
                                        placeholder="Minimum Experience"
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        listMode="SCROLLVIEW"
                                        zIndex={3000}
                                        zIndexInverse={5000}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        textStyle={styles.dropdownText}
                                        tickIconStyle={{ tintColor: "#BE4145" }}

                                    />
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>
                                        Job Description (JD)<Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <TextInput
                                        ref={(ref) => inputRefs.current.jd = ref}
                                        value={jd}
                                        onChangeText={(text) => {
                                            setJd(text);
                                            if (text) {
                                                setFormErrors({ ...formErrors, jd: '' });
                                            }
                                        }}
                                        style={[
                                            styles.input,
                                            styles.textArea,
                                            { paddingVertical: 0, padding: 0 },
                                            formErrors.jd ? styles.inputError : null
                                        ]}
                                        mode="outlined"
                                        multiline
                                        contentStyle={{ paddingVertical: 0 }}
                                        numberOfLines={4}
                                        outlineColor={"#e0e0e0"}
                                        activeOutlineColor="#BE4145"
                                        theme={{
                                            roundness: 8,
                                            colors: {
                                                primary: '#444444',
                                                onSurfaceVariant: '#666666'
                                            },
                                            fonts: {
                                                regular: {
                                                    fontFamily: 'Inter-Regular'
                                                }
                                            }
                                        }}
                                        placeholderTextColor="#666666"
                                        onBlur={() => {
                                            if (!jd) {
                                                setFormErrors({ ...formErrors, jd: 'Job description is required' });
                                            }
                                        }}
                                    />
                                    {/* {formErrors.jd ? <Text style={styles.errorText}>{formErrors.jd}</Text> : null} */}
                                </View>

                                <View style={styles.fieldWrapper}>
                                    <Text style={styles.label}>
                                        No. of Employees<Text style={styles.requiredStar}>*</Text>
                                    </Text>
                                    <TextInput
                                        ref={(ref) => inputRefs.current.numEmployees = ref}
                                        value={numEmployees}
                                        onChangeText={handleNumEmployeesChange}
                                        style={[
                                            styles.input,
                                            formErrors.numEmployees || numEmployeesError ? styles.inputError : null
                                        ]}
                                        mode="outlined"
                                        keyboardType="numeric"
                                        outlineColor={formErrors.numEmployees || numEmployeesError ? "#BE4145" : "#e0e0e0"}
                                        activeOutlineColor="#BE4145"
                                        theme={{
                                            roundness: 8,
                                            colors: {
                                                primary: '#444444',
                                                onSurfaceVariant: '#666666'
                                            },
                                            fonts: {
                                                regular: {
                                                    fontFamily: 'Inter-Regular'
                                                }
                                            }
                                        }}
                                        placeholderTextColor="#666666"
                                        onBlur={() => {
                                            if (!numEmployees) {
                                                setFormErrors({ ...formErrors, numEmployees: 'Number of employees is required' });
                                            } else {
                                                setFormErrors({ ...formErrors, numEmployees: '' });
                                            }
                                        }}
                                    />
                                    {formErrors.numEmployees ? (
                                        <Text style={styles.errorText}>{formErrors.numEmployees}</Text>
                                    ) : numEmployeesError ? (
                                        <Text style={styles.errorText}>{numEmployeesError}</Text>
                                    ) : null}
                                </View>
                            </View>
                        </>
                    ) : (
                        // Page 2 - Additional Details and Questions
                        <>
                            <View style={styles.inputContainer}>
                                {/* Age Range - Only Min Age, Max Age removed */}
                                <View style={styles.fieldWrapper}>
                                    <View style={styles.rowContainer}>
                                        <View style={styles.fullInputContainer}>
                                            <TextInput
                                                ref={(ref) => inputRefs.current.minAge = ref}
                                                label="Min Age"
                                                value={minAge}
                                                onChangeText={setMinAge}
                                                style={styles.input}
                                                mode="outlined"
                                                keyboardType="numeric"
                                                outlineColor="#e0e0e0"
                                                activeOutlineColor="#BE4145"
                                                maxLength={2}
                                                theme={{
                                                    roundness: 8,
                                                    colors: {
                                                        primary: '#444444',
                                                        onSurfaceVariant: '#666666'
                                                    },
                                                    fonts: {
                                                        regular: {
                                                            fontFamily: 'Inter-Regular'
                                                        }
                                                    }
                                                }}
                                                placeholderTextColor="#666666"
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Minimum Education */}
                                <View style={styles.fieldWrapper}>
                                    <DropDownPicker
                                        open={minEducationOpen}
                                        value={minEducation}
                                        items={minEducationItems}
                                        setOpen={(open) => {
                                            if (open) dismissDropdownsAndFocus();
                                            setMinEducationOpen(open);
                                        }}
                                        setValue={setMinEducation}
                                        placeholder="Minimum Education Required"
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        listMode="SCROLLVIEW"
                                        zIndex={6000}
                                        zIndexInverse={1000}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        textStyle={styles.dropdownText}
                                        tickIconStyle={{ tintColor: "#BE4145" }}

                                    />
                                </View>

                                {/* Preferred Gender */}
                                <View style={styles.fieldWrapper}>
                                    <DropDownPicker
                                        open={prefGenderOpen}
                                        value={prefGender}
                                        items={genderItems}
                                        setOpen={(open) => {
                                            if (open) dismissDropdownsAndFocus();
                                            setPrefGenderOpen(open);
                                        }}
                                        setValue={setPrefGender}
                                        placeholder="Preferred Gender"
                                        style={styles.dropdown}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                        listMode="SCROLLVIEW"
                                        zIndex={5000}
                                        zIndexInverse={2000}
                                        placeholderStyle={styles.dropdownPlaceholder}
                                        textStyle={styles.dropdownText}
                                        tickIconStyle={{ tintColor: "#BE4145" }}
                                    />
                                </View>



                                {/* Screening Questions Section */}
                                <Text style={styles.sectionTitle}>Screening Questions (Optional)</Text>
                                <Text style={styles.sectionSubtitle}>Add up to 3 questions with Yes/No answers</Text>

                                {questions.map((question, index) => (
                                    <View key={index} style={styles.questionContainer}>
                                        <View style={styles.questionHeader}>
                                            <Text style={styles.questionNumber}>Question {index + 1}</Text>
                                            {questions.length > 1 && (
                                                <TouchableOpacity onPress={() => removeQuestion(index)} style={styles.removeButton}>
                                                    <Ionicons name="close-circle" size={24} color="#BE4145" />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        <TextInput
                                            ref={(ref) => inputRefs.current[`question_${index}`] = ref}
                                            label="Question"
                                            value={question.question}
                                            onChangeText={(text) => updateQuestion(index, 'question', text)}
                                            style={styles.input}
                                            mode="outlined"
                                            outlineColor="#e0e0e0"
                                            activeOutlineColor="#BE4145"
                                            theme={{
                                                roundness: 8,
                                                colors: {
                                                    primary: '#444444',
                                                    onSurfaceVariant: '#666666'
                                                },
                                                fonts: {
                                                    regular: {
                                                        fontFamily: 'Inter-Regular'
                                                    }
                                                }
                                            }}
                                            placeholderTextColor="#666666"
                                        />

                                        <View style={styles.answerContainer}>
                                            <Text style={styles.answerLabel}>Expected Answer:</Text>
                                            <View style={styles.answerButtons}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.answerButton,
                                                        question.correctAnswer === 'Yes' && styles.selectedAnswerButton
                                                    ]}
                                                    onPress={() => {
                                                        dismissDropdownsAndFocus();
                                                        updateQuestion(index, 'correctAnswer', 'Yes');
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.answerButtonText,
                                                        question.correctAnswer === 'Yes' && styles.selectedAnswerText
                                                    ]}>Yes</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.answerButton,
                                                        question.correctAnswer === 'No' && styles.selectedAnswerButton
                                                    ]}
                                                    onPress={() => {
                                                        dismissDropdownsAndFocus();
                                                        updateQuestion(index, 'correctAnswer', 'No');
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.answerButtonText,
                                                        question.correctAnswer === 'No' && styles.selectedAnswerText
                                                    ]}>No</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}

                                {questions.length < 3 && (
                                    <TouchableOpacity
                                        style={styles.addQuestionButton}
                                        onPress={() => {
                                            dismissDropdownsAndFocus();
                                            addQuestion();
                                        }}
                                    >
                                        <Ionicons name="add-circle-outline" size={20} color="#BE4145" />
                                        <Text style={styles.addQuestionText}>Add Another Question</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
            {/* Sticky Button Container */}
            <View style={styles.stickyButtonContainer}>
                {currentPage === 1 ? (
                    <TouchableOpacity
                        style={[styles.saveButton, !isPageOneValid() && styles.saveButtonDisabled]}
                        onPress={handleNext}
                        disabled={!isPageOneValid()}
                    >
                        <Text style={styles.saveButtonText}>Next</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {/* <TouchableOpacity
                            style={[styles.backButton, { flex: 1 }]}
                            onPress={() => {
                                dismissDropdownsAndFocus();
                                handleBack();
                            }}
                        >
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity> */}
                        <TouchableOpacity
                            style={[styles.saveButton, { flex: 2 }]}
                            onPress={() => {
                                dismissDropdownsAndFocus();
                                handlepostJob();
                            }}
                        >
                            <Text style={styles.saveButtonText}>{jobId ? 'Update Job' : 'Post Job'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                type={alertType}
                onClose={() => setAlertVisible(false)}
                onConfirm={alertOnConfirm ? () => { setAlertVisible(false); alertOnConfirm(); } : () => setAlertVisible(false)}
                showCancel={alertShowCancel}
                showButton={alertTitle !== 'Success'}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#faf7f2',
        marginTop: 0
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 100,
    },
    cardContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 80,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputContainer: {
        gap: 16,
    },
    input: {
        marginBottom: 0,
        backgroundColor: '#ffffff',
        fontFamily: 'Inter-Regular',
        fontSize: 14,
    },
    inputFocused: {
        borderColor: '#BE4145',
        borderWidth: 2,
    },
    inputError: {
        borderColor: '#BE4145',
        marginBottom: 4, // Add some space below the input when there's an error
    },
    label: {
        fontSize: 12,
        color: '#444444',
        marginBottom: 6, // Increased from 4 to 6 for better spacing
        fontFamily: 'Inter-Regular',
    },
    requiredStar: {
        color: '#BE4145',
        marginLeft: 2,
    },
    errorText: {
        color: '#BE4145',
        fontSize: 12,
        marginTop: 8,
        marginBottom: 16,
        marginLeft: 4,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
        paddingVertical: 0,
    },
    dropdown: {
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 0, // Remove bottom margin here as we'll handle it in the container
        // marginTop: 0,
        borderWidth: 1,
        height: 48,

    },
    dropdownError: {
        borderColor: '#BE4145',
        marginBottom: 16,

    },
    dropdownContainer: {
        marginBottom: 8, // Reduced from 16 to make room for error text
        borderWidth: 1,
        borderColor: '#e4e4e4', 
        // marginTop: 4,.
        marginBottom: -2,
        zIndex: 10000, // Ensure dropdown appears above other elements
    },
    dropdownList: {
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#ffffff',

        // marginTop: 4,.
        marginBottom: -2,
        zIndex: 10000, // Ensure dropdown appears above other elements
    },
    dropdownPlaceholder: {
        color: '#b4b4b4',
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        fontStyle: "italic",
    },
    dropdownText: {
        fontSize: 14,
        color: '#444444',
        fontFamily: 'Inter-Regular',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#444444',
        fontFamily: 'Inter-Regular',
    },
    salaryContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 0,
        alignItems: 'center',
    },
    dropdownWrapper: {
        flex: 1,
        marginTop: 24,
        fontSize: 14,
    },
    salaryInputWrapper: {
        flex: 2,
    },
    saveButton: {
        backgroundColor: '#BE4145',
        borderRadius: 8,
        paddingVertical: 16,
        // marginTop: 24,
        // marginBottom: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Montserrat-SemiBold',
    },
    cancelButton: {
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#BE4145',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#BE4145',
        fontSize: 16,
        fontFamily: 'Montserrat-SemiBold',
    },
    disabledInput: {
        color: '#b4b4b4',
        borderColor: '#e0e0e0',
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    dropdown1: {
        backgroundColor: "#f7f7f7",
        color: "#777",
        borderColor: "#ccc",
    },
    inputError: {
        borderColor: '#BE4145',
    },
    errorText: {
        color: '#BE4145',
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        marginTop: 8,
        marginBottom: 16,
        marginLeft: 4,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    fullInputContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        color: '#222222',
        marginTop: 16,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666666',
        marginBottom: 16,
    },
    questionContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    questionNumber: {
        fontSize: 16,
        fontFamily: 'Montserrat-SemiBold',
        color: '#222222',
    },
    removeButton: {
        padding: 4,
    },
    answerContainer: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'left',
    },
    answerLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#444444',
        marginBottom: 8,
        marginLeft: -8,
    },
    answerButtons: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: -8, // Align with the label 
    },
    answerButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0', // light grey border when not selected
        backgroundColor: '#ffffff',
    },
    selectedAnswerButton: {
        backgroundColor: '#FDECEC', // very light red tint
        borderColor: '#BE4145',     // red border
    },
    answerButtonText: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#444444', // dark grey when unselected
    },
    selectedAnswerText: {
        color: '#BE4145', // red text when selected
    },

    addQuestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#BE4145',
        marginBottom: 16,
    },
    addQuestionText: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: '#BE4145',
        marginLeft: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 12,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#BE4145',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginRight: 8,
    },
    backButtonText: {
        color: '#BE4145',
        fontSize: 16,
        fontFamily: 'Montserrat-SemiBold',
    },
    submitButton: {
        flex: 2,
        backgroundColor: '#BE4145',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginLeft: 8,
    },
    submitButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Montserrat-SemiBold',
    },
    // Add a wrapper for each input/dropdown to enforce consistent spacing
    fieldWrapper: {
        marginBottom: 16,
        // padding: ,
        // zIndex: 1, // Ensure dropdowns appear above other elements
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
    saveButtonDisabled: {
        backgroundColor: '#cccccc',
        opacity: 0.7,
    },
});

export default PostJobForm;