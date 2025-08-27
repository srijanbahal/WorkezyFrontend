import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, TextInput, ScrollView, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Animated, Easing } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import BottomNav from '../component/BottomNav';
import { getJobs } from '../utils/api';
import { BackHandler } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
// import WorkezyLogo from '../assets/workezy_logo.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyJobs } from '../utils/api';
import WorkezyLogo from '../assets/workezyLogo.png';

const NoJobsIllustration = () => (
  <View style={styles.noJobsContainer}>
    <View style={styles.iconContainer}>
      <MaterialIcons name="work-off" size={80} color="#BE4145" />
      <View style={styles.iconCircle}>
        <MaterialIcons name="search-off" size={36} color="#BE4145" />
      </View>
    </View>
    <Text style={styles.noJobsTitle}>No Jobs Found</Text>
    {/* <Text style={styles.noJobsSubtitle}>
      We couldn't find any jobs matching your criteria.{'\n'}
      Try adjusting your search filters or check back later.
    </Text> */}
  </View>
);

const JobListScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [openIndustry, setOpenIndustry] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredIndustries, setFilteredIndustries] = useState([]);
  const [searchedText, setSearchedText] = useState("");
  const [searchLocationText, setSearchLocationText] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchJobs, setSearchJobs] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const locations = [
    { city: "Bangalore", country: "India" },
    { city: "Mumbai", country: "India" },
    { city: "Kota", country: "India" },
    { city: "London", country: "UK" },
  ];

  // Sample Job Titles
  const industryItems = [
    { label: 'All', value: 'all' },
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
  ];

  useEffect(() => {
    fetchAppliedJobs();
    fetchJobs();

  }, []);

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

  useEffect(() => {
    filterNonAppliedJobs(jobs); // Re-filter when appliedJobs updates
  }, [appliedJobs, jobs]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getJobs(); // Fetch all jobs
      if (response?.data?.jobs) {
        // Sort jobs by posted_at in descending order (latest first)
        const sortedJobs = response.data.jobs.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
        setJobs(sortedJobs);
        filterNonAppliedJobs(sortedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      if (!userDetails) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }

      const parsedUser = JSON.parse(userDetails);
      const jobSeekerId = parsedUser.id;

      const response = await getMyJobs(jobSeekerId); // API call to fetch applied jobs

      if (response?.data?.success) {
        const appliedJobIds = response.data.appliedJobs.map(job => job.id); // Extract job IDs
        setAppliedJobs(appliedJobIds);
      } else {
        Alert.alert("Error", response?.data?.message || "Failed to load applied jobs.");
      }
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const filterNonAppliedJobs = (allJobs) => {
    const filtered = allJobs.filter(job => !appliedJobs.includes(job.id)); // Exclude applied jobs
    // Placeholder: get candidateProfile from AsyncStorage or props if available
    // const candidateProfile = ...
    // const relevantJobs = sortByRelevance(filtered, candidateProfile);
    setFilteredJobs(filtered);
    setSearchJobs(filtered);
  };

  const handleSearch = () => {
    // If 'All' is selected, show all jobs
    if (selectedIndustry === 'all') {
      setFilteredJobs(searchJobs);
      setOpenIndustry(false);
      return;
    }
    // Otherwise, filter by selected industry
    const filtered = searchJobs.filter((job) => {
      return job.category?.toLowerCase().includes(selectedIndustry.toLowerCase());
    });
    setFilteredJobs(filtered);
    setOpenIndustry(false);
  };

  const handleSelectIndustry = (industry) => {
    setSearchText(industry.label);
    setSearchedText(industry.value);
    setActiveDropdown(null);
  };

  const handleSelectLocation = (location) => {
    setSearchLocationText(location);
    setSelectedLocation(location);
    setActiveDropdown(null);
  };

  const handleSearchInputChange = (text) => {
    setSearchText(text);
    setActiveDropdown('industry');

    if (text.length > 0) {
      const filtered = industryItems.filter((item) =>
        item.label.toLowerCase().startsWith(text.toLowerCase())
      );
      setFilteredIndustries(filtered);
    } else {
      setFilteredIndustries(industryItems);
    }
  };

  const handleSearchLocationInputChange = (text) => {
    setSearchLocationText(text);
    setActiveDropdown('location');

    if (text.length > 0) {
      const filtered = locations.filter(loc =>
        `${loc.city}, ${loc.country}`.toLowerCase().startsWith(text.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  };

  const handleOutsidePress = () => {
    setActiveDropdown(null);
    Keyboard.dismiss();
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
      {/* Right Section - Company Logo */}
      <View style={styles.rightSection}>
        {item.company_logo ? (
          <Image source={{
            uri: item.company_logo,
          }}
            style={styles.companyLogo}
          />
        ) : (
          <View style={styles.placeholderLogo}>
            <Text style={styles.logoText}>{item.company?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'QT'}</Text>
          </View>
        )}
      </View>

      {/* Left Section - Job Details */}
      <View style={styles.leftSection}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.company}>{item.company}</Text>
      </View>

      {/* Job Attributes Row - moved out of leftSection */}
      <View style={styles.attributesContainer}>
        <View style={styles.attributeTag}>
          <Text style={styles.attributeText}>₹{item.salary}/month</Text>
        </View>
        <View style={styles.attributeTag}>
          <Text style={styles.attributeText}>{item.city}, {item.country}</Text>
        </View>
        <View style={styles.attributeTag}>
          <Text style={styles.attributeText}>{item.experience}</Text>
        </View>
        <View style={styles.attributeTag}>
          <Text style={styles.attributeText}>{item.job_type}</Text>
        </View>
      </View>

      {/* Bottom Row with Posted Date and View Details Button */}
      <View style={styles.bottomRow}>
        <Text style={styles.postedDateText}>
          Posted {getPostedTime(item.posted_at)}
        </Text>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => navigation.navigate('JobDetails', { job: item, id: item.id })}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#45A6BE" style={styles.arrowIcon} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Add a Skeleton Loader component that matches the placeholder image
  const SkeletonLoader = () => {
    return (
      <View style={styles.skeletonContainer}>
        {/* Job Card 1 */}
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonCircle} />
            <View>
              <View style={styles.skeletonTitle} />
              <View style={[styles.skeletonSubtitle, { width: '40%', marginTop: 8 }]} />
            </View>
          </View>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonTagRow}>
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
            </View>
          </View>
          <View style={styles.skeletonFooter}>
            <View style={[styles.skeletonLine, { width: '40%' }]} />
            <View style={[styles.skeletonLine, { width: '30%' }]} />
          </View>
        </View>

        {/* Job Card 2 */}
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonCircle} />
            <View>
              <View style={styles.skeletonTitle} />
              <View style={[styles.skeletonSubtitle, { width: '40%', marginTop: 8 }]} />
            </View>
          </View>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonTagRow}>
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
            </View>
          </View>
          <View style={styles.skeletonFooter}>
            <View style={[styles.skeletonLine, { width: '40%' }]} />
            <View style={[styles.skeletonLine, { width: '30%' }]} />
          </View>
        </View>

        {/* Job Card 3 */}
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonCircle} />
            <View>
              <View style={styles.skeletonTitle} />
              <View style={[styles.skeletonSubtitle, { width: '40%', marginTop: 8 }]} />
            </View>
          </View>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonBlock} />
            <View style={styles.skeletonTagRow}>
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
            </View>
          </View>
          <View style={styles.skeletonFooter}>
            <View style={[styles.skeletonLine, { width: '40%' }]} />
            <View style={[styles.skeletonLine, { width: '30%' }]} />
          </View>
        </View>
      </View>
    );
  };

  // Add these functions to handle focus events
  const handleIndustryFocus = () => {
    setShowLocationDropdown(false);
    setShowIndustryDropdown(true);
    setFilteredIndustries(industryItems);
  };

  const handleLocationFocus = () => {
    setShowIndustryDropdown(false);
    setShowLocationDropdown(true);
    setFilteredLocations(locations);
  };

  // Add a function to sort jobs by relevance (placeholder)
  const sortByRelevance = (jobs, candidateProfile) => {
    // Placeholder: Implement actual relevance logic based on candidateProfile
    // For now, just return jobs as is
    return jobs;
  };

  return (
    <>
      <View style={styles.container}>
        {/* Sticky filters container */}
        <View style={styles.topWhiteBackground}>
          <View style={styles.filters}>
            <View style={styles.filterDropdownWrapper}>
              <DropDownPicker
                open={openIndustry}
                value={selectedIndustry}
                items={industryItems}
                setOpen={setOpenIndustry}
                setValue={setSelectedIndustry}
                placeholder="Select Job Category"
                style={{ borderColor: '#e0e0e0', borderWidth: 1, minHeight: 44, height: 44 }}
                listMode="SCROLLVIEW"
                dropDownContainerStyle={{ borderColor: '#e0e0e0', borderWidth: 1, maxHeight: 220 }}
                scrollViewProps={{ persistentScrollbar: true, nestedScrollEnabled: true }}
              />
            </View>
            <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
              <Text style={styles.filterButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable content */}
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <ScrollView
            style={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContentContainer}
          >
            {loading ? (
              <SkeletonLoader />
            ) : filteredJobs.length === 0 ? (
              <NoJobsIllustration />
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
        </TouchableWithoutFeedback>
      </View>
      <BottomNav activeuser="jobseeker" />
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
    paddingHorizontal: 16,
    padding: 8,
  },
  scrollContentContainer: {
    paddingBottom: 78,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 56
  },
  header: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 24,
    textAlign: 'center',
    // color: '#222222',
  },
  searchInput: {
    height: 48,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#444444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    fontSize: 16,
    marginBottom: 1,
    color: "#444444",
    fontFamily: 'Inter-Regular',
    marginTop: 1
  },
  logoContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
    padding: 16,
  },
  logo: {
    width: "100%",
    height: 40
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    paddingVertical: 12,
    width: '100%',
  },
  filterDropdownWrapper: {
    flex: 1,
    marginRight: 8,
  },
  picker: {
    height: 48,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  jobCard: {
    flexDirection: 'column',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#b4b4b4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
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
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#fff5f3',
  },
  placeholderLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#fff5f3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  logoText: {
    fontSize: 16,
    color: '#be4145',
    fontFamily: 'Montserrat-SemiBold',
  },
  jobTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 0
  },
  company: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 24
  },
  detailText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
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
    marginRight: 8,
    marginBottom: 8,
  },
  attributeText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  postedDateText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
  viewDetailsButton: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    color: '#45A6BE',
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    marginRight: 4,
    textDecorationLine: 'underline',
  },
  arrowIcon: {
    marginLeft: 2,
  },
  dropdown1: {
    position: "absolute",
    top: 48,
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 5,
    zIndex: 2000,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: "#444444",
    fontFamily: 'Inter-Regular',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdown: {
    // marginBottom: 16,
    borderColor: "#e0e0e0",
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    zIndex: 1000,
    marginTop: 16,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    zIndex: 1000,
    // elevation: 3,
    // marginTop: 4,
  },
  filterButton: {
    backgroundColor: '#be4145',
    borderRadius: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 0,
    width: 100,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  nojobText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: "Inter-Regular",
    textAlign: 'center',
    marginTop: 48
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loaderCard: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    width: '80%',
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  loaderText: {
    fontSize: 16,
    color: '#444444',
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 10,
    textAlign: 'center',
  },
  loaderLogo: {
    width: 120,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  loaderSubText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  skeletonContainer: {
    width: '100%',
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    width: '100%',
    height: 220,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  skeletonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    marginRight: 16,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    width: '60%',
  },
  skeletonSubtitle: {
    height: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    width: '40%',
    marginTop: 8,
  },
  skeletonContent: {
    width: '100%',
    marginBottom: 16,
  },
  skeletonBlock: {
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginBottom: 12,
    width: '100%',
    display: 'none',
  },
  skeletonTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  skeletonTag: {
    height: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    width: '28%',
    marginBottom: 8,
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  noJobsContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: "70%",

  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
    alignItems: 'center',
  },
  iconCircle: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#fff5f3',
    borderRadius: 30,
    padding: 8,
    borderWidth: 2,
    borderColor: '#BE4145',
  },
  noJobsTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    textAlign: 'center',
  },
  noJobsSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  topWhiteBackground: {
    backgroundColor: '#fff', // changed
    paddingTop: 16, // from 58 to 24
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 1000,
    width: "100%",
    borderBottomWidth: 1,
    // marginTop:120,
    borderBottomColor: '#e0e0e0',
  },
});

export default JobListScreen;