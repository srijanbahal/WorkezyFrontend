import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Button } from 'react-native-paper';
import { applyJob, checkEducation, getJobQuestions, submitQuestionResponses, getProfileDetails } from '../utils/api';
import CustomAlert from '../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../component/BottomNav';

const JobDetailsScreen = ({ route, navigation }) => {
  const { job } = route.params;


  const [userId, setUserId] = useState(null);
  const [userEducation, setUserEducation] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState({});
  const [jobQuestions, setJobQuestions] = useState([]);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    message: '',
    type: 'info',
    title: '',
    showCancel: false,
    onConfirm: null

  });

  const showAlert = (message, type = 'info', title = '', showCancel = false, onConfirm = null) => {
    setAlertConfig({
      visible: true,
      message,
      type,
      title,
      showCancel,

    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) {
          const parsedUser = JSON.parse(userDetails);
          setUserId(parsedUser.id);
          setUserEducation(parsedUser.education);
          console.log("My Details", parsedUser);

          // Fetch user profile for scoring
          try {
            const profileResponse = await getProfileDetails(parsedUser.id, 'job_seeker');
            console.log("Profile Response", profileResponse.data.user);
            if (profileResponse?.data) {
              setUserProfile(profileResponse.data.user);
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserId();
  }, []);

  // Calculate relevant candidate score
  const calculateRelevantScore = () => {
    if (!userProfile || !job) return { relevant_candidate: false, relevant_score: 0 };

    let score = 0;
    let totalFactors = 0;

    // Check category match first
    const jobCategory = job.category || job.job_category;
    const userCategory = userProfile.role || userProfile.role;

    if (jobCategory && userCategory && jobCategory.toLowerCase() !== userCategory.toLowerCase()) {
      return { relevant_candidate: false, relevant_score: 0 };
    }

    // Factor 1: Gender match (1 point)
    if (job.preferred_gender) {
      totalFactors++;
      const userGender = userProfile.gender || userProfile.sex;
      if (userGender && job.preferred_gender.toLowerCase() === userGender.toLowerCase()) {
        score++;
      }
    }

    // Factor 2: Age requirement (1 point)
    if (job.min_age) {
      totalFactors++;
      const userAge = calculateAgeFromDOB(userProfile.dob) || userProfile.age;
      if (userAge && userAge >= job.min_age) {
        score++;
      }
    }

    // Factor 3: Education requirement (1 point)
    if (job.min_education) {
      totalFactors++;
      const userEducation = userProfile.highest_education || userProfile.education;
      if (userEducation && meetsEducationRequirement(userEducation, job.min_education)) {
        score++;
      }
    }

    // Factor 4-6: Question answers (0-3 points)
    if (jobQuestions.length > 0) {
      const questionScore = calculateQuestionScore();
      score += questionScore;
      totalFactors += jobQuestions.length;
    }

    // Determine if candidate is relevant
    // If we have n factors, candidate should score n or n-1 to be preferred
    const relevant_candidate = totalFactors > 0 && (score >= totalFactors - 1);

    return { relevant_candidate, relevant_score: score };
  };

  // Calculate age from date of birth
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if user education meets job requirement
  const meetsEducationRequirement = (userEducation, jobEducation) => {
    const educationLevels = {
      '10th': 1,
      '12th': 2,
      'UG': 3,
      'PG': 4,
      'PhD': 5
    };

    const userLevel = educationLevels[userEducation] || 0;
    const jobLevel = educationLevels[jobEducation] || 0;

    return userLevel >= jobLevel;
  };

  // Calculate score based on question answers
  const calculateQuestionScore = () => {
    let score = 0;
    jobQuestions.forEach(question => {
      const candidateAnswer = questionAnswers[question.id];
      const idealAnswer = question.ideal_answer;

      // Compare candidate answer with ideal answer
      if (candidateAnswer && idealAnswer &&
        candidateAnswer.toLowerCase() === idealAnswer.toLowerCase()) {
        score++;
      }
    });
    return score;
  };

  // Fetch job questions when component mounts
  useEffect(() => {
    const fetchJobQuestions = async () => {
      try {
        const response = await getJobQuestions(job.id);
        console.log("Job Questions", response.data);
        if (response?.data?.questions) {
          setJobQuestions(response.data.questions);
        }
      } catch (error) {
        console.error("Error fetching job questions:", error);
      }
    };
    fetchJobQuestions();
  }, [job.id]);

  const submitJobApplication = async () => {
    try {
      // Calculate relevant score
      const { relevant_candidate, relevant_score } = calculateRelevantScore();

      // First submit the job application with new parameters
      const applicationResponse = await applyJob({
        jobId: job.id,
        jobSeekerId: userId,
        status: 'applied',
        relevant_candidate: relevant_candidate ? 'yes' : 'no',
        relevant_score
      });

      if (applicationResponse?.data?.success) {
        // If there are questions and answers, submit them
        if (jobQuestions.length > 0 && Object.keys(questionAnswers).length > 0) {
          const applicationId = applicationResponse.data.applicationId;

          // Format responses according to the backend schema
          const responses = jobQuestions.map(question => ({
            questionId: parseInt(question.id),
            answer: questionAnswers[question.id].toLowerCase() // Ensure lowercase yes/no
          }));

          try {
            // Submit question responses
            const questionResponse = await submitQuestionResponses({
              applicationId: parseInt(applicationId),
              responses
            });

            if (!questionResponse.data.success) {
              showAlert('Error', questionResponse.data.message || 'Failed to submit question responses');
              return;
            }

            // Log submission stats if available
            if (questionResponse.data.stats) {
              console.log('Question response stats:', questionResponse.data.stats);

              // If there are any failed submissions, show a warning
              if (questionResponse.data.stats.failed > 0) {
                showAlert(
                  'Warning',
                  `Application submitted but ${questionResponse.data.stats.failed} question response(s) failed to save.`,
                  'warning'
                );
                return;
              }
            }
          } catch (error) {
            console.error('Error submitting question responses:', error);
            showAlert('Error', error.response?.data?.message || 'Failed to submit question responses');
            return;
          }
        }

        showAlert('Application submitted successfully!', 'success');

        setTimeout(() => {
          navigation.navigate('JobList');
        }, 1000);
      } else {
        showAlert('Error', applicationResponse?.data?.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      showAlert('Error', error.response?.data?.message || 'Something went wrong while submitting your application');
    }
  };

  const handleApplyJob = async () => {
    if (!userId) {
      showAlert('Error', 'Please log in to apply for jobs');
      return;
    }

    // Check education before allowing to apply
    try {
      const response = await checkEducation(userId);
      if (response?.data?.hasEducation) {
        // If there are screening questions, show the modal
        if (jobQuestions.length > 0) {
          setShowQuestionsModal(true);
        } else {
          // If no questions, proceed with application
          submitJobApplication();
        }
      } else {
        // Redirect to JobSeekerDetails if education is not filled, pass fromJobApply param
        navigation.navigate('JobSeekerDetails', { userId, fromJobApply: true });
      }
    } catch (error) {
      // On error, redirect to JobSeekerDetails as a fallback, pass fromJobApply param
      navigation.navigate('JobSeekerDetails', { userId, fromJobApply: true });
    }
  };

  const handleQuestionSubmit = () => {
    // Validate that all questions are answered
    const unansweredQuestions = jobQuestions.filter(
      question => !questionAnswers.hasOwnProperty(question.id)
    );

    if (unansweredQuestions.length > 0) {
      showAlert('Error', 'Please answer all questions before proceeding');
      return;
    }

    setShowQuestionsModal(false);
    submitJobApplication();
  };

  const handleAnswerSelect = (questionId, answer) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Add useLayoutEffect for navigation options
  // React.useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerLeft: () => (
  //       <TouchableOpacity 
  //         onPress={() => navigation.goBack()}
  //         style={{ marginLeft: 16 }}
  //       >
  //         <Ionicons name="arrow-back" size={24} color="#222222" />
  //       </TouchableOpacity>
  //     ),
  //     headerTitle: " Job Details",
  //     headerStyle: {
  //       // backgroundColor: '#faf7f2',
  //       elevation: 0, // for Android
  //       shadowOpacity: 0, // for iOS
  //     },
  //   });
  // }, [navigation]);

  // Rest of the component remains the same
  return (
    <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Main Job Card: Company Logo, Job Title, Company Name, Meta, Job Details */}
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            {job.company_logo ? (
              <Image
                source={{ uri: job.company_logo }}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholderLogo}>
                <Text style={styles.logoText}>{item.company?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'QT'}</Text>
              </View>
            )}
            <View style={styles.headerText}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.companyName}>{job.company}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailKey}>Location</Text>
              <Text style={styles.detailValue}>{job.city}, {job.country}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailKey}>Experience</Text>
              <Text style={styles.detailValue}>{job.experience || 'Not specified'}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailKey}>Job Type</Text>
              <Text style={styles.detailValue}>{job.job_type || 'Not specified'}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailKey}>Education </Text>
              <Text style={styles.detailValue}>{job.education || 'Not specified'}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailKey}>Salary</Text>
              <Text style={styles.detailValue}>{job.salary} LPA</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailKey}>Relocation</Text>
              <Text style={styles.detailValue}>{job.relocation ? 'Yes' : 'No'}</Text>
            </View>
          </View>
          {/* Separator */}
          <View style={styles.separator} />
          <Text style={styles.sectionTitle}>Job Details</Text>
          <Text style={styles.sectionBody}>{job.description || 'No specific requirements mentioned.'}</Text>
        </View>

        {/* Company Info Card */}
        <View style={styles.companyCard}>
          <Text style={styles.companySectionTitle}>Company Information</Text>
          <View style={styles.companyHeaderRow}>
            {job.company_logo ? (
              <Image
                source={{ uri: job.company_logo }}
                style={styles.companyInitialLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.companyInitialCircle}>
                <Text style={styles.companyInitialText}>
                  {job.company && job.company[0] ? job.company[0].toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View style={styles.companyHeaderText}>
              <Text style={styles.companyTitle}>{job.company}</Text>
              <Text style={styles.companySubtitle}>{job.company_industry || 'Industry not specified'}</Text>
            </View>
          </View>
          {/* First row: Founded, No. of Employees */}
          <View style={styles.companyMetaRow2}>
            <View style={styles.companyMetaCol2}>
              <Text style={styles.companyMetaLabel2}>Founded</Text>
              <Text style={styles.companyMetaValue2}>{job.company_founded || 'N/A'}</Text>
            </View>
            <View style={styles.companyMetaCol2}>
              <Text style={styles.companyMetaLabel2}>No. of Employees</Text>
              <Text style={styles.companyMetaValue2}>{job.company_size || 'N/A'}</Text>
            </View>
          </View>
          {/* Second row: City, Industry */}
          <View style={styles.companyMetaRow2}>
            <View style={styles.companyMetaCol2}>
              <Text style={styles.companyMetaLabel2}>City</Text>
              <Text style={styles.companyMetaValue2}>{job.city || 'N/A'}</Text>
            </View>

          </View>
          <Text style={styles.companyDescription2}>{job.company_description || 'No company description available.'}</Text>
        </View>

        {/* Questions Modal */}
        <Modal
          visible={showQuestionsModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Screening Questions</Text>
              <Text style={styles.modalSubtitle}>Please answer the following questions:</Text>

              <ScrollView style={styles.questionsContainer}>
                {jobQuestions.map((q, index) => (
                  <View key={q.id} style={styles.questionContainer}>
                    <Text style={styles.questionText}>{q.question_text}</Text>
                    <View style={styles.answerContainer}>
                      <TouchableOpacity
                        style={[
                          styles.answerButton,
                          questionAnswers[q.id] === 'yes' && styles.selectedAnswer
                        ]}
                        onPress={() => handleAnswerSelect(q.id, 'yes')}
                      >
                        <Text style={[
                          styles.answerText,
                          questionAnswers[q.id] === 'yes' && styles.selectedAnswerText
                        ]}>Yes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.answerButton,
                          questionAnswers[q.id] === 'no' && styles.selectedAnswer
                        ]}
                        onPress={() => handleAnswerSelect(q.id, 'no')}
                      >
                        <Text style={[
                          styles.answerText,
                          questionAnswers[q.id] === 'no' && styles.selectedAnswerText
                        ]}>No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowQuestionsModal(false);
                    setQuestionAnswers({});
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    Object.keys(questionAnswers).length !== jobQuestions.length && styles.submitButtonDisabled
                  ]}
                  onPress={handleQuestionSubmit}
                  disabled={Object.keys(questionAnswers).length !== jobQuestions.length}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
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
          onConfirm={alertConfig.onConfirm ? () => {
            hideAlert();
            alertConfig.onConfirm();
          } : hideAlert}
          showCancel={alertConfig.showCancel}
        />
      </ScrollView>
      {/* Sticky Apply/Status Button */}
      <View style={styles.stickyButtonContainer}>
        {job.status ? (
          <Button
            style={[
              styles.applyButton,
              job.status === 'Interested' ? styles.statusInterested :
                job.status === 'Applied' || job.status == 'applied' ? styles.statusApplied :
                  job.status === 'Rejected' ? styles.statusRejected :
                    job.status === 'Expired' ? styles.statusExpired :
                      styles.statusDefault
            ]}
            disabled={job.status === 'Applied' || job.status === 'Interested' || job.status === 'Rejected' || job.status === 'Expired'}
          >
            <Text style={[
              styles.statusText,
              job.status === 'Interested' ? styles.statusTextInterested :
                job.status === 'Applied' || job.status == "applied" ? styles.statusTextApplied :
                  job.status === 'Rejected' ? styles.statusTextRejected :
                    job.status === 'Expired' ? styles.statusTextExpired :
                      styles.statusTextDefault
            ]}>{job.status || "Applied"}</Text>
          </Button>
        ) : (
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyJob}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f4f2ee',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  placeholderLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Inter-Regular',
  },
  headerText: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,

  },
  companyName: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Regular',
    marginBottom: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: 'transparent',
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 24,
  },
  detailCol: {
    flex: 1,
    minWidth: 120,
    marginBottom: 8,
  },
  detailKey: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#333333',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#222222',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 8,
    marginTop: 8,
  },
  sectionBody: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#444444',
    marginBottom: 8,
    lineHeight: 22,
  },
  readMore: {
    color: '#45a6be',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  applyButton: {
    backgroundColor: '#be4145',
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 0,
    minHeight: 44,
    width: '100%',
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
  companyCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: 'transparent',
  },
  companySectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
    marginTop: 8,
  },
  companyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  companyInitialLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  companyInitialCircle: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#fff5f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    marginRight: 12,
  },
  companyInitialText: {
    fontSize: 16,
    color: '#be4145',
    fontFamily: 'Montserrat-SemiBold',
  },
  companyHeaderText: {
    flex: 1,
  },
  companyTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#222222',
    marginBottom: 2,
  },
  companySubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  companyMetaRow2: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
  },
  companyMetaCol2: {
    flex: 1,
    minWidth: 80,
    marginBottom: 16,
  },
  companyMetaLabel2: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 2,
  },
  companyMetaValue2: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#222222',
  },
  companyDescription2: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#444444',
    lineHeight: 22,
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 1,
    opacity: 1,
  },
  statusInterested: {
    backgroundColor: 'rgba(232, 245, 233, 1)',
    borderColor: 'rgba(46, 125, 50, 1)',
    borderWidth: 1,
    opacity: 0.85,
  },
  statusApplied: {
    backgroundColor: 'rgba(255, 248, 225, 1)',
    borderColor: 'rgba(245, 124, 0, 1)',
    borderWidth: 1,
    opacity: 0.85,
    color: 'rgba(245, 124, 0, 1)',
  },
  statusRejected: {
    backgroundColor: 'rgba(255, 235, 238, 1)',
    borderColor: 'rgba(190, 65, 69, 1)',
    borderWidth: 1,
    opacity: 0.85,
  },
  statusExpired: {
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
    borderWidth: 1,
    opacity: 0.85,
  },
  statusDefault: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center'
  },
  statusTextInterested: {
    color: 'rgba(46, 125, 50, 1)',
  },
  statusTextApplied: {
    color: 'rgba(245, 124, 0, 1)',
  },
  statusTextRejected: {
    color: 'rgba(190, 65, 69, 1)',
  },
  statusTextExpired: {
    color: '#666666',
  },
  statusTextDefault: {
    color: '#666666',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#222222',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 24,
  },
  questionsContainer: {
    maxHeight: '80%',
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#222222',
    marginBottom: 12,
  },
  answerContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectedAnswer: {
    backgroundColor: '#FCF0F0',
    borderColor: '#BE4145',
  },
  answerText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#444444',
  },
  selectedAnswerText: {
    color: '#BE4145',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#666666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#BE4145',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#ffffff',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
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

export default JobDetailsScreen;