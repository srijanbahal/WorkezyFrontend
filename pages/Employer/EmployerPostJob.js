import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Modal, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../../component/BottomNav';
import { getJobDetails, postJob } from '../../utils/api';
import { BackHandler } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { updateJob } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';


const EmployerPostJob = ({ navigation }) => {
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

    const jobTypeItems = [
        { label: 'Full-Time', value: 'full-time' },
        { label: 'Part-Time', value: 'part-time' },
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
        { label: 'Day Shift', value: 'day' },
        { label: 'Night Shift', value: 'night' },
        { label: 'Rotational Shift', value: 'rotational' },
    ];

    const ExperienceItems = [
        { label: 'Fresher', value: 'fresher' },
        { label: '1-2 Years', value: '1-2years' },
        { label: '3-5 Years', value: '3-5years' },
        { label: '6-8 Years', value: '6-8years' },
        { label: '9-12 Years', value: '9-12years' },
        { label: '13-15 Years', value: '13-15years' },
        { label: '15+ Years', value: '15+years' },

    ];
    const locationItems = [
        { label: 'Work From Office', value: 'work-from-office' },
        { label: 'Work From Home', value: 'work-from-home' },
        { label: 'Hybrid', value: 'hybrid' },
    ];

    const salaryItems = [
        { label: 'Less than $20,000', value: '<20000' },
        { label: '$20,000 - $50,000', value: '20000-50000' },
        { label: '$50,000 - $100,000', value: '50000-100000' },
        { label: 'More than $100,000', value: '>100000' },
    ];

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Do nothing or handle custom behavior
            return false;
        });

        return () => backHandler.remove();
    }, []);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => false, // Disable back button
        });
    }, [navigation]);


    // Fetch employerId and company name from AsyncStorage
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const userDetails = await AsyncStorage.getItem('userDetails');
                if (userDetails) {
                    const parsedUser = JSON.parse(userDetails);
                    setEmployerId(parsedUser.id);
                    setCompanyName(parsedUser.company);
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

                    console.log("Response data", response.data)

                    // Set all form fields with existing data
                    setJobTitle(jobData.title);
                    setCity(jobData.city);
                    setCountry(jobData.country);
                    setJobType(jobData.job_type);
                    setShift(jobData.shift);
                    setLocationType(jobData.location_type);
                    setSalary(jobData.salary);
                    setJd(jobData.description);
                    setNumEmployees(jobData.numEmployees);
                    setExperience(jobData.experience);
                    setIndustry(jobData.industry);

                    // Open the modal automatically for editing
                    setModalVisible(true);
                } catch (error) {
                    console.error('Error fetching job details:', error);
                    Alert.alert('Error', 'Failed to load job details');
                }
            }
        };
        fetchJobDetails();
    }, [jobId]);



    const handlepostJob = async () => {
        if (!jobTitle || !jobType || !shift || !locationType || !salary || !jd || !numEmployees) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (!employerId) {
            Alert.alert('Error', 'Employer ID not found');
            return;
        }

        const jobData = {
            employerId,
            jobTitle,
            company_logo,
            company,
            city,
            country,
            jobType,
            experience,
            industry,
            shift,
            locationType,
            salary: convertedSalary,
            jd,
            numEmployees,
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
                Alert.alert("Success", jobId ? "Job Updated Successfully" : "Job Posted Successfully");
                setModalVisible(false);
                // navigation.navigate("MyJobs");
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MyJobs' }],
                });
            } else {
                Alert.alert("Error", response?.message || "Something went wrong");
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An error occurred. Please try again.');
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
    };

    const [searchText, setSearchText] = useState('');
    const [filteredIndustries, setFilteredIndustries] = useState([]);

    const handleSearch = (text) => {
        setSearchText(text);
        if (text.length > 0) {
            // Ensure industryItems is an array and correctly access `label`
            const matches = industryItems
                .filter(item => item.label?.toLowerCase().startsWith(text.toLowerCase()))
                .map(item => item.label); // Extract only the labels for filtering

            setFilteredIndustries(matches.length > 0 ? matches : [text]); // Show typed input as a new option
        } else {
            setFilteredIndustries([]);
        }
    };

    const handleSelectIndustry = (selectedIndustry) => {
        setIndustry(selectedIndustry);
        setSearchText(selectedIndustry);

        setFilteredIndustries([]);

        // Add new industry if not already in the list
        if (!industryItems.includes(selectedIndustry)) {
            setIndustryItems(prev => [...prev, selectedIndustry]);
        }
    };


    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity style={styles.postJobButton} onPress={() => navigation.navigate("PostJobForm")} >


                    <Ionicons name="add-circle-outline" size={24} color="#BE4145" />
                    <Text style={styles.saveButtonText}>Post a Job</Text>
                </TouchableOpacity>


                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Post a </Text>

                            <ScrollView keyboardShouldPersistTaps="handled">
                                <TextInput
                                    label="Job Title"
                                    value={jobTitle}
                                    onChangeText={setJobTitle}
                                    style={styles.input}
                                    mode="outlined"
                                />
                                <TextInput
                                    label="Location City"
                                    value={city}
                                    onChangeText={setCity}
                                    style={styles.input}
                                    mode="outlined"
                                />
                                <TextInput
                                    label="Country"
                                    value={country}
                                    onChangeText={setCountry}
                                    style={styles.input}
                                    mode="outlined"
                                />
                                <DropDownPicker
                                    open={jobTypeOpen}
                                    value={jobType}
                                    items={jobTypeItems}
                                    setOpen={setJobTypeOpen}
                                    setValue={setJobType}
                                    placeholder="Select Job Type"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    listMode="SCROLLVIEW"
                                />
                                <TextInput
                                    label="Search Industry"
                                    value={searchText}
                                    onChangeText={handleSearch}
                                    style={styles.input}
                                    mode='outlined'
                                />
                                {filteredIndustries.length > 0 && (
                                    <View style={styles.dropdown}>
                                        {filteredIndustries.map((item, index) => (
                                            <TouchableOpacity
                                                key={index.toString()}
                                                onPress={() => handleSelectIndustry(item)}
                                                style={styles.item}
                                            >
                                                <Text>{item}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                                <DropDownPicker
                                    open={shiftOpen}
                                    value={shift}
                                    items={shiftItems}
                                    setOpen={setShiftOpen}
                                    setValue={setShift}
                                    placeholder="Select Shift"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    listMode="SCROLLVIEW"
                                />
                                <DropDownPicker
                                    open={locationTypeOpen}
                                    value={locationType}
                                    items={locationItems}
                                    setOpen={setLocationTypeOpen}
                                    setValue={setLocationType}
                                    placeholder="Select Location Type"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    listMode="SCROLLVIEW"
                                />

                                {/* Salary Input with Currency Dropdown */}
                                <View style={styles.salaryContainer}>
                                    <View style={styles.dropdownWrapper}>
                                        <DropDownPicker
                                            open={currencyOpen}
                                            value={currency}
                                            items={currencyItems}
                                            setOpen={setCurrencyOpen}
                                            setValue={setCurrency}
                                            placeholder="Select Currency"
                                            style={styles.dropdown}
                                            dropDownContainerStyle={styles.dropdownContainer}
                                            listMode="SCROLLVIEW"
                                        />
                                    </View>
                                    <View style={styles.salaryInputWrapper}>
                                        <TextInput
                                            label="Salary Amount"
                                            value={salary}
                                            onChangeText={setSalary}
                                            style={styles.input}
                                            mode="outlined"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <DropDownPicker
                                    open={experienceOpen}
                                    value={experience}
                                    items={ExperienceItems}
                                    setOpen={setExperienceOpen}
                                    setValue={setExperience}
                                    placeholder="Select Required Experience"
                                    style={styles.dropdown}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    listMode="SCROLLVIEW"
                                />
                                <TextInput
                                    label="Job Description (JD)"
                                    value={jd}
                                    onChangeText={setJd}
                                    style={[styles.input, styles.textArea]}
                                    mode="outlined"
                                    multiline
                                    numberOfLines={4}
                                />

                                <TextInput
                                    label="No. of Employees"
                                    value={numEmployees}
                                    onChangeText={setNumEmployees}
                                    style={styles.input}
                                    mode="outlined"
                                    keyboardType="numeric"
                                />
                                <View style={styles.buttonContainer}>
                                    <Button mode="contained" onPress={handlepostJob} style={styles.submitButton}>
                                        Submit
                                    </Button>
                                    <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                        Cancel
                                    </Button>
                                </View>
                            </ScrollView>

                        </View>
                    </View>
                </Modal>
            </View>
            <BottomNav activeuser={'employer'} />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f4f2ee', // changed from #f8f9fa(Not in brand Palatte) to #FDF7F2
        justifyContent: 'center',
        // alignItems: 'center',
    },
    postJobButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'center',
        height: 50, //changed from 50 to 48

        borderRadius: 10, // changed from 10 to 8
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#BE4145",
        color: "Red",
        fontWeight: 'bold'
    },
    saveButtonText: {
        color: '#BE4145',
        fontSize: 16, // changed from 16 to 14   
        fontWeight: '600',
        marginLeft: 6
        // fontFamily: 'Inter-Regular', // or Montserrat-SemiBold if intended as CTA
    },
    jobCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 10,
        elevation: 2,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    location: {
        fontSize: 14,
        color: '#666',
    },
    jobType: {
        fontSize: 14,
        color: '#666',
    },
    shift: {
        fontSize: 14,
        color: '#666',
    },
    locationType: {
        fontSize: 14,
        color: '#666',
    },
    salary: {
        fontSize: 14,
        color: '#666',
    },
    jd: {
        fontSize: 14,
        color: '#666',
    },
    numEmployees: {
        fontSize: 14,
        color: '#666',
    },
    viewApplicantsButton: {
        backgroundColor: '#007bff',// Should be this -> '#45A6BE' (in Brand palatte)
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    viewApplicantsButtonText: {
        color: '#fff',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        maxHeight: '90%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 100,
    },
    dropdown: {
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    submitButton: {
        flex: 1,
        marginRight: 5,
        backgroundColor: '#BE4145',
    },
    cancelButton: {
        flex: 1,
        marginLeft: 5,
        borderColor: '#BE4145',
        borderRadius: 8,
    },
    dropdownContainer: {
        borderColor: '#ccc',
        zIndex: 20000
    },
    salaryContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        gap: 10, // Space between elements
    },
    dropdownWrapper: {
        flex: 1, // Ensures dropdown takes equal space
    },
    // dropdown: {
    //     width: "100%", // Ensures dropdown width is proper
    // },
    salaryInputWrapper: {
        flex: 2, // Salary input takes more space
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0' // changed from #ddd to #e0e0e0 (not in palatte)
    }

});

export default EmployerPostJob;