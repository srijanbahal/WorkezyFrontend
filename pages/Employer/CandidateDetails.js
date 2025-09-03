import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  Linking
} from "react-native";
import { Feather, Ionicons, FontAwesome5, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { getCandidateDetails, getUserDetails, sendInterestToCandicate, checkInterestStatus, getJobQuestionResponses } from "../../utils/api"; // Updated to include getJobQuestionResponses

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SPACING = 12;

const UserDetails = ({ route }) => {
  const { candidateId, jobId } = route.params; // Get both candidateId and jobId from route params
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [interested, setInterested] = useState(false);
  const [activeEducationIndex, setActiveEducationIndex] = useState(0);
  const [activeExperienceIndex, setActiveExperienceIndex] = useState(0);
  const educationFlatListRef = useRef(null);
  const experienceFlatListRef = useRef(null);
  const [questionResponses, setQuestionResponses] = useState([]);
  const [questionResponsesLoading, setQuestionResponsesLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    checkIfInterested(); // Check interest status when component loads
    fetchQuestionResponses();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getCandidateDetails(candidateId);
      setUser(response.data.candidate);
    } catch (err) {
      setError("Failed to fetch user details.");
      console.error("Error fetching user details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if already interested when component loads
  const checkIfInterested = async () => {
    try {
      // Make actual API call to check if employer already showed interest
      const response = await checkInterestStatus(jobId, candidateId);

      // If we get data back with isInterested flag, set the state accordingly
      if (response.data && response.data.isInterested) {
        setInterested(true);
        setShowContactInfo(true); // Also show contact info since they've already expressed interest
      }
    } catch (err) {
      console.error("Error checking interest status:", err);
      // Handle error but don't update UI state
    }
  };

  const toggleContactVisibility = () => {
    // If not already interested, send interest and show details in one action
    if (!interested) {
      setShowContactInfo(true);
      sendInterest();
    }
    // If already interested, button should be disabled
  };

  const sendInterest = async () => {
    try {
      // Pass both jobId and candidateId to the API
      const response = await sendInterestToCandicate(jobId, candidateId);

      if (response.status === 200) {
        // If API call was successful, update the state
        setInterested(true);
      } else {
        // If API returns an error status, show an alert
        Alert.alert("Error", "Failed to send interest. Please try again.");
      }
    } catch (err) {
      console.error("Error sending interest:", err);
      Alert.alert("Error", "Failed to send interest. Please try again.");
    }
  };

  // Function to open WhatsApp with candidate's phone number
  const openWhatsApp = () => {
    const phoneNumber = user?.phone || '';
    if (!phoneNumber) {
      Alert.alert("Error", "Phone number not available");
      return;
    }

    // Remove any non-digit characters and ensure it starts with country code
    let cleanPhone = phoneNumber.replace(/\D/g, '');

    // If it doesn't start with country code, assume it's Indian (+91)
    if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const whatsappUrl = `whatsapp://send?phone=${cleanPhone}&text=Hi! I'm interested in your profile for a job opportunity.`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert("Error", "WhatsApp is not installed on your device");
        }
      })
      .catch((err) => {
        console.error("Error opening WhatsApp:", err);
        Alert.alert("Error", "Failed to open WhatsApp");
      });
  };

  // Function to make a phone call
  const makePhoneCall = () => {
    const phoneNumber = user?.phone || '';
    if (!phoneNumber) {
      Alert.alert("Error", "Phone number not available");
      return;
    }

    // Clean the phone number for calling
    let cleanPhone = phoneNumber.replace(/\D/g, '');

    // If it doesn't start with country code, assume it's Indian (+91)
    if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
      cleanPhone = '+91' + cleanPhone;
    }

    const phoneUrl = `tel:${cleanPhone}`;

    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert("Error", "Phone dialer is not available on your device");
        }
      })
      .catch((err) => {
        console.error("Error opening phone dialer:", err);
        Alert.alert("Error", "Failed to open phone dialer");
      });
  };

  // Function to render blurred or clear text
  const renderSecureText = (text, type = 'phone') => {
    // If interested/shown contact info, always show full details
    if (interested || showContactInfo) {
      return <Text style={styles.detailText}>{text}</Text>;
    } else {
      // Show first 3 characters for any text, then blur the rest
      const visiblePart = text.substring(0, 3);
      const hiddenPart = '•'.repeat(text.length - 3);
      return <Text style={styles.blurredText}>{visiblePart}{hiddenPart}</Text>;
    }
  };

  // Function to format date to short month format (e.g., Feb 2025)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If the date string is not in a standard format, try to parse it manually
      const parts = dateString.split(' ');
      if (parts.length >= 2) {
        // If it's already in format like "July 2011", convert to short month
        const monthMap = {
          'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr',
          'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug',
          'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec'
        };

        const month = monthMap[parts[0]] || parts[0];
        return `${month} ${parts[1]}`;
      }
      return dateString; // Return as is if we can't parse it
    }

    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  


  // Handle scroll events to update active index
  const handleEducationScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + SPACING));
    setActiveEducationIndex(index);
  };

  const handleExperienceScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + SPACING));
    setActiveExperienceIndex(index);
  };

  const fetchQuestionResponses = async () => {
    try {
      setQuestionResponsesLoading(true);
      const response = await getJobQuestionResponses(jobId, candidateId);
      console.log("User Response ", response.data)
      if (response.data && Array.isArray(response.data.questions)) {
        setQuestionResponses(response.data.questions);
      } else {
        setQuestionResponses([]);
      }
    } catch (err) {
      setQuestionResponses([]);
      // Optionally log error
    } finally {
      setQuestionResponsesLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#BE4145" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!user) {
    return <Text style={styles.error}>No details found for this user.</Text>;
  }

  // Format education data for carousel
  const formatEducation = () => {
    // Sample education data based on your format
    const educationData = user.education || {
      "10th": {
        "year": "2016",
        "board": "Rbse",
        "percentage": "86"
      },
      "12th": {
        "year": "2018",
        "board": "Rbse",
        "percentage": "50"
      }
    };

    // Convert object to array for FlatList
    const educationItems = Object.keys(educationData).map(key => ({
      id: key,
      type: key,
      year: educationData[key].year,
      board: educationData[key].board,
      percentage: educationData[key].percentage
    }));

    return educationItems;
  };

  // Format experience data for carousel
  const formatExperience = () => {
    // Sample experience data based on your format
    const experienceData = user.experience || [
      {
        "company": "Technology",
        "endDate": "July 2011",
        "jobTitle": "Techsolution",
        "location": "Jaipur",
        "startDate": "August 2003",
        "currentlyWorking": false
      }
    ];

    return experienceData.map((exp, index) => ({
      id: index.toString(),
      company: exp.company,
      endDate: exp.currentlyWorking ? "Present" : exp.endDate,
      jobTitle: exp.jobTitle,
      location: exp.location,
      startDate: exp.startDate
    }));
  };

  // Prepare education and experience data
  const educationItems = formatEducation();
  const experienceItems = formatExperience();

  // Modern Experience Section (no logo)
  const renderExperienceSection = () => (
    <View style={redesignedStyles.sectionCardRedesigned}>
      <Text style={redesignedStyles.sectionTitleRedesigned}>Experience</Text>
      {experienceItems.map((item, idx) => (
        <View key={idx} style={redesignedStyles.expCardRedesigned}>
          <View style={styles.expContent}>
            <Text style={styles.expTitle}>{item.jobTitle}</Text>
            <Text style={styles.expCompany}>{item.company}{item.employmentType ? ` · ${item.employmentType}` : ''}</Text>
            <Text style={styles.expMeta}>{formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}{item.duration ? ` · ${item.duration}` : ''}</Text>
            <Text style={styles.expMeta}>{item.location}{item.workMode ? ` · ${item.workMode}` : ''}</Text>
            {item.note && <Text style={styles.expNote}>{item.note}</Text>}
          </View>
        </View>
      ))}
    </View>
  );

  // Modern Education Section (no logo, add percentage)
  const renderEducationSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      {educationItems.map((item, idx) => (
        <View key={idx} style={styles.eduCard}>
          <View style={styles.eduContent}>
            {/* First row: Title on left, Dates on right */}
            <View style={styles.eduRow}>
              <Text style={styles.eduTitle}>
                {item.institute || `${item.type} Education`}
              </Text>
              <Text style={styles.eduMeta}>
                {formatDate(item.startDate || item.year)}
                {item.endDate ? ` - ${formatDate(item.endDate)}` : ''}
              </Text>
            </View>

            {/* Second row: Board/Degree + Percentage */}
            <View style={styles.eduRow}>
              {item.degree && (
                <Text style={styles.eduDegree}>
                  {item.degree}{item.field ? ` - ${item.field}` : ''}
                </Text>
              )}
              {item.percentage && (
                <Text style={styles.eduMeta}>{item.percentage}%</Text>
              )}
            </View>
          </View>

        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Card (key-value pairs) */}
      <View style={styles.profileCardRedesigned}>
        {/* Name, Role, and Initials/Image */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user.full_name}</Text>
            <Text style={styles.profileRole}>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}</Text>
          </View>
          {user.profile_image ? (
            <Image
              source={{ uri: user.profile_image }}
              style={styles.profileInitialsCircle}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileInitialsCircle}>
              <Text style={styles.profileInitialsText}>{user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : ''}</Text>
            </View>
          )}
        </View>
        {/* Key-Value Pairs */}
        <View style={styles.profileKVContainer}>
          <View style={styles.profileKVItem}><Text style={styles.profileKVLabel}>Location</Text><Text style={styles.profileKVValue}>{user.city || 'N/A'}, {user.country || ''}</Text></View>
          <View style={styles.profileKVItem}><Text style={styles.profileKVLabel}>Experience</Text><Text style={styles.profileKVValue}>{user.experience_years || 'Not specified'}</Text></View>
          <View style={styles.profileKVItem}><Text style={styles.profileKVLabel}>Education</Text><Text style={styles.profileKVValue}>{user.highest_education || 'Not specified'}</Text></View>
        </View>
      </View>

      {/* Contact Details Card */}
      <View style={styles.sectionCardRedesigned}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View>
          <Text style={styles.sectionTitleRedesigned}>Contact Details</Text>
          <Text style={styles.sectionSubText}>{(interested || showContactInfo) ? 'Marked as Interested' : 'Mark as Interested'}</Text>
          </View>
          {(interested || showContactInfo) && (
            <View style={styles.interestedPill}>
              <Text style={styles.interestedPillText}>Interested</Text>
            </View>
          )}
        </View>
        


        {(interested || showContactInfo) ? (
          <View style={styles.contactDetailsRow}>
            {/* Left: Phone and City */}
            <View style={styles.contactDetailsLeft}>
              <View style={styles.kvItemContactDetails}>
                <Text style={styles.kvKeyContactDetails}>Phone Number</Text>
                <Text style={styles.kvValueContactDetails}>{user.phone || '+91 98765 43210'}</Text>
              </View>
              <View style={styles.kvItemContactDetails}>
                <Text style={styles.kvKeyContactDetails}>City</Text>
                <Text style={styles.kvValueContactDetails}>{user.city || 'N/A'}</Text>
              </View>
            </View>
            {/* Right: Call and WhatsApp buttons */}
            <View style={styles.contactButtonsColumnRight}>
              <TouchableOpacity style={styles.callButtonRedesigned} onPress={makePhoneCall}>
                <Ionicons name="call" size={18} color="#fff" style={{ marginRight: 8 }} />
                {/* <Text style={styles.callButtonTextRedesigned}></Text> */}
              </TouchableOpacity>
              <TouchableOpacity style={styles.whatsappButtonRedesigned} onPress={openWhatsApp}>
                <FontAwesome5 name="whatsapp" size={18} color="#fff" style={{ marginRight: 8 }} />
                {/* <Text style={styles.whatsappButtonTextRedesigned}></Text> */}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={toggleContactVisibility}
          >
            <Text style={styles.outlineButtonText}>Show Details</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Education Section */}
      <View style={styles.sectionCardRedesigned}>
        <Text style={styles.sectionTitleRedesigned}>Education</Text>
        {educationItems.map((item, idx) => (
          <View key={idx} style={redesignedStyles.eduCardRedesigned}>
            <View style={redesignedStyles.eduCardHeader}>
              <Text style={redesignedStyles.eduCardTitle}>{item.type} Education</Text>
              <Text style={redesignedStyles.eduCardDate}>
                {item.startDate && item.endDate ? `${item.startDate} - ${item.endDate}`
                  : item.year ? `Jan ${item.year}` : ''}
              </Text>
            </View>
            <Text style={styles.eduCardMeta}>
              {item.board ? `${item.board}` : ''}
              {item.percentage ? `, ${item.percentage}%` : ''}
            </Text>
          </View>
        ))}
      </View>

      {/* Work Experience Section */}
      <View style={redesignedStyles.sectionCardRedesigned}>
        <Text style={redesignedStyles.sectionTitleRedesigned}>Work Experience</Text>
        {experienceItems.map((item, idx) => (
          <View key={idx} style={redesignedStyles.expCardRedesigned}>
            <View style={redesignedStyles.expCardHeader}>
              <Text style={redesignedStyles.expCardTitle}>{item.jobTitle}</Text>
              <Text style={redesignedStyles.expCardDate}>
                {/* {console.log(item.startDate)} */}
                {formatDate(item.startDate)} - {item.endDate === 'Present' ? 'Present' : formatDate(item.endDate)}{item.duration ? ` · ${item.duration}` : ''}
              </Text>
            </View>
            <Text style={redesignedStyles.expCardMeta}>{item.company}</Text>
            <Text style={redesignedStyles.expCardMeta}>{item.location}</Text>
          </View>
        ))}
      </View>  
      {/* {renderExperienceSection()} */}


      {/* Q&A Section */}
      <View style={styles.sectionCardRedesigned}>
        <Text style={styles.sectionTitleRedesigned}>Question & Answers</Text>
        {questionResponsesLoading ? (
          <ActivityIndicator size="small" color="#BE4145" />
        ) : questionResponses.length === 0 ? (
          <Text style={styles.sectionSubText}>No responses found.</Text>
        ) : (
          questionResponses.map((qr, idx) => (
            <View key={idx} style={styles.qaCardRedesigned}>
              <Text style={styles.qaQuestion}>Q{idx + 1}. {qr.question_text}</Text>
              <Text style={styles.qaAnswer}>A{idx + 1}. {qr.user_answer}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f2ee",
    padding: 16,
    marginBottom: 20
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    textAlign: "center",
    color: "#BE4145",
    fontSize: 16,
    marginTop: 20,
    fontFamily: "Inter-Regular",
  },
  // Profile Card Styles (from ApplicationReceived)
  jobCard: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // shadowOffset: { width: 0, height: 2 },
    // elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    marginBottom: 16,
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
  profileImage: {
    width: 62,
    height: 62,
    resizeMode: 'contain',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#BE4145"
  },
  placeholderImage: {
    width: 62,
    height: 62,
    backgroundColor: '#fff5f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 31,
  },
  imageText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    color: '#222222',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#444444',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  smallIcon: {
    marginRight: 10,
    marginLeft: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
  // Contact Card Styles
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    // elevation: 3,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    color: "#222222",
    marginBottom: 0,
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff5f3',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  interestedButton: {
    backgroundColor: '#ecfdf5',
    opacity: 0.9,
  },
  lockButtonText: {
    color: '#BE4145',
    marginLeft: 6,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
  interestedButtonText: {
    color: '#22c55e',
    marginLeft: 6,
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: '100%',
    gap: 8,
  },
  whatsappButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  contactDetails: {
    marginTop: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactLabel: {
    width: 65,
    fontSize: 14,
    color: "#444444",
    fontFamily: 'Inter-Regular',
  },
  blurredText: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
    fontFamily: 'Inter-Regular',
  },
  // Section Styles
  section: {
    marginBottom: 24,
    // backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold',
    color: "#222222",
    marginBottom: 16,
  },
  // Vertical Card Styles
  verticalCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitleContainer: {
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: "#222222",
  },
  cardDate: {
    fontSize: 14,
    color: "#666666",
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  column: {
    flex: 1,
    paddingHorizontal: 8,
  },
  keyValueItem: {
    marginBottom: 12,
  },
  keyLabel: {
    fontSize: 12,
    color: "#666666",
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 14,
    color: "#222222",
    fontFamily: 'Montserrat-SemiBold',
  },
  expCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'flex-start',
  },
  eduCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'flex-start',
  },
  expContent: { flex: 1 },
  expTitle: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  expCompany: { fontSize: 14, color: '#444', marginTop: 2 },
  expMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  expNote: { fontSize: 12, color: '#1976d2', marginTop: 4 },
  eduContent: { flex: 1 },

  eduRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },

  eduTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222'
  },

  eduDegree: {
    fontSize: 14,
    color: '#444',
    marginTop: 2
  },
  eduMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2
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
    marginRight: 8,
    marginBottom: 8,
  },
  attributeText: {
    fontSize: 12,
    color: '#444444',
    fontFamily: 'Inter-Regular',
  },
  kvContainer: {
    marginTop: 8,
  },
  kvItem: {
    marginBottom: 16,
  },
  kvKey: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  kvValue: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Montserrat-SemiBold',
  },
});

const redesignedStyles = {
  profileCardRedesigned: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
    color: '#333',
    marginBottom: 2,
  },
  profileRole: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  profileInitialsCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitialsText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#999',
  },
  profileKVContainer: {
    marginTop: 8,
  },
  profileKVItem: {
    marginBottom: 8,
    
  },
  profileKVLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  profileKVValue: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  sectionCardRedesigned: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitleRedesigned: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  sectionSubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#b4b4b4',
    marginLeft: 2,
    marginTop: -4,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#be4145',
    borderRadius: 8,
    marginVertical: 8, // fix 0 -> 8
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: '#be4145',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    fontWeight: 'bold',
    // marginVertical: 8,
  },
  disabledButton: {
    backgroundColor: '#e5e5e5',
    borderColor: '#e5e5e5',
  },
  disabledButtonText: {
    color: '#b4b4b4',
  },
  qaCardRedesigned: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  qaQuestion: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  qaAnswer: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
  },
 
  eduCardRedesigned: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  eduCardTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  eduCardMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
  },
  eduCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  eduCardDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#999',
  },
  expCardRedesigned: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  expCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  
  expCardTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 15,
    color: '#222',
    flex: 1,             // ensures title doesn’t overlap date
    marginRight: 10,
  },
  
  expCardDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    flexShrink: 0,
  },
  
  expCardMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: '#555',
    marginTop: 2,
    lineHeight: 18,
  },
  
};

Object.assign(styles, redesignedStyles);

// Add/replace styles for Contact Details redesign
const contactDetailsRedesignedStyles = {
  interestedPill: {
    // backgroundColor: '#4CAF50',
    backgroundColor: '#rgba(232, 245, 233, 1)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  interestedPillText: {
    // color: '#fff',
    color: '#rgba(46, 125, 50, 1)',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
  kvItemContactDetails: {
    marginBottom: 12,
  },
  kvKeyContactDetails: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  kvValueContactDetails: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  contactButtonsRow: {
    // flexDirection: 'row',
    // justifyContent: 'flex-start',
    // gap: 16,

    marginTop: 8,
  },
  callButtonRedesigned: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#be4145',
    // marginBottom: 8,
    // marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingLeft: 14,
    minHeight: 28, // 44 -> 28 for redesigned button
    // marginRight: 8,
    minWidth: 58,
  },
  callButtonTextRedesigned: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
  whatsappButtonRedesigned: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 8,
    paddingLeft: 16,
    // marginRight: 6,
    minWidth: 58,
    minHeight: 28, // 44 -> 28 for redesigned button
  },
  whatsappButtonTextRedesigned: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
  },
};
Object.assign(styles, contactDetailsRedesignedStyles);

// Add/replace styles for vertical button column
const contactButtonsColumnStyles = {
  contactButtonsRowColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
};
Object.assign(styles, contactButtonsColumnStyles);

// Add/replace styles for correct Contact Details layout
const contactDetailsLayoutStyles = {
  contactDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    gap: 16,
  },
  contactDetailsLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  contactButtonsColumnRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 12,
    minWidth: 120,
  },
};
Object.assign(styles, contactDetailsLayoutStyles);

export default UserDetails;