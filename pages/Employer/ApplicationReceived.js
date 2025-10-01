import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getApplicants, addScreeningQuestions, addCandidatesToScreening, getScreeningStatuses, createScreening, evaluateCandidate } from '../../utils/api';
// import { Modal } from 'react-native-paper';
import CustomAlert from '../../components/CustomAlert';
import LeftNav from "../../component/LeftNav";


const { width } = Dimensions.get('window');


const ApplicationReceived = ({ route, navigation }) => {
  const { job } = route.params;
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('all');
  const [filterItems] = useState([
    { label: 'All Applications', value: 'all' },
    { label: 'Relevant Candidates', value: 'relevant' },
    // { label: 'Latest Applications', value: 'latest' },
  ]);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [questions, setQuestions] = useState([{ question: "", correctAnswer: "" }]);
  const inputRefs = useRef({});
  const [status, setStatus] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [screeningStarted, setScreeningStarted] = useState(false);
  const [screeningId, setScreeningId] = useState(null);
  const [screeningStatusMap, setScreeningStatusMap] = useState({});
  // Alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    message: '',
    type: 'info',
    title: '',
  });


  // For fetching Applicants
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const response = await getApplicants(job.id);
        const applications = response.data.applications || [];

        // Sort by relevant_score in descending order by default
        const sortedApplications = applications.sort((a, b) => {
          const scoreA = a.relavant_score || 0;
          const scoreB = b.relavant_score || 0;
          return scoreB - scoreA;
        });

        setApplicants(sortedApplications);
        setFilteredApplicants(sortedApplications);
      } catch (err) {
        setError('Failed to fetch applicants. Please try again.');
        console.error('API Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [job.id]);

  // Apply filters when filter value changes
  useEffect(() => {
    let filtered = [...applicants];

    switch (filterValue) {
      case 'relevant':
        // Filter for relevant candidates (relevant_candidate === 'yes')
        filtered = applicants.filter(applicant =>
          applicant.relavant_candidate === 'yes'
        );

        break;
      case 'latest':
        // Sort by application date (assuming there's a created_at or applied_at field)
        // If no date field, keep original order
        filtered = [...applicants].sort((a, b) => {
          const dateA = new Date(a.created_at || a.applied_at || 0);
          const dateB = new Date(b.created_at || b.applied_at || 0);
          return dateB - dateA;
        });
        break;
      case 'all':
      default:
        // Show all applications sorted by relevant_score
        filtered = [...applicants].sort((a, b) => {
          const scoreA = a.relavant_score || 0;
          const scoreB = b.relavant_score || 0;
          return scoreB - scoreA;
        });
        break;
    }

    setFilteredApplicants(filtered);
  }, [filterValue, applicants]);


  // useEffect(() => {
  //   const fetchStatuses = async () => {
  //     console.log("Fetching screening statuses for jobId:", job.id);
  //     try {
  //       const res = await getScreeningStatuses(job.id);
  //       console.log("Screening statuses fetched:", res.data);

  //       // ✅ Screening exists
  //       const map = {};
  //       res.data.candidates.forEach((c) => {
  //         map[c.candidate_id] = c.status;
  //         // console.log(`Mapping candidate ${c.candidate_id} to status ${c.status}`);
  //       });

  //       console.log("screening_id:", res.data.screening.screening_id);
  //       setScreeningId(res.data.screening.screening_id);

  //       console.log("Status Map:", map);
  //       setStatusMap(map);

  //       setScreeningStarted(true);
  //     } catch (err) {
  //       if (err.response?.data?.message === "No screening exists for this job") {
  //         // ❌ No screening exists → mark as not started
  //         console.log("No screening found for this job.");
  //         setScreeningStarted(false);
  //         setStatusMap({});
  //       } else {
  //         console.error("Error fetching statuses:", err);
  //         console.log("Error details:", err.response?.data || err.message);
  //       }
  //     }
  //   };

  //   console.log(
  //     "useEffect triggered with filterValue:",
  //     filterValue,
  //     "jobId:",
  //     job.id
  //   );

  //   if (filterValue === "relevant") {
  //     fetchStatuses();
  //   }
  // }, [filterValue, job.id, screeningStarted]);


  useEffect(() => {
    const assignAndFetch = async () => {
      try {
        console.log("Assign & Fetch triggered");

        // ✅ Step 1: Assign relevant candidates
        const relevantCandidateIds = filteredApplicants.map((c) => c.id);
        if (relevantCandidateIds.length === 0) {
          showAlert("No relevant candidates found for AI Screening.", "info");
          return;
        }

        console.log("Assigning candidates to screening:", relevantCandidateIds);
        await addCandidatesToScreening(job.id, relevantCandidateIds);
        console.log("Candidates successfully assigned to screening");

        // ✅ Step 2: Fetch statuses (your existing logic)
        console.log("Fetching screening statuses for jobId:", job.id);
        const res = await getScreeningStatuses(job.id);
        console.log("Screening statuses fetched:", res.data);

        const map = {};
        res.data.candidates.forEach((c) => {
          map[c.candidate_id] = c.status;
        });

        console.log("screening_id:", res.data.screening.screening_id);
        setScreeningId(res.data.screening.screening_id);
        console.log("Status Map:", map);
        setStatusMap(map);
        // setScreeningStarted(true);
      } catch (err) {
        if (err.response?.data?.message === "No screening exists for this job") {
          console.log("No screening found for this job.");
          // setScreeningStarted(false);
          setStatusMap({});
        } else {
          console.error("Error during assign & fetch:", err);
          console.log("Error details:", err.response?.data || err.message);
        }
      }
    };

    if (filterValue === "relevant") {
      assignAndFetch();
    }
  }, [filterValue, job.id, filteredApplicants]);


  console.log("Render: screeningId =", screeningId, "filterValue =", filterValue);


  // --- Functions ---

  // Helper function to show alert (always provide type)
  const showAlert = (message, type) => {
    setAlertConfig({
      visible: true,
      // title,
      message,
      type,
    });
    setTimeout(() => hideAlert(), 1000);
  };

  // Helper function to hide alert
  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const addQuestion = () => {
    if (questions.length < 3) {
      setQuestions([...questions, { question: "", correctAnswer: "" }]);
    }
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    // 1️⃣ Validate employer entered all questions
    const incomplete = questions.some(
      (q) => !q.question.trim() || !q.correctAnswer
    );

    if (incomplete) {
      alert("Please complete all questions before submitting");
      return;
    }

    try {
      // 2️⃣ Save Screening Questions for this Job
      await addScreeningQuestions(job.id, questions.map((q) => ({
        question_text: q.question,
        ideal_answer: q.correctAnswer
      })));

      // 3️⃣ Assign all relevant candidates to this Screening
      const relevantCandidateIds = filteredApplicants.map((c) => c.id);

      if (relevantCandidateIds.length === 0) {
        // No relevant candidates found
        showAlert("No relevant candidates found for AI Screening.", "info");
        return; // exit the function early
      }

      await addCandidatesToScreening(job.id, relevantCandidateIds);

      // 4️⃣ Success UI feedback
      // alert("Screening started successfully!");
      setQuestionModalVisible(false);
      setScreeningStarted(true);
      showAlert("AI Screening started successfully!", "success");
    } catch (err) {
      console.error("Error starting screening:", err);
      console.log("Error details:", err.response?.data || err.message);
      alert(err.message || "Something went wrong while starting screening.");
    }
  };

  const createScreeningOnPress = async (jobId) => {
    try {

      // 3️⃣ Assign all relevant candidates to this Screening
      const relevantCandidateIds = filteredApplicants.map((c) => c.id);

      if (relevantCandidateIds.length === 0) {
        // No relevant candidates found
        showAlert("No relevant candidates found for AI Screening.", "info");
        return; // exit the function early
      }

      const res = await createScreening(jobId, `Screening for ${job.title}`);
      console.log("Screening created:", res.data);
      // setScreeningStarted(true);
      setQuestionModalVisible(true);
    } catch (err) {
      console.error("Error creating screening:", err);
      console.log("Error details:", err.response?.data || err.message);
      alert(err.message || "Could not create screening. Try again.");
    }
  };

  const evaluateCandidateOnPress = async () => {
    if (!screeningId) {
      createScreeningOnPress(job.id);
      return;
    }

    // Check if this screeningId is already evaluated
    if (screeningStatusMap[screeningId] === 1) {
      console.log("✅ Candidate already evaluated, skipping API call.");
      navigation.navigate("ShortlistedCandidates", { jobId: job.id, screeningId: screeningId });
      return;
    }

    try {
      const response = await evaluateCandidate(screeningId);

      if (response.status === 404) {
        showAlert("No relevant candidates found for AI Screening.", "info");
        return;
      }

      // Mark as evaluated
      setScreeningStatusMap(prev => ({
        ...prev,
        [screeningId]: 1
      }));

      // Navigate to shortlisted candidates
      navigation.navigate("ShortlistedCandidates", { jobId: job.id });
    } catch (error) {
      console.error("Error evaluating candidates:", error);
      console.log("Error details:", error.response?.data || error.message);
      showAlert("Something went wrong while evaluating candidates.", "error");
    }
  };

  const editQuestionsOnPress = () => {
    console.log("Edit Questions button pressed!");
    setQuestionModalVisible(true);
    // You can later navigate to your Edit Questions screen here
    // e.g., navigation.navigate('EditQuestions', { jobId: job.id });
  };



  // Helper function to format role text
  const formatRoleText = (role) => {
    if (!role) return 'Job Seeker';

    // Replace underscores with spaces and capitalize each word
    return role.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get status button color based on status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {

      case 'pending':
        return '#FFF8E1'; // Light Orange background
      case 'completed':
        return '#E8F5E9'; // Gray
      default:
        return '#9E9E9E'; // Default Gray
    }
  };

  // Get status text color based on status
  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FF9800'; // Light Orange background
      case 'completed':
        return '#4CAF50'; // Gray
      default:
        return '#9E9E9E'; // Default Gray
    }
  };

  const renderApplicantItem = ({ item }) => {
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

        {screeningId && filterValue === 'relevant' ? (
          <View style={styles.buttomRow}>
            {/* Status Pill */}
            {/* <View style={styles.buttomRow}> */}
            {/* Status Pill */}
            <View
              style={[
                styles.statusButton,
                { backgroundColor: getStatusColor(statusMap[item.id]) || 'Pending' }
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusTextColor(statusMap[item.id] || 'Pending') }
                ]}
              >
                {statusMap[item.id]}
              </Text>
            </View>


            {/* </View> */}

            {/* View Details Button */}
            <TouchableOpacity
              style={styles.viewDetailsButtonRedesigned}
              onPress={() =>
                navigation.navigate("CandidateDetails", {
                  candidateId: item.id,
                  jobId: job.id,
                })
              }
            >
              <View style={styles.buttonContentRedesigned}>
                <Text style={styles.viewDetailsTextRedesigned}>View Details</Text>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={18}
                  color="#45a6be"
                  style={styles.arrowIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          // Only show View Details button
          <TouchableOpacity
            style={styles.viewDetailsButtonRedesigned}
            onPress={() =>
              navigation.navigate("CandidateDetails", {
                candidateId: item.id,
                jobId: job.id,
              })
            }
          >
            <View style={styles.buttonContentRedesigned}>
              <Text style={styles.viewDetailsTextRedesigned}>View Details</Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={18}
                color="#45a6be"
                style={styles.arrowIcon}
              />
            </View>
          </TouchableOpacity>
        )}



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

  const FilterSection = () => (
    <View style={styles.filterRowRedesigned}>
      {/* <Text style={styles.headerRedesigned}>Candidates</Text> */}
      <View style={styles.filterDropdownWrapperRedesigned}>
        <DropDownPicker
          open={filterOpen}
          value={filterValue}
          items={filterItems}
          setOpen={setFilterOpen}
          setValue={setFilterValue}
          style={styles.filterDropdownRedesigned}
          dropDownContainerStyle={styles.filterDropdownContainerRedesigned}
          textStyle={styles.filterDropdownTextRedesigned}
          placeholderStyle={styles.filterDropdownPlaceholderRedesigned}
          ArrowDownIconComponent={({ style }) => <Ionicons name="chevron-down" size={18} color="#999" style={style} />}
          ArrowUpIconComponent={({ style }) => <Ionicons name="chevron-up" size={18} color="#999" style={style} />}
          placeholder="All Applications"
          zIndex={3000}
          zIndexInverse={1000}
          tickIconStyle={{ tintColor: "#BE4145" }}

        />
      </View>
    </View>
  );

  return (
    <View styles={styles.outerBox}>

      <LeftNav activeuser={"employer"} />

      <View style={styles.innerBox}>

        <View style={styles.container}>
          {/* Filter Section */}
          {!loading && !error && applicants.length > 0 && <FilterSection />}


          {loading ? (
            <ActivityIndicator size="large" color="#BE4145" style={styles.loader} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : applicants.length === 0 ? (
            <EmptyApplicationsState />
          ) : (
            <FlatList
              data={filteredApplicants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderApplicantItem}
              // scrollEnabled={false}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}



          <Modal
            visible={questionModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setQuestionModalVisible(false)}
          >
            {/* Overlay */}
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Card */}
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  padding: 16,
                  width: '90%',
                  maxHeight: '80%',
                  elevation: 6, // Android shadow
                  shadowColor: '#000', // iOS shadow
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                }}
              >
                {/* Close Icon */}
                <TouchableOpacity
                  onPress={() => setQuestionModalVisible(false)}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    height: 32,
                    width: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <Ionicons name="close" size={24} color="#BE4145" />
                </TouchableOpacity>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Title */}
                  <Text
                    style={{
                      fontFamily: 'Montserrat-SemiBold',
                      fontSize: 22,
                      color: '#BE4145',
                      marginBottom: 8,
                    }}
                  >
                    Screening Questions
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter-Regular',
                      fontSize: 14,
                      color: '#666',
                      marginBottom: 16,
                    }}
                  >
                    Add up to 3 questions with Yes/No answers
                  </Text>

                  {/* Questions */}
                  {questions.map((question, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: '#f9f9f9',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 16,
                      }}
                    >
                      {/* Header */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: 'Montserrat-SemiBold',
                            fontSize: 16,
                            color: '#333',
                          }}
                        >
                          Question {index + 1}
                        </Text>
                        {questions.length > 1 && (
                          <TouchableOpacity onPress={() => removeQuestion(index)}>
                            <Ionicons name="close-circle" size={22} color="#BE4145" />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Input */}
                      <TextInput
                        ref={(ref) => (inputRefs.current[`question_${index}`] = ref)}
                        value={question.question}
                        onChangeText={(text) => updateQuestion(index, 'question', text)}
                        placeholder="Enter your question"
                        style={{
                          borderWidth: 1,
                          borderColor: '#ddd',
                          borderRadius: 8,
                          padding: 10,
                          fontFamily: 'Inter-Regular',
                          fontSize: 14,
                          color: '#333',
                          marginBottom: 12,
                        }}
                        placeholderTextColor="#999"
                      />

                      {/* Answer Selector */}
                      <View>
                        <Text
                          style={{
                            fontFamily: 'Inter-SemiBold',
                            fontSize: 14,
                            color: '#333',
                            marginBottom: 6,
                          }}
                        >
                          Expected Answer
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TouchableOpacity
                            style={[
                              {
                                flex: 1,
                                padding: 10,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#ddd',
                                alignItems: 'center',
                              },
                              question.correctAnswer === 'Yes' && {
                                backgroundColor: '#FCF0F0',
                                borderColor: '#BE4145',
                              },
                            ]}
                            onPress={() => updateQuestion(index, 'correctAnswer', 'Yes')}
                          >
                            <Text
                              style={[
                                {
                                  fontFamily: 'Inter-Regular',
                                  fontSize: 14,
                                  color: '#333',
                                },
                                question.correctAnswer === 'Yes' && {
                                  color: '#BE4145',
                                  fontFamily: 'Inter-SemiBold',
                                },
                              ]}
                            >
                              Yes
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              {
                                flex: 1,
                                padding: 10,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#ddd',
                                alignItems: 'center',
                              },
                              question.correctAnswer === 'No' && {
                                backgroundColor: '#FCF0F0',
                                borderColor: '#BE4145',
                              },
                            ]}
                            onPress={() => updateQuestion(index, 'correctAnswer', 'No')}
                          >
                            <Text
                              style={[
                                {
                                  fontFamily: 'Inter-Regular',
                                  fontSize: 14,
                                  color: '#333',
                                },
                                question.correctAnswer === 'No' && {
                                  color: '#BE4145',
                                  fontFamily: 'Inter-SemiBold',
                                },
                              ]}
                            >
                              No
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}

                  {/* Add Question */}
                  {questions.length < 3 && (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 8,
                      }}
                      onPress={addQuestion}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="#BE4145" />
                      <Text
                        style={{
                          marginLeft: 6,
                          fontFamily: 'Inter-Regular',
                          fontSize: 14,
                          color: '#BE4145',
                        }}
                      >
                        Add Another Question
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>

                {/* Actions */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    marginTop: 20,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#ddd',
                      marginRight: 10,
                    }}
                    onPress={() => setQuestionModalVisible(false)}
                  >
                    <Text
                      style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: '#333' }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 8,
                      backgroundColor: '#BE4145',
                    }}
                    onPress={handleSubmit}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 14,
                        color: '#fff',
                      }}
                    >
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <CustomAlert
            visible={alertConfig.visible}
            message={alertConfig.message}
            type={alertConfig.type}
            title={alertConfig.title}
            onClose={hideAlert}
          />
        </View>
        {/* Sticky AI Screening Button */}
        {filterValue === "relevant" && (
          <View style={styles.stickyAiScreeningButton}>
            {screeningId != null ? (
              job.review_status === 'expired' ? (
                // Screening started but job expired → single full-width button
                <TouchableOpacity
                  style={[screeningId != null && styles.aiScreeningButtonActive, { flex: 1, marginLeft: 4, justifyContent: 'center', alignItems: 'center', padding: 8, backgroundColor: '#E8F5E9', borderRadius: 8, borderColor: '#4CAF50', borderWidth: 1 }]}
                  onPress={evaluateCandidateOnPress}
                >
                  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4 }, styles.aiScreeningButtonContent]}>
                    <Text style={[styles.aiScreeningButtonTextActive]}>
                      Shortlisted Candidates
                    </Text>
                    <MaterialIcons name="east" size={18} color="#4CAF50" style={styles.arrowRightIcon} />
                  </View>
                </TouchableOpacity>
              ) : (
                // Screening started and job not expired → dual buttons
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 8 }}>
                  {/* Edit Questions Button */}

                  <TouchableOpacity
                    style={{ flex: 1, marginRight: 4, justifyContent: 'center', alignItems: 'center', padding: 8, backgroundColor: '#E3F2FD', borderRadius: 8, borderColor: '#45a6be', borderWidth: 1 }}
                    onPress={editQuestionsOnPress}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontWeight: 'bold', color: '#45a6be' }}>Edit Questions</Text>
                      <MaterialIcons name="edit" size={18} color="#45a6be" />
                    </View>
                  </TouchableOpacity>

                  {/* Go to Shortlisted Candidates Button */}
                  <TouchableOpacity
                    style={[screeningId != null && styles.aiScreeningButtonActive, { flex: 1, marginLeft: 4, justifyContent: 'center', alignItems: 'center', padding: 8, backgroundColor: '#E8F5E9', borderRadius: 8, borderColor: '#4CAF50', borderWidth: 1 }]}
                    onPress={evaluateCandidateOnPress}
                  >
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 4 }, styles.aiScreeningButtonContent]}>
                      <Text style={[styles.aiScreeningButtonTextActive]}>
                        Shortlisted Candidates
                      </Text>
                      <MaterialIcons name="east" size={18} color="#4CAF50" style={styles.arrowRightIcon} />
                    </View>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <TouchableOpacity
                style={[
                  styles.aiScreeningButton,
                  screeningId != null && styles.aiScreeningButtonActive,
                ]}
                onPress={createScreeningOnPress.bind(this, job.id)}
              >
                <Text style={styles.aiScreeningButtonText}>Start AI Screening</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

    </View>

  );
};



const styles = StyleSheet.create({
  outerBox: {
    flex: 1,
    flexDirection: 'row', // This is the most important style
    backgroundColor: '#f4f2ee',
  },

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f2ee',
    marginTop: 8, // fixed from 10 to 8 for consistency
    paddingBottom: 0, // fixed from 16 to 0 to accommodate sticky button
    // paddingLeft: 150, // This should match the width of your LeftNav.js
    marginHorizontal: 25,
    borderColor: "#e0e0e0",
    borderWidth: 1,
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
    // width: '92%',
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
    width: '92%',

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

  // aiScreeningButtonText: {
  //   color: '#BE4145',
  //   fontSize: 14,
  //   fontWeight: '600',
  // },
  aiScreeningButtonActive: {
    backgroundColor: '#E8F5E9', // lighter/redder shade to indicate disabled
    borderColor: '#C8E6C9',     // softer border color
    shadowOpacity: 0,           // remove shadow for disabled
    elevation: 0,               // remove elevation for Android
  },

  // Button for edit questions and go to shortlisted candidates
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    gap: 8, // space between buttons (React Native 0.71+)
  },

  button: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Disabled text style
  aiScreeningButtonTextActive: {
    color: '#4CAF50',           // lighter/redder text
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8,
    fontSize: 14,
    position: 'relative',
  },

  arrowRightIcon: {
    marginRight: 8, // to adjust spacing when in active state
    marginLeft: -14,
  },

  stickyAiScreeningButton: {
    position: 'relative',
    // bottom: 0,
    paddingTop: 16,
    paddingBottom: 24,
    // left: 0,
    // right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
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


export default ApplicationReceived;