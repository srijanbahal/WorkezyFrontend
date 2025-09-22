import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView } from "react-native";
import { employerJobs, getProfileDetails, getJobDetails, getJobQuestionsJobId } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../../component/BottomNav";
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Button } from "react-native-paper";
import { useAuth } from "../../utils/AuthContext";
import DropDownPicker from 'react-native-dropdown-picker';
import { BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import CustomAlert from '../../components/CustomAlert';

const { width } = Dimensions.get('window');

const MyJobs = ({ navigation }) => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employerId, setEmployerId] = useState(null);
    const { isEmployerActive, updateUser } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [jobDetails, setJobDetails] = useState([]);
    const [statusOpen, setStatusOpen] = useState(false);
    const [statusValue, setStatusValue] = useState(null);
    const [jobQuestions, setJobQuestions] = useState([])
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('info');
    const [alertOnConfirm, setAlertOnConfirm] = useState(null);
    const [statusItems, setStatusItems] = useState([
        { label: 'All Jobs', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Expired', value: 'expired' },
        { label: 'Rejected', value: 'rejected' },
    ]);

    // Check if employer status is active, if not redirect to review page
    useEffect(() => {
        if (!isEmployerActive()) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'EmployerReview' }],
            });
        }
    }, [isEmployerActive, navigation]);

    // Update the periodic status check effect
    useEffect(() => {
        // Initial check
        checkLatestStatus();

        // Comment out the interval-based checking
        // Set up interval for periodic checking
        // const statusCheckInterval = setInterval(() => {
        //     checkLatestStatus();
        // }, 60000); // Check every minute

        // return () => clearInterval(statusCheckInterval);
    }, [employerId]);

    // Function to fetch the latest status from the server
    const checkLatestStatus = async () => {
        try {
            if (!employerId) return;

            // Fetch latest profile data
            const response = await getProfileDetails(employerId, 'employer');

            if (response && response.data) {
                let updatedUserData;

                // Handle different response formats
                if (response.data.user) {
                    updatedUserData = response.data.user;
                } else if (response.data.profile) {
                    updatedUserData = response.data.profile;
                } else if (response.data.employer) {
                    updatedUserData = response.data.employer;
                } else if (response.data) {
                    updatedUserData = response.data;
                }

                if (updatedUserData) {
                    // Update user data in context
                    await updateUser(updatedUserData);

                    // Check if status is no longer active
                    const userStatus = updatedUserData.status ||
                        updatedUserData.Status ||
                        updatedUserData.accountStatus ||
                        updatedUserData.account_status ||
                        'unknown';

                    if (userStatus.toLowerCase() !== 'active') {
                        // If status changed to inactive, redirect to review page
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'EmployerReview' }],
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error checking latest status:", error);
            // Silent error - don't show to user during background check
        }
    };

    useEffect(() => {
        const getEmployerId = async () => {
            try {
                const userDetails = await AsyncStorage.getItem("userDetails");
                if (userDetails) {
                    const parsedUser = JSON.parse(userDetails);
                    setEmployerId(parsedUser.id);
                } else {
                    setError("No employer ID found in storage.");
                }
            } catch (err) {
                setError("Failed to fetch employer ID.");
                console.error("AsyncStorage error:", err);
            }
        };
        getEmployerId();
    }, []);

    useEffect(() => {
        if (employerId) {
            fetchJobs(employerId);
        }
    }, [employerId]);

    // Filter jobs when jobs or statusValue changes
    useEffect(() => {
        if (!statusValue || statusValue === 'all') {
            setFilteredJobs(jobs);
        } else {
            setFilteredJobs(jobs.filter(job => (job.review_status || '').toLowerCase() === statusValue));
        }
    }, [jobs, statusValue]);

    const fetchJobs = async (id) => {
        try {
            setLoading(true);
            const response = await employerJobs(id);
            // Sort jobs by creation date or ID in descending order (newest first)
            const sortedJobs = response.data.jobs || [];
            sortedJobs.sort((a, b) => {
                // If you have a created_at or posted_date field, use that
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                // Fallback to ID sorting (assuming higher IDs are newer)
                return b.id - a.id;
            });
            setJobs(sortedJobs);
            console.log("Sorted jobs:", sortedJobs[0]);
        } catch (err) {
            setError("Failed to fetch jobs. Please try again.");
            console.error("API Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };





    useEffect(() => {
        const fetchJobQuestions = async () => {
            try {
                const response = await getJobQuestionsJobId(selectedJob?.id);
                console.log("Job Questions", response.data);
                if (response?.data?.questions) {
                    setJobQuestions(response.data.questions);
                }
            } catch (error) {
                console.error("Error fetching job questions:", error);
            }
        };
        fetchJobQuestions();
    }, [selectedJob?.id]);

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await getJobDetails(selectedJob?.id);
                // console.log("raw data: ", response)
                console.log("Job details: ", response.data);
                if (response?.data?.job) {
                    setJobDetails(response.data.job);
                }
            } catch (error) {
                console.error("Error Fetching Job Details: ", error)
            }
        };
        if (selectedJob?.id) {
            fetchJobDetails();
        }
    }, [selectedJob?.id])


    const showAlert = (message, onConfirm = null, type = 'info', autoClose = true) => {
        // setAlertTitle(title);
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

    // Get status button color based on status
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return '#E8F5E9'; // Light Green background
            case 'pending':
                return '#FFF8E1'; // Light Orange background
            case 'rejected':
                return 'rgba(255, 245, 243, 1)'; // Light Red background
            case 'expired':
                return '#f5f5f5'; // Gray
            default:
                return '#9E9E9E'; // Default Gray
        }
    };

    // Get status text color based on status
    const getStatusTextColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                // return 'rgba(46, 125, 50, 1)'; // Dark Green text
                return '#4CAF50'; // Dark Green text
            case 'pending':
                return '#FF9800'; // Dark Orange text
            case 'rejected':
                return 'rgba(190, 65, 69, 1)'; // Dark Red text
            case 'expired':
                return '#9E9E9E'; // Dark Gray text
            default:
                return '#666666'; // Default Dark Gray text
        }
    };
    const getPostedTime = (postedDate) => {
        const today = new Date();
        const postDate = new Date(postedDate);
        const diffTime = Math.abs(today - postDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return '1 week ago';
        } else if (diffDays <= 14) {
            return '2 weeks ago';
        } else if (diffDays <= 30) {
            return '1 month ago';
        } else {
            return `1 month ago`;
        }
    };

    const renderJobItem = ({ item }) => (
        <View style={styles.jobCard}>
            {/* Top Row: Job Title + Status */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flexShrink: 1 }}>
                    <TouchableOpacity onPress={() => { setSelectedJob(item); setModalVisible(true); }}>
                        <Text style={[styles.jobTitle, item.review_status?.toLowerCase() === 'closed' && { color: 'rgba(190,65,69,0.4)' }]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.companyName}>{item.company}</Text>
                </View>

                <View style={styles.shareButton}>
                    <View
                        style={[
                            styles.statusButton,
                            { backgroundColor: getStatusColor(item.review_status || "pending") }
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                { color: getStatusTextColor(item.review_status || "pending") }
                            ]}
                        >
                            {item.review_status || "Pending"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.shareView}
                        onPress={() => {
                            const jobUrl = `https://webapp-webezy.netlify.app/user_details/${item.id}`;

                            // Copy to clipboard
                            Clipboard.setStringAsync(jobUrl);
                            // Alert.alert("Link copied!", "You can now share it anywhere.");
                            showAlert("Link copied to clipboard!", null, 'success', true);
                        }}
                    >
                        <Text style={styles.shareText}>Share Job</Text>
                        <Ionicons
                            name="share-social"
                            size={14}
                            color="#45a6be"
                            style={styles.shareIcon}
                        />
                    </TouchableOpacity>

                </View>
            </View>

            {/* Attributes Row */}
            <View style={styles.attributesContainer}>
                {/* <View style={{ ...styles.attributeTag, backgroundColor: '#f0fdf4' }}>
                    <Ionicons name="cash-outline" size={14} color="#555" />
                    <Text style={{ ...styles.attributeText, color: '#4CAF50' }}>₹{item.salary}/month</Text>
                </View> */}
                <View style={styles.attributeTag}>
                    <Ionicons name="location-outline" size={14} color="#555" />
                    <Text style={styles.attributeText}>{item.city}, {item.country}</Text>
                </View>

                <View style={styles.attributeTag}>
                    <Ionicons name="briefcase-outline" size={14} color="#555" />
                    <Text style={styles.attributeText}>{item.job_type}</Text>
                </View>

                <View style={styles.attributeTag}>
                    <Ionicons name="school-outline" size={14} color="#555" />
                    <Text style={styles.attributeText}>{item.experience}</Text>
                </View>

            </View>


            <View style={styles.salaryContentContainer}>
                <View style={styles.salaryContainer}>
                    <Text style={styles.salaryText}>
                        ₹{item.salary}
                        <Text style={styles.salaryUnit}>/month</Text>
                    </Text>
                </View>

            </View>

            {/* Action Buttons Row */}
            {(item.review_status !== "rejected" && item.review_status !== "expired") && (
                <View style={styles.actionButtonsContainer}>
                    {/* <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        onPress={() => {
                            const jobUrl = "https://workezy.org/user_details/45";

                            // Copy to clipboard
                            Clipboard.setStringAsync(jobUrl);
                            // Alert.alert("Link copied!", "You can now share it anywhere.");
                            showAlert("Link copied to clipboard!", null, 'success', true);
                        }}
                    >
                        <Text style={styles.shareText}>Share Job</Text>
                        <Ionicons
                            name="share-social"
                            size={14}
                            color="#45a6be"
                            style={styles.shareIcon}
                        />
                    </TouchableOpacity> */}
                    {/* Left side : Date Posted */}
                    <Text style={styles.postedDateText}>
                        Posted {getPostedTime(item.posted_at)}
                    </Text>

                    {/* Right Side: Action Button */}
                    <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => {
                            if (item.review_status?.toLowerCase() === 'active') {
                                navigation.navigate("ApplicationReceived", { job: item });
                            } else {
                                navigation.navigate("PostJobForm", { jobId: item.id });
                            }
                        }}
                    >
                        {item.review_status?.toLowerCase() === 'active' ? (
                            <View style={styles.buttonContent}>
                                <Text style={styles.viewDetailsText}>View Candidates</Text>
                                {/* <MaterialIcons
                                    name="arrow-forward-ios"
                                    size={16}
                                    color="#45a6be"
                                    style={styles.arrowIcon}
                                /> */}
                                <Ionicons name="arrow-forward-outline" size={16}
                                    color="#45a6be"
                                    style={styles.arrowIcon} />
                            </View>
                        ) : item.review_status?.toLowerCase() === 'pending' ? (
                            <View style={styles.buttonContent}>
                                <Text style={styles.viewDetailsText}>Edit Job</Text>
                                <MaterialIcons
                                    name="edit"
                                    size={16}
                                    color="#45a6be"
                                    style={styles.arrowIcon}
                                />
                            </View>
                        ) : null}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const EmptyJobsState = () => (
        <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateGraphic}>
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="briefcase-outline" size={48} color="#BE4145" />
                </View>
                <View style={styles.iconSmallCircle1}>
                    <Feather name="clipboard" size={24} color="#BE4145" />
                </View>
                <View style={styles.iconSmallCircle2}>
                    <MaterialIcons name="post-add" size={24} color="#BE4145" />
                </View>
                <View style={styles.iconSmallCircle3}>
                    <Ionicons name="search-outline" size={24} color="#BE4145" />
                </View>
            </View>
            <Text style={styles.emptyStateTitle}>No Jobs Posted Yet</Text>
            {/* <Text style={styles.emptyStateMessage}>
                You haven't posted any jobs yet. Start by creating your first job posting to find candidates.
            </Text> */}
            {/* <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('PostJobForm')}
            >
                <Text style={styles.actionButtonText}>Post a New Job</Text>
            </TouchableOpacity> */}
        </View>
    );
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#BE4145" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }


    return (
        <>
            <View style={styles.container}>
                {/* Sticky header container */}
                <View style={styles.topWhiteBackground}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerTitle}></Text>
                    </View>
                </View>

                <View style={styles.filterDropdownWrapper}>
                    <DropDownPicker
                        open={statusOpen}
                        value={statusValue}
                        items={statusItems}
                        setOpen={setStatusOpen}
                        setValue={setStatusValue}
                        setItems={setStatusItems}
                        placeholder="All Jobs"
                        style={styles.filterDropdown}
                        dropDownContainerStyle={styles.filterDropdownContainer}
                        textStyle={styles.filterDropdownText}
                        placeholderStyle={styles.filterDropdownPlaceholder}
                        listMode="SCROLLVIEW"
                        ArrowDownIconComponent={({ style }) => (
                            <Ionicons name="chevron-down" size={18} color="#999" style={style} />
                        )}
                        ArrowUpIconComponent={({ style }) => (
                            <Ionicons name="chevron-up" size={18} color="#999" style={style} />
                        )}
                        tickIconStyle={{ tintColor: "#BE4145" }}
                        zIndex={1000}
                    />
                </View>

                <ScrollView
                    style={[styles.scrollContainer, { zIndex: 0, elevation: 0 }]} // 👈 keep low
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContentContainer}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#BE4145" />
                            <Text style={styles.loadingText}>Loading profile...</Text>
                        </View>
                    ) : error ? (
                        <Text style={styles.error}>{error}</Text>
                    ) : filteredJobs.length === 0 ? (
                        <EmptyJobsState />
                    ) : (
                        <FlatList
                            data={filteredJobs}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderJobItem}
                            scrollEnabled={false}
                            nestedScrollEnabled={true}
                            contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 8 }}
                        />
                    )}
                </ScrollView>
            </View >
            <BottomNav activeuser={"employer"} />

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




            {/* Modal for Job Details */}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 16,
                        width: '90%',
                        maxHeight: '80%'
                    }}>

                        {/* Close Icon */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                height: 32,
                                width: 32,
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}
                        >
                            <Ionicons name="close" size={24} color="#BE4145" />
                        </TouchableOpacity>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Title */}
                            <Text style={{
                                fontFamily: 'Montserrat-SemiBold',
                                fontSize: 24,
                                color: '#BE4145',
                                marginBottom: 24
                            }}>
                                Job Details
                            </Text>

                            {selectedJob && (
                                <>
                                    {/* Job Title Section */}
                                    {/* <Text style={{
                                        fontFamily: 'Montserrat-SemiBold',
                                        fontSize: 18,
                                        color: '#333',
                                        marginBottom: 8
                                    }}>
                                        Job Name
                                    </Text> */}
                                    <View style={{
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: 12,
                                        padding: 16,
                                        marginBottom: 16
                                    }}>

                                        <Text style={{
                                            fontFamily: 'Montserrat-SemiBold',
                                            fontSize: 18,
                                            color: '#BE4145',
                                            marginBottom: 8
                                        }}>
                                            {selectedJob.title}
                                        </Text>
                                        <Text style={{
                                            fontFamily: 'Inter-Regular',
                                            fontSize: 14,
                                            color: '#666'
                                        }}>
                                            {selectedJob.company || 'N/A'}
                                        </Text>
                                    </View>

                                    {/* Location Section */}
                                    <Text style={{
                                        fontFamily: 'Montserrat-SemiBold',
                                        fontSize: 18,
                                        color: '#333',
                                        marginBottom: 8
                                    }}>
                                        Location Details
                                    </Text>
                                    <View style={styles.jobInfoCard}>
                                        <Text style={styles.jobInfoLabel}>Location</Text>
                                        <Text style={styles.jobInfoValue}>{selectedJob.city}, {selectedJob.country}</Text>
                                        {/* 
                                        <Text style={styles.jobInfoLabel}>Country</Text>
                                        <Text style={styles.jobInfoValue}>{selectedJob.country}</Text> */}

                                        <Text style={styles.jobInfoLabel}>Location Type</Text>
                                        <Text style={styles.jobInfoValue}>{selectedJob.location_type}</Text>
                                    </View>

                                    {/* Job Info Header */}
                                    <Text style={styles.jobInfoSectionTitle}>Job Information</Text>

                                    {/* Job Info Section */}
                                    <View style={styles.jobInfoCard}>
                                        <Text style={styles.jobInfoLabel}>Job Type</Text>
                                        <Text style={styles.jobInfoValue}>{selectedJob.job_type}</Text>
{/* 
                                        <Text style={styles.jobInfoLabel}>Job Category</Text>
                                        <Text style={styles.jobInfoValue}>{selectedJob.job_type}</Text> */}

                                        <Text style={styles.jobInfoLabel}>Job Shift</Text>
                                        <Text style={styles.jobInfoValue}>{selectedJob.job_shift}</Text>

                                        <Text style={styles.jobInfoLabel}>Experience Required</Text>
                                        <Text style={styles.jobInfoValue}>{selectedJob.experience}</Text>

                                        {/* 🔹 Show only if value exists */}
                                        {jobDetails.min_age && (
                                            <>
                                                <Text style={styles.jobInfoLabel}>Minimum Age</Text>
                                                <Text style={styles.jobInfoValue}>{jobDetails.min_age}</Text>
                                            </>
                                        )}

                                        {jobDetails.min_education && (
                                            <>
                                                <Text style={styles.jobInfoLabel}>Minimum Education</Text>
                                                <Text style={styles.jobInfoValue}>{jobDetails.min_education}</Text>
                                            </>
                                        )}

                                        {jobDetails.preferred_gender && (
                                            <>
                                                <Text style={styles.jobInfoLabel}>Preferred Gender</Text>
                                                <Text style={styles.jobInfoValue}>{jobDetails.preferred_gender}</Text>
                                            </>
                                        )}
                                    </View>
                                    {/* Description */}
                                    <Text style={{
                                        fontFamily: 'Montserrat-SemiBold',
                                        fontSize: 18,
                                        color: '#333',
                                        marginBottom: 8
                                    }}>
                                        Description
                                    </Text>
                                    <View style={{
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: 12,
                                        padding: 16,
                                        marginBottom: 16
                                    }}>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#666', lineHeight: 20 }}>
                                            {selectedJob.description}
                                        </Text>
                                    </View>

                                    {/* Salary */}
                                    <Text style={{
                                        fontFamily: 'Montserrat-SemiBold',
                                        fontSize: 18,
                                        color: '#333',
                                        marginBottom: 8
                                    }}>
                                        Compensation
                                    </Text>
                                    <View style={{
                                        backgroundColor: '#f0fdf4',
                                        borderRadius: 12,
                                        padding: 16,
                                        marginBottom: 16
                                    }}>
                                        <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#4CAF50' }}>
                                            ₹{selectedJob.salary}/month
                                        </Text>
                                    </View>

                                    {/* Screening Questions (from state) */}
                                    <>
                                        {jobQuestions && jobQuestions.length > 0 && (
                                            <>
                                                <Text
                                                    style={{
                                                        fontFamily: 'Montserrat-SemiBold',
                                                        fontSize: 18,
                                                        color: '#333',
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    Screening Questions
                                                </Text>

                                                <View
                                                    style={{
                                                        backgroundColor: '#f9f9f9',
                                                        borderRadius: 12,
                                                        padding: 16,
                                                        marginBottom: 16,
                                                    }}
                                                >
                                                    {jobQuestions.map((q, index) => (
                                                        <View key={index} style={{ marginBottom: 12 }}>
                                                            <Text
                                                                style={{
                                                                    fontFamily: 'Inter-SemiBold',
                                                                    fontSize: 12,
                                                                    color: '#333',
                                                                    marginBottom: 4,
                                                                }}
                                                            >
                                                                Q{index + 1}: {q.question_text}
                                                            </Text>
                                                            <Text
                                                                style={{
                                                                    fontFamily: 'Inter-Regular',
                                                                    fontSize: 14,
                                                                    color: '#666',
                                                                }}
                                                            >
                                                                Correct Answer: {String(q.ideal_answer)}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </>
                                        )}
                                    </>



                                    {/* Status
                                    <View style={{
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: 12,
                                        padding: 16,
                                        marginBottom: 16
                                    }}>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#666', marginBottom: 8 }}>
                                            <Text style={{ fontFamily: 'Inter-SemiBold', color: '#333' }}>Review Status:</Text> {selectedJob.review_status}
                                        </Text>

                                    </View> */}
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f2ee',
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f4f2ee',
        paddingHorizontal: 14,
        padding: 16,
        paddingTop: 0,
    },
    scrollContentContainer: {
        paddingBottom: 78,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fdf7f2',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 16,
        color: '#444444',
        fontFamily: 'Inter-Regular',
    },
    header: {
        fontSize: 24, // H1 heading 
        fontFamily: 'Montserrat-Bold',
        marginBottom: 16,
        textAlign: "center",
        color: "#222222",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    error: {
        textAlign: "center",
        color: "#BE4145",
        fontSize: 14, // font size 16 -> 14 
        marginTop: 24,
        fontFamily: 'Inter-Regular',
    },
    noJobs: {
        textAlign: "center",
        fontSize: 14,  // font size 16 -> 14
        color: "#444444",
        marginTop: 24,
        fontFamily: 'Inter-Regular',
    },
    jobCard: {
        backgroundColor: '#fff',
        flexDirection: 'column',
        padding: 16,
        paddingBottom: 0, // 16 -> 24
        borderRadius: 12, // 12 -> 8
        borderWidth: 1,
        marginVertical: 8,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowColor: '#000',
        borderColor: '#e0e0e0',
        elevation: 1,
        position: 'relative',
        width: '100%',
        alignSelf: 'center',
        zIndex: 0,
    },

    jobTitle: {
        fontSize: 24,
        fontFamily: 'Montserrat-SemiBold',
        color: '#333', // primary color for clickables
        marginBottom: 2,
        textDecorationLine: 'underline', // signals clickability
    },

    companyName: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        color: '#666',
        marginBottom: 8, // space before attributes
    },

    shareButton: {
        flexDirection: 'column',
        flexWrap: 'nowrap',
        flexShrink: 0,
    },

    shareView: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 14 },

    shareText: {
        fontSize: 14,
        color: '#45a6be',
        fontFamily: 'Montserrat-SemiBold',
        marginLeft: 8,
        textDecorationLine: 'underline',
    },

    shareIcon: {
        marginTop: 2,
    },

    statusButton: {
        // position: 'absolute',
        // top: 8,
        // right: 8,
        minHeight: 28,
        paddingHorizontal: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        marginLeft: 8,
        // margintop: 50,
        // paddingTop: 4,
    },

    statusText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        textTransform: 'capitalize',
    },

    attributesContainer: {
        flexDirection: 'row',
        // flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
        marginTop: 8,
        width: '100%',
        marginLeft: -8,
        paddingRight: 8,
    },

    attributeTag: {
        backgroundColor: '#f9f9f9',
        paddingVertical: 6,
        paddingHorizontal: 6,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        // marginRight: 8,
        marginBottom: 8,
        marginTop: 4,
        minWidth: 80,
        minHeight: 24,
        flexDirection: "row",
        alignItems: "center",
    },

    attributeText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Inter-Regular',
        marginLeft: 4,
        textTransform: 'capitalize',
    },

    salaryContentContainer: {
        flex: 1,
        marginLeft: 2,
        flexDirection: 'row', // <-- VERY important for left/right layout
        alignItems: 'center', // or 'flex-start' if you want top alignment
        justifyContent: 'space-between', // <-- puts one item on left, other on right
        marginBottom: 16,
    },
    salaryContainer: {
        flex: 1,
        marginLeft: 2,
    },

    salaryText: {
        fontSize: 20,
        fontFamily: 'Montserrat-SemiBold',
        color: '#b44145',   // primary red
        fontWeight: 'bold',
    },

    salaryUnit: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666',
    },
    viewDetailsButton: {
        // Remove absolute positioning
        backgroundColor: 'transparent',
        marginRight: 8,
        // minHeight: 44, // added 
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
    },
    viewDetailsText: {
        color: '#45a6be',
        fontSize: 14,
        fontFamily: 'Montserrat-SemiBold',
        // marginRight: 6,
        textDecorationLine: 'underline',
        // marginTop: 2,
    },

    arrowIcon: {
        marginLeft: 4,
        marginTop: 2,
    },
    // viewDetailsText1: {
    //     color: '#666666',
    //     fontSize: 14,
    //     fontFamily: 'Montserrat-SemiBold',
    //     marginRight: 6,

    // },
    // hideButton: {
    //     display: 'none'
    // },
    // viewDetailsButtonPopup: {
    //     // Remove absolute positioning
    //     backgroundColor: 'transparent',
    //     marginRight: 8,
    //     // minHeight: 44, // added
    // },
    actionButtonsRow: {
        flexDirection: 'row',
        position: 'relative',
        // bottom: 16,
        left: 6,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        minHeight: '100%',
        paddingVertical: 40,
    },
    emptyStateGraphic: {
        width: width * 0.6,
        height: width * 0.6,
        marginBottom: 32,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(190, 65, 69, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconSmallCircle1: {
        position: 'absolute',
        top: 20,
        right: 40,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(190, 65, 69, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconSmallCircle2: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(190, 65, 69, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconSmallCircle3: {
        position: 'absolute',
        bottom: 10,
        right: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(190, 65, 69, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateTitle: {
        fontSize: 24,
        fontFamily: 'Montserrat-Bold',
        color: '#222222',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateMessage: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    actionButton: {
        backgroundColor: '#BE4145',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 300,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Montserrat-SemiBold',
    },
    topWhiteBackground: {
        backgroundColor: '#BE4145', // changed
        paddingTop: 16, // from 58 to 24
        paddingBottom: 0,
        paddingHorizontal: 16,
        zIndex: 1000,
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerRow: {
        flexDirection: 'column', // changed from 'row' to 'column'
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18, // 20 -> 18
        color: '#ffffff',
        marginBottom: 12,
    },
    filterDropdownWrapper: {
        position: "relative",
        minWidth: '100%',
        // minHeight: 14,
        alignItems: 'flex-start',
        // marginBottom: 6,
        marginTop: 16,
        zIndex: 1001,
        paddingBottom: 16,
        backgroundColor: '#f4f2ee',
        // paddingHorizontal: "92
        // marginHorizontal: 20,
        minWidth: '92%',
        paddingHorizontal: 20,

    },
    filterDropdown: {
        flexDirection: 'row',
        minWidth: '100%',
        alignItems: 'center',
        // paddingLeft: 44,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        height: 40,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    },

    filterDropdownContainer: {
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#fff',
        zIndex: 1001,
        // marginLeft: 14,
    },

    filterDropdownText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#333',
        marginLeft: 4,
        marginRight: 4,
    },

    filterDropdownPlaceholder: {
        color: '#999',
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        marginLeft: 4,
    },

    jobInfoCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    jobInfoLabel: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 12,
        color: '#333',
        marginBottom: 4,
    },
    filterIconInside: {
        position: "absolute",
        left: 12,        // distance from left edge of dropdown
        top: "50%",      // center vertically
        transform: [{ translateY: -10 }], // adjust for icon size
        zIndex: 10,      // keep above dropdown box
    },

    jobInfoValue: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    jobInfoSectionTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18,
        color: '#333',
        marginBottom: 8,
    },
    salaryCandidatesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginTop: 2,
    },

    // salaryText: {
    //     fontSize: 18,
    //     fontFamily: 'Montserrat-SemiBold',
    //     color: '#b44145',   // your primary color
    //     // fontStyle: 'normal',
    // },

    // salaryUnit: {
    //     fontSize: 12,
    //     fontFamily: 'Inter-Regular',
    //     color: '#666',      // subtle gray for "/month"
    // },

    candidatesText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#333',
    },

    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // marginTop: 8,
        // paddingHorizontal: 4,
        marginBottom: 16,
        // paddingBottom: 8,
    },
    postedDateText: {
        fontSize: 12,
        color: '#666666',
        fontFamily: 'Inter-Regular',
        marginTop: 4,
        marginLeft: 4,
    },


    // salaryContainer: {
    //     flex: 1,
    // },

    // salaryText: {
    //     fontSize: 18,
    //     fontFamily: 'Montserrat-SemiBold',
    //     color: '#b44145',   // primary red
    // },

    // salaryUnit: {
    //     fontSize: 12,
    //     fontFamily: 'Inter-Regular',
    //     color: '#666',
    // },

    // viewDetailsButton: {
    //     paddingVertical: 6,
    //     // paddingHorizontal: 10,
    //     borderRadius: 8,
    //     // marginLeft: 24,
    //     // backgroundColor: '#333',
    // },

    // buttonContent: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    // },

    // viewDetailsText: {
    //     fontSize: 14,
    //     color: '#45a6be',
    //     marginRight: 4,
    // },
});

export default MyJobs;