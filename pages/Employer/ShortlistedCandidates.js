import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { getShortlistedCandidates, getCandidateDetails } from "../../utils/api";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
const { width } = Dimensions.get('window');


const ShortlistedCandidates = () => {
    const route = useRoute();
    const navigation = useNavigation();

    const screeningId = route?.params?.screeningId;
    const jobId = route?.params?.jobId;

    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log(`📡 Fetching shortlisted candidates for screeningId: ${screeningId}`);

                const res = await getShortlistedCandidates(screeningId);
                console.log("✅ Shortlisted Candidates Response:", res.data);

                const shortlisted = res.data.shortlistedCandidates || [];

                // Fetch candidate details in parallel
                const detailedCandidates = await Promise.all(
                    shortlisted.map(async (item) => {
                        try {
                            const detailsRes = await getCandidateDetails(item.candidate.id);
                            console.log(`✅ Candidate ${item.candidate.id} Details:`, detailsRes.data);

                            // 🟢 Flatten the candidate object here
                            return {
                                ...detailsRes.data.candidate, // <--- SPREAD THE INNER CANDIDATE OBJECT
                                candidateScreeningId: item.candidateScreeningId,
                            };
                        } catch (err) {
                            console.error(`❌ Failed to fetch details for candidateId ${item.candidate.id}:`, err.message);
                            return null;
                        }
                    })
                );

                // Filter out failed fetches
                const validCandidates = detailedCandidates.filter(Boolean);

                console.log("✅ Flattened Candidates:", validCandidates);

                setCandidates(validCandidates);
            } catch (error) {
                console.error("❌ Error fetching shortlisted candidates:", error.message);
                setCandidates([]);
            } finally {
                setLoading(false);
            }
        };

        if (screeningId) {
            fetchData();
        }
    }, [screeningId]);


    const getInitials = (name) => {
        if (!name) return "";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#BE4145" />
                <Text style={styles.loadingText}>Loading shortlisted candidates...</Text>
            </View>
        );
    }

    if (candidates.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No shortlisted candidates found</Text>
            </View>
        );
    }

    // Helper function to format role text
    const formatRoleText = (role) => {
        if (!role) return 'Job Seeker';

        // Replace underscores with spaces and capitalize each word
        return role.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };


    const renderApplicantItem = ({ item }) => {
        console.log("Rendering candidate:", item);
        // Get initials from full name
        const getInitials = (name) => {
            if (!name) return '';
            const parts = name.trim().split(' ');
            if (parts.length === 1) return parts[0][0].toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        };

        // Attribute tags: skills, experience, education, salary (separate tags, not merged)
        const attributeTags = [];
        if (item.skills && Array.isArray(item.skills)) {
            attributeTags.push(...item.skills);
        } else if (item.skills) {
            attributeTags.push(item.skills);
        }
        if (item.experience_years) attributeTags.push(item.experience_years);
        if (item.highest_education) attributeTags.push(item.highest_education);
        if (item.role) attributeTags.push(item.role);
        // if (item.expected_salary) attributeTags.push(`$${item.expected_salary}`);
        // // if (item.role) attributeTags.push(item.role);
        // else attributeTags.push('Salary not specified');

        return (
            <View style={styles.jobCardRedesigned}>
                {/* Profile Image or Initials Circle Top Right */}
                {item.profile_image ? (
                    <Image
                        source={{ uri: item.profile_image }}
                        style={[styles.initialsCircle, { backgroundColor: '#fff' }]}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.initialsCircle}>
                        <Text style={styles.initialsText}>{getInitials(item.full_name)}</Text>
                    </View>
                )}
                {/* Name and Role */}
                <Text style={styles.candidateName}>{item.full_name}</Text>
                <Text style={styles.candidateRole}>{formatRoleText(item.role || item.industry || '—')}</Text>
                {/* <Text style={styles.candidateRole}>{item.role || item.industry || '—'}</Text> */}
                {/* Attribute Tags */}
                <View style={styles.attributesContainerRedesigned}>
                    {/* 🔹 Experience Years */}
                    {item.experience_years && (
                        <View style={styles.attributeTagRedesigned}>
                            <Ionicons name="time-outline" size={14} color="#555" />
                            <Text style={styles.attributeTextRedesigned}>{item.experience_years}</Text>
                        </View>
                    )}

                    {/* 🔹 Highest Education */}
                    {item.highest_education && (
                        <View style={styles.attributeTagRedesigned}>
                            <Ionicons name="school-outline" size={14} color="#555" />
                            <Text style={styles.attributeTextRedesigned}>{item.highest_education}</Text>
                        </View>
                    )}

                    {/* 🔹 Role */}
                    {/* {item.role && (
                <View style={styles.attributeTagRedesigned}>
                  <Ionicons name="briefcase-outline" size={14} color="#555" />
                  <Text style={styles.attributeTextRedesigned}>{item.role}</Text>
                </View>
              )} */}

                </View>

                {/* View Details Button */}
                <TouchableOpacity
                    style={styles.viewDetailsButtonRedesigned}
                    onPress={() =>
                        navigation.navigate("CandidateDetails", {
                            candidateId: item.id,
                            jobId: jobId,
                        })
                    }
                >
                    <View style={styles.buttonContentRedesigned}>
                        <Text style={styles.viewDetailsTextRedesigned}>View Details</Text>
                    </View>
                </TouchableOpacity>




            </View>
        );
    };

    const EmptyApplicationsState = () => (
        <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateGraphic}>
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="account-search-outline" size={48} color="#BE4145" />
                </View>
                <View style={styles.iconSmallCircle1}>
                    <Feather name="file-text" size={24} color="#BE4145" />
                </View>
                <View style={styles.iconSmallCircle2}>
                    <MaterialIcons name="work-outline" size={24} color="#BE4145" />
                </View>
                <View style={styles.iconSmallCircle3}>
                    <Ionicons name="people-outline" size={24} color="#BE4145" />
                </View>
            </View>
            <Text style={styles.emptyStateTitle}>No Applications Yet</Text>
            <Text style={styles.emptyStateMessage}>
                There are no applications received for this job posting yet. Applications will appear here once candidates apply.
            </Text>
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.actionButtonText}>Go Back to My Jobs</Text>
            </TouchableOpacity>
        </View>
    );

    console.log("✅ Rendering shortlisted candidates:", candidates.map(c => c));
    return (
        // <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        //     {candidates.map((item) => (

        //     ))}
        // </ScrollView>
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#BE4145" style={styles.loader} />
            ) : candidates.length === 0 ? (
                <EmptyApplicationsState />
            ) : (
                <FlatList
                    data={candidates}
                    keyExtractor={(item) => (item.candidateScreeningId || item.id).toString()}
                    renderItem={renderApplicantItem}
                    contentContainerStyle={styles.scrollContent}
                />
            )}
        </View >
    );
};

export default ShortlistedCandidates;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 12,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignSelf: "flex-end",
        marginBottom: 8,
    },
    initialsCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end",
        marginBottom: 8,
    },
    initialsText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    candidateName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
        color: "#222",
    },
    candidateEmail: {
        fontSize: 14,
        color: "#555",
        marginBottom: 6,
    },
    attributesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 10,
    },
    attributeTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F1F1",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    attributeText: {
        marginLeft: 4,
        fontSize: 13,
        color: "#333",
    },
    viewDetailsButton: {
        borderTopWidth: 1,
        borderTopColor: "#EEE",
        marginTop: 10,
        paddingTop: 10,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#45a6be",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#777",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        color: "#999",
        fontSize: 16,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f4f2ee',
        marginTop: 8, // fixed from 10 to 8 for consistency
    },
    filterContainer: {
        marginBottom: 20,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    filterLabel: {
        fontSize: 14, // fixed from 16 to 14 for consistency
        fontFamily: 'Montserrat-SemiBold',
        color: '#222222',
        marginBottom: 8,
    },
    filterDropdown: {
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },
    filterDropdownContainer: {
        borderColor: '#e0e0e0',
        backgroundColor: '#ffffff',
    },
    resultCount: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: '#666666',
        marginTop: 8,
        textAlign: 'center',
    },
    relevanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    relevanceText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#BE4145',
        backgroundColor: '#fff5f3',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#BE4145',
    },
    relevantIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    relevantText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: '#FFD700',
        fontWeight: 'bold',
    },
    headerContainer: {
        marginBottom: 16,
    },
    header: {
        fontSize: 24,
        fontFamily: 'Montserrat-Bold',
        color: '#222222',
    },
    loader: {
        marginTop: 40,
    },
    error: {
        textAlign: 'center',
        color: '#BE4145',
        fontSize: 14, // 16 to 14 for consistency
        marginTop: 20,
        fontFamily: 'Inter-Regular',
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
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
        fontSize: 14, // 16 to 14 for consistency
        fontFamily: 'Inter-Regular',
        color: '#666666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 21, // 24 to 21 for better readability
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
        fontSize: 14, //16 to 14
        fontFamily: 'Montserrat-SemiBold',
    },
    noApplicants: {
        textAlign: 'center',
        fontSize: 18, // 20 to 18
        color: '#666666',
        marginTop: 40,
        fontFamily: 'Montserrat-SemiBold',
    },
    jobCard: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 24, // from 20 to 24 for consistency
        borderRadius: 12,
        marginVertical: 8,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        position: 'relative',
    },
    leftSection: {
        flex: 1,
        paddingRight: 60,
    },
    rightSection: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    companyLogo: {
        width: 62,
        height: 62,
        resizeMode: 'contain',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: "#BE4145"
    },
    placeholderLogo: {
        width: 62,
        height: 62,
        backgroundColor: '#fff5f3',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 31,
    },
    logoText: {
        fontSize: 14,
        color: '#666666',
        fontFamily: 'Inter-Regular',
    },
    jobTitle: {
        fontSize: 18, // 20 to 18 for consistency
        fontFamily: 'Montserrat-SemiBold',
        color: '#222222',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14, // 16 to 14 for consistency
        fontFamily: 'Inter-Regular',
        color: '#666666',
        marginBottom: 16,
    },
    attributesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    attributeTag: {
        backgroundColor: '#fff5f3',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    attributeText: {
        fontSize: 12,
        color: '#444444',
        fontFamily: 'Inter-Regular',
    },
    viewDetailsButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'transparent',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewDetailsText: {
        color: '#BE4145',
        fontSize: 14,
        fontFamily: 'Montserrat-SemiBold',
        marginRight: 8,
        textDecorationLine: 'underline',
    },
    arrowIcon: {
        marginLeft: 4,
    },
    // Redesigned card styles
    jobCardRedesigned: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        position: 'relative',
        minHeight: 120,
        justifyContent: 'flex-start',
    },
    initialsCircle: {
        position: 'absolute',
        top: 18,
        right: 18,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#d3d3d3',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    initialsText: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,// from 20 to 18 for consistency
        color: '#666',
    },
    candidateName: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18,
        color: '#222',
        marginBottom: 2,
        marginTop: 2,
    },
    candidateRole: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        textTransform: 'capitalize',
    },
    attributesContainerRedesigned: {
        flexDirection: "row",
        // flexWrap: "wrap",
        alignItems: "center",
        gap: 4,
        width: "100%",
        marginTop: 4,
        marginBottom: 8, // 12 -> 8
        marginLeft: -4, // aligns with job title

    },

    attributeTagRedesigned: {
        backgroundColor: "#f5f5f5",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 4,
        marginBottom: 6,
        // marginLeft: 4,
    },

    attributeTextRedesigned: {
        fontSize: 12,
        color: '#444',
        fontFamily: 'Inter-Regular',
        textTransform: 'capitalize',
        marginLeft: 6,
    },
    buttomRow: {
        flexDirection: "row",      // arrange horizontally
        justifyContent: "space-between", // push Pending left, View Details right
        alignItems: "center",      // vertical alignment
        marginTop: 10,

    },

    statusButton: {
        minHeight: 28,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        // marginLeft: 8,
    },

    statusText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        textTransform: 'capitalize',
    },

    viewDetailsButtonRedesigned: {
        alignSelf: 'flex-end',
        backgroundColor: 'transparent',
        marginTop: 0,
        marginBottom: 0,
    },
    buttonContentRedesigned: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewDetailsTextRedesigned: {
        color: '#45a6be',
        fontSize: 14,
        fontFamily: 'Montserrat-SemiBold',
        marginRight: 6,
        textDecorationLine: 'underline',
    },
    // Filter row redesign
    filterRowRedesigned: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 24,
        width: '100%',
    },
    headerRedesigned: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 20,
        color: '#222',
        marginTop: 8,
    },
    filterDropdownWrapperRedesigned: {
        // minWidth: 140,
        minWidth: '100%',
        marginTop: -8,
        alignItems: 'flex-end',
    },
    filterDropdownRedesigned: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        height: 40,
        paddingHorizontal: 16,
        minWidth: 200,
        justifyContent: 'center',
    },
    filterDropdownContainerRedesigned: {
        borderColor: '#e0e0e0',
        borderRadius: 8,
        backgroundColor: '#fff',
        zIndex: 1000,
    },
    filterDropdownTextRedesigned: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#333',
        marginRight: 4,
    },
    filterDropdownPlaceholderRedesigned: {
        color: '#999',
        fontFamily: 'Inter-Regular',
        fontSize: 14,
    },

    // AI screening styles 

    aiScreeningButton: {
        // backgroundColor: '#rgba(233, 255, 234, 1)',
        backgroundColor: '#ffd2d2ff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        // Border
        borderWidth: 1,
        borderColor: '#BE4145',

        // Shadow (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,

        // Shadow (Android)
        elevation: 4,
    },

    aiScreeningButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6, // adds space between text and arrow (React Native 0.71+)
    },

    aiScreeningButtonText: {
        color: '#BE4145',
        fontSize: 14,
        fontWeight: '600',
    },
    aiScreeningButtonActive: {
        backgroundColor: '#E8F5E9', // lighter/redder shade to indicate disabled
        borderColor: '#C8E6C9',     // softer border color
        shadowOpacity: 0,           // remove shadow for disabled
        elevation: 0,               // remove elevation for Android
    },

    // Disabled text style
    aiScreeningButtonTextActive: {
        color: '#4CAF50',           // lighter/redder text
        fontWeight: '600',
    },

    stickyAiScreeningButton: {
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // dimmed background
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,

        // Shadow (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,

        // Shadow (Android)
        elevation: 5,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
        color: "#222",
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
    },
    questionContainer: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    questionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    questionNumber: { fontSize: 14, fontWeight: "500", color: "#333" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        fontSize: 14,
        color: "#333",
    },
    answerContainer: { marginBottom: 6 },
    answerLabel: { fontSize: 13, color: "#444", marginBottom: 4 },
    answerButtons: { flexDirection: "row", gap: 8 },
    answerButton: {
        flex: 1,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        alignItems: "center",
    },
    selectedAnswerButton: {
        backgroundColor: "#FCF0F0",
        borderColor: "#BE4145",
    },
    answerButtonText: { fontSize: 14, color: "#444" },
    selectedAnswerText: { color: "#BE4145", fontWeight: "600" },
    addQuestionButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
        marginBottom: 12,
    },
    addQuestionText: { marginLeft: 6, color: "#BE4145", fontSize: 14 },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 10,
        gap: 12,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    cancelButtonText: { color: "#333" },
    submitButton: {
        backgroundColor: "#BE4145",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    submitButtonText: { color: "#fff", fontWeight: "600" },
});

