import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView } from "react-native";
import { employerJobs, getProfileDetails, getJobDetails, getJobQuestions } from "../../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../../component/BottomNav";
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Button } from "react-native-paper";
import { useAuth } from "../../utils/AuthContext";
import DropDownPicker from 'react-native-dropdown-picker';
import { BackHandler } from 'react-native';

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
    const [statusOpen, setStatusOpen] = useState(false);
    const [statusValue, setStatusValue] = useState(null);
    const [jobQuestions, setJobQuestions] = useState([])
    const [statusItems, setStatusItems] = useState([
        { label: 'All Jobs', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
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
            console.log("Sorted jobs:", sortedJobs);
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
                const response = await getJobQuestions(selectedJob?.id);
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

    // Get status button color based on status
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'rgba(232, 245, 233, 1)'; // Light Green background
            case 'pending':
                return 'rgba(255, 248, 225, 1)'; // Light Orange background
            case 'rejected':
                return 'rgba(255, 245, 243, 1)'; // Light Red background
            case 'expired':
                return '#9E9E9E'; // Gray
            default:
                return '#9E9E9E'; // Default Gray
        }
    };

    // Get status text color based on status
    const getStatusTextColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'rgba(46, 125, 50, 1)'; // Dark Green text
            case 'pending':
                return 'rgba(245, 124, 0, 1)'; // Dark Orange text
            case 'rejected':
                return 'rgba(190, 65, 69, 1)'; // Dark Red text
            case 'expired':
                return '#666666'; // Dark Gray text
            default:
                return '#666666'; // Default Dark Gray text
        }
    };

    const renderJobItem = ({ item }) => (
        <View style={styles.jobCard}>
            {/* Right Section - Status Button */}
            <View style={styles.rightSection}>
                <View
                    style={[
                        styles.statusButton,
                        {
                            // Use your helper function for the background color
                            backgroundColor: getStatusColor(item.review_status || "pending"),
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusText,
                            {
                                // Use your helper function for the text color
                                color: getStatusTextColor(item.review_status || "pending"),
                            },
                        ]}
                    >
                        {item.review_status || "Pending"}
                    </Text>
                </View>
            </View>

            {/* Left Section - Job Details */}
            <View style={styles.leftSection}>
                <TouchableOpacity onPress={() => { setSelectedJob(item); setModalVisible(true); }}>
                    <Text style={[styles.jobTitle, item.review_status?.toLowerCase() === 'closed' && { color: 'rgba(190,65,69,0.4)' }]}>{item.title}</Text>
                </TouchableOpacity>
                <Text style={styles.companyName}>{item.company}</Text>

                {/* Job Attributes Row */}
                <View style={styles.attributesContainer}>
                    {/* Location Tag */}
                    <View style={styles.attributeTag}>
                        <Text style={styles.attributeText}>{item.city}, {item.country}</Text>
                    </View>

                    {/* Job Type Tag */}
                    <View style={styles.attributeTag}>
                        <Text style={styles.attributeText}>{item.job_type}</Text>
                    </View>

                    {/* Experience Tag */}
                    <View style={styles.attributeTag}>
                        <Text style={styles.attributeText}>{item.experience}</Text>
                    </View>

                    {/* Salary Tag */}
                    <View style={styles.attributeTag}>
                        <Text style={styles.attributeText}>₹{item.salary}/month</Text>
                    </View>

                    {/* Shift Tag if available
                    {item.shift && (
                        <View style={styles.attributeTag}>
                            <Text style={styles.attributeText}>{item.shift}</Text>
                        </View>
                    )} */}

                    {/* Location Type Tag if available
                    {item.location_type && (
                        <View style={styles.attributeTag}>
                            <Text style={styles.attributeText}>{item.location_type}</Text>
                        </View>
                    )} */}

                    {/* Posted Date Tag */}
                    {item.created_at && (
                        <View style={styles.attributeTag}>
                            <Text style={styles.attributeText}>
                                Posted: {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Action Buttons Row - Bottom Right */}
            {(item.review_status !== "rejected" && item.review_status !== "expired") && (
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                        style={styles.viewDetailsButtonPopup}
                        // Disable the button if the job status is 'pending'
                        disabled={item.review_status?.toLowerCase() === 'pending' || item.review_status?.toLowerCase() === 'active' || item.review_status?.toLowerCase() === 'expired' || item.review_status?.toLowerCase() === 'rejected'}
                    >
                        <View style={styles.buttonContent}>
                            <Text style={styles.viewDetailsText1}>Candidates: {item.candidates}</Text>
                        </View>
                    </TouchableOpacity>
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
                                <MaterialIcons name="arrow-forward-ios" size={18} color="#45a6be" style={styles.arrowIcon} />
                            </View>
                        ) : item.review_status?.toLowerCase() === 'pending' ? (
                            <View style={styles.buttonContent}>
                                <Text style={styles.viewDetailsText}>Edit Job</Text>
                                <MaterialIcons name="edit" size={18} color="#45a6be" style={styles.arrowIcon} />
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

    return (
        <>
            <View style={styles.container}>
                {/* Sticky header container */}
                <View style={styles.topWhiteBackground}>
                    <View style={styles.headerRow}>
                        <Text style={styles.postedJobsTitle}></Text>
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
                                ArrowDownIconComponent={({ style }) => <Ionicons name="chevron-down" size={18} color="#999" style={style} />}
                                ArrowUpIconComponent={({ style }) => <Ionicons name="chevron-up" size={18} color="#999" style={style} />}
                            />
                        </View>
                    </View>
                </View>

                {/* Scrollable content */}
                <ScrollView
                    style={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContentContainer}
                >
                    {loading ? (
                        <ActivityIndicator size="large" color="#BE4145" style={styles.loader} />
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
            </View>
            <BottomNav activeuser={"employer"} />

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

                                        <Text style={styles.jobInfoLabel}>Job Shift</Text>
                                        <Text style={styles.jobInfoValue}>{selectedJob.job_shift}</Text>

                                        <Text style={styles.jobInfoLabel}>Experience</Text>
                                        <Text style={styles.jobInfoValue}>{selectedJob.experience}</Text>
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
                                        <Text style={{
                                            fontFamily: 'Montserrat-SemiBold',
                                            fontSize: 18,
                                            color: '#333',
                                            marginBottom: 8
                                        }}>
                                            Screening Questions
                                        </Text>
                                        <View style={{
                                            backgroundColor: '#f9f9f9',
                                            borderRadius: 12,
                                            padding: 16,
                                            marginBottom: 16
                                        }}>
                                            {jobQuestions.map((q, index) => (
                                                <View key={index} style={{ marginBottom: 12 }}>
                                                    <Text style={{
                                                        fontFamily: 'Inter-SemiBold',
                                                        fontSize: 12,
                                                        color: '#333',
                                                        marginBottom: 4
                                                    }}>
                                                        Q{index + 1}: {q.question_text}
                                                    </Text>
                                                    <Text style={{
                                                        fontFamily: 'Inter-Regular',
                                                        fontSize: 14,
                                                        color: '#666'
                                                    }}>
                                                        Correct Answer: {String(q.ideal_answer)}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </>


                                    {/* Status */}
                                    <View style={{
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: 12,
                                        padding: 16,
                                        marginBottom: 16
                                    }}>
                                        <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#666', marginBottom: 8 }}>
                                            <Text style={{ fontFamily: 'Inter-SemiBold', color: '#333' }}>Review Status:</Text> {selectedJob.review_status}
                                        </Text>

                                    </View>
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
    },
    scrollContentContainer: {
        paddingBottom: 78,
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
    },
    leftSection: {
        flex: 1,
        paddingRight: 60,
    },
    rightSection: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    statusButton: {
        minWidth: 64,
        minHeight: 28,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    statusText: {
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        textTransform: 'capitalize',
    },
    jobTitle: {
        fontSize: 24,
        fontFamily: 'Montserrat-SemiBold',
        color: '#333333', // primary color for clickables
        marginBottom: 0,
        textDecorationLine: 'underline', // signals clickability
    },
    companyName: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666666',
        marginBottom: 24,
    },
    attributesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 0,
        marginBottom: 8,
        width: '80%',
    },
    attributeTag: {
        backgroundColor: '#f9f9f9',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginRight: 6,
        marginBottom: 6, // 8 -> 6 
    },
    attributeText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Inter-Regular',
    },
    viewDetailsButton: {
        // Remove absolute positioning
        backgroundColor: 'transparent',
        marginRight: 8,
        minHeight: 44, // added 
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewDetailsText: {
        color: '#45a6be',
        fontSize: 14,
        fontFamily: 'Montserrat-SemiBold',
        marginRight: 6,
        textDecorationLine: 'underline',
    },
    viewDetailsText1: {
        color: '#666666',
        fontSize: 14,
        fontFamily: 'Montserrat-SemiBold',
        marginRight: 6,

    },
    arrowIcon: {
        marginLeft: 4,
    },
    hideButton: {
        display: 'none'
    },
    viewDetailsButtonPopup: {
        // Remove absolute positioning
        backgroundColor: 'transparent',
        marginRight: 8,
        minHeight: 44, // added
    },
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
        paddingBottom: 6,
        paddingHorizontal: 16,
        zIndex: 1000,
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    postedJobsTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18, // 20 -> 18
        color: '#222',
        marginBottom: 20,
    },
    filterDropdownWrapper: {
        minWidth: '100%',
        minWidth: 140,
        minHeight: 14,
        alignItems: 'flex-end',
        marginBottom: 14,
        // marginLeft: -8,
    },
    filterDropdown: {
        flexDirection: 'row',
        // minWidth: '100%',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        height: 40,
        paddingHorizontal: 16,
        minWidth: 140,
        justifyContent: 'center',
    },
    filterDropdownContainer: {
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#fff',
        zIndex: 1000,
    },
    filterDropdownText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#333',
        marginRight: 4,
    },
    filterDropdownPlaceholder: {
        color: '#999',
        fontFamily: 'Inter-Regular',
        fontSize: 14,
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
    // headerRow: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'space-between',
    //     width: '100%',
    // },
    // postedJobsTitle: {
    //     fontFamily: 'Montserrat-SemiBold',
    //     fontSize: 18, // 20 -> 18
    //     color: '#222',
    //     marginBottom: 0,
    // },
    // filterDropdownWrapper: {
    //     minWidth: 120,
    //     alignItems: 'flex-end',
    //     marginBottom: 14,
    // },
    // filterDropdown: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     backgroundColor: '#fff',
    //     borderWidth: 1,
    //     borderColor: '#e0e0e0',
    //     borderRadius: 8,
    //     height: 40,
    //     paddingHorizontal: 16,
    //     minWidth: 140,
    //     justifyContent: 'center',
    // },
    // filterDropdownContainer: {
    //     borderColor: '#e0e0e0',
    //     borderRadius: 8,
    //     backgroundColor: '#fff',
    //     zIndex: 1000,
    // },
    // filterDropdownText: {
    //     fontFamily: 'Inter-Regular',
    //     fontSize: 14,
    //     color: '#333',
    //     marginRight: 4,
    // },
    // filterDropdownPlaceholder: {
    //     color: '#999',
    //     fontFamily: 'Inter-Regular',
    //     fontSize: 14,
    // },
});

export default MyJobs;