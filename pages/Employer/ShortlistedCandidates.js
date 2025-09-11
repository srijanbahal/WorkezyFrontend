import React, { useEffect, useState, useCallback, use } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useIsFocused, useRoute } from "@react-navigation/native";
// import { getScreeningStatuses } from ; // adjust import if needed
import { getScreeningStatuses, getApplicants, getShortlistedCandidates } from "../../utils/api"; // adjust import if needed

const ShortlistedCandidates = () => {
    const route = useRoute();
    const isFocused = useIsFocused();

    // ✅ Safely extract jobId from route params
    const jobId = route?.params?.jobId;
    const screeningId = route?.params?.screeningId;
    // console.log("🔑 ShortlistedCandidates Mounted - jobId from route:", jobId);

    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [filterValue, setFilterValue] = useState("all");

    const [openFilter, setOpenFilter] = useState(false);
    const [filterItems, setFilterItems] = useState([
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
    ]);
    const [applicants, setApplicants] = useState([]);
    // const [screeningId, setScreeningId] = useState(null);

    // const fetchStatuses = useCallback(async () => {
    //     if (!jobId) {
    //         console.warn("⚠️ jobId is missing. Cannot fetch shortlisted candidates.");
    //         return;
    //     }

    //     console.log(`📡 Fetching screening statuses for jobId: ${jobId}`);
    //     try {
    //         setLoading(true);

    //         const res = await getScreeningStatuses(jobId); // ✅ Axios response
    //         console.log("✅ Raw Axios Response:", res);

    //         const data = res?.data;
    //         console.log("✅ Parsed Data:", data);

    //         if (data?.success && Array.isArray(data.candidates)) {
    //             setCandidates(data.candidates);
    //             filterCandidates(data.candidates, filterValue);
    //         } else {
    //             console.warn("⚠️ No candidates returned for this job.");
    //             setCandidates([]);
    //             setFilteredCandidates([]);
    //         }
    //     } catch (error) {
    //         console.error("❌ Failed to fetch shortlisted candidates:", error);
    //         setCandidates([]);
    //         setFilteredCandidates([]);
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [jobId, filterValue]);


    // useEffect(() => {
    //     const fetchData = async () => {
    //         console.log("Fetching screening statuses for jobId:", job.id);
    //         try {
    //             const res = await getScreeningStatuses(job.id);
    //             console.log("Screening statuses fetched:", res.data);

    //             const fetchedScreeningId = res.data.screening.screening_id;
    //             if (!fetchedScreeningId) {
    //                 console.warn("⚠️ screeningId is missing. Cannot fetch shortlisted candidates.");
    //                 return;
    //             }

    //             setScreeningId(fetchedScreeningId); // optional, if you want state

    //             // setLoading(true);
    //             console.log(`📡 Fetching shortlisted candidates for screeningId: ${fetchedScreeningId}`);
    //             const candidatesRes = await getShortlistedCandidates(fetchedScreeningId);
    //             console.log("✅ Shortlisted Candidates:", candidatesRes.data);
    //             // Update state if you want:
    //             setCandidates(candidatesRes.data);
    //             setFilteredCandidates(candidatesRes.data);
    //         } catch (error) {
    //             console.error("❌ Error:", error);
    //             setCandidates([]);
    //             setFilteredCandidates([]);
    //         } finally {
    //             // setLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, [jobId]); // only depend on job.id

    useEffect(() => {
        const fetchData = async () => {
            console.log("🔄 useEffect triggered for jobId:", jobId);
            setLoading(true); // ✅ start loading
            // console.log("Fetching screening statuses for jobId:", jobId);
            try {
                console.log(`📡 Fetching shortlisted candidates for screeningId: ${screeningId}`);
                const candidatesRes = await getShortlistedCandidates(screeningId);
                console.log("✅ Shortlisted Candidates:", candidatesRes.data);

                setCandidates(candidatesRes.data);
                setFilteredCandidates(candidatesRes.data);
            }
            catch (error) {
                console.error("❌ Error fetching data:", error);
                // console.error("Full error details:",error.message || error);
                console.log("Error details:", error.response?.data || error.message);
                setCandidates([]);
                setFilteredCandidates([]);
            }
            finally {
                setLoading(false); // ✅ stop loading   
            }
        };

        fetchData();
    }, [jobId]); // use only job.id to avoid infinite loops


    // // For fetching Applicants
    // useEffect(() => {
    //     const fetchApplicants = async () => {
    //         try {
    //             const response = await getApplicants(jobId);
    //             const applications = response.data.applications || [];

    //             // Sort by relevant_score in descending order by default
    //             const sortedApplications = applications.sort((a, b) => {
    //                 const scoreA = a.relavant_score || 0;
    //                 const scoreB = b.relavant_score || 0;
    //                 return scoreB - scoreA;
    //             });
    //             console.log("Sorted Applications:", sortedApplications);

    //             setApplicants(sortedApplications);
    //             setFilteredApplicants(sortedApplications);
    //         } catch (err) {
    //             setError('Failed to fetch applicants. Please try again.');
    //             console.error('API Fetch Error:', err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchApplicants();
    // }, [jobId]);


    const filterCandidates = (allCandidates, filter) => {
        console.log(`🎯 Filtering candidates with filter: ${filter}`);
        if (filter === "all") {
            setFilteredCandidates(allCandidates);
        } else {
            const filtered = allCandidates.filter(
                (c) => c.status?.toLowerCase() === filter
            );
            console.log("✅ Filtered Candidates:", filtered);
            setFilteredCandidates(filtered);
        }
    };

    // useEffect(() => {
    //     if (isFocused) {
    //         console.log("👀 Screen focused, triggering fetch...");
    //         fetchData();
    //     }
    // }, [isFocused]);

    useEffect(() => {
        console.log("🔄 Filter value changed:", filterValue);
        filterCandidates(candidates, filterValue);
    }, [filterValue]);

    return (
        <View style={styles.container}>
            {/* Filter Dropdown */}
            <DropDownPicker
                open={openFilter}
                value={filterValue}
                items={filterItems}
                setOpen={setOpenFilter}
                setValue={setFilterValue}
                setItems={setFilterItems}
                containerStyle={{ marginBottom: 12 }}
            />

            {/* Loading State */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading shortlisted candidates...</Text>
                </View>
            ) : filteredCandidates.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No shortlisted candidates found</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {filteredCandidates.map((candidate) => (
                        <View style={styles.card} key={candidate.id}>
                            <Text style={styles.name}>{candidate.name}</Text>
                            <Text style={styles.email}>{candidate.email}</Text>
                            {candidate.score !== undefined && (
                                <Text style={styles.score}>Score: {candidate.score}</Text>
                            )}
                            <Text
                                style={[
                                    styles.status,
                                    candidate.status === "pending"
                                        ? styles.pending
                                        : styles.completed,
                                ]}
                            >
                                {candidate.status === "pending" ? "Pending" : "Completed"}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
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
    name: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: "#555",
        marginBottom: 6,
    },
    score: {
        fontSize: 14,
        color: "#388E3C",
        marginBottom: 6,
    },
    status: {
        fontSize: 14,
        fontWeight: "bold",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    pending: {
        backgroundColor: "#FFF3E0",
        color: "#E65100",
    },
    completed: {
        backgroundColor: "#E8F5E9",
        color: "#2E7D32",
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
});
