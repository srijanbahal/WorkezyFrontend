import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../component/BottomNav';
import { getMyJobs } from '../utils/api'; // Import API call function
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';
import LoadingIndicator from '../components/LoadingIndicator';
import DropDownPicker from 'react-native-dropdown-picker';

const NoJobsIllustration = () => (
  <View style={styles.noJobsContainer}>
    <View style={styles.iconContainer}>
      <MaterialIcons name="work-off" size={80} color="#BE4145" />
      <View style={styles.iconCircle}>
        <MaterialIcons name="search-off" size={36} color="#BE4145" />
      </View>
    </View>
    <Text style={styles.noJobsTitle}>No Jobs Applied</Text>
  </View>
);

const AppliedJobsScreen = ({ navigation }) => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    message: '',
    type: 'info'
  });

  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Applied', value: 'applied' },
    { label: 'Interested', value: 'Interested' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Expired', value: 'Expired' },
  ];

  const showAlert = (message, type = 'info') => {
    setAlertConfig({
      visible: true,
      message,
      type
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (!userDetails) {
          showAlert('User not found. Please log in again.', 'error');
          return;
        }

        const parsedUser = JSON.parse(userDetails);
        const jobSeekerId = parsedUser.id;

        const response = await getMyJobs(jobSeekerId); // API Call

        if (response?.data?.success) {
          let jobs = response.data.appliedJobs || [];

          // 🔹 Sort Jobs by `appliedAt` (Most Recent First)
          // Sort jobs in descending order (most recent first)
          jobs.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));

          setAppliedJobs(jobs);
          setFilteredJobs(jobs);
        } else {
          showAlert(response?.data?.message || "Failed to load jobs.", 'error');
        }
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
        showAlert("Something went wrong. Please try again.", 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []);

  const filterJobs = (filter) => {
    setSelectedFilter(filter);
    setShowFilterDropdown(false);

    if (filter === 'All') {
      setFilteredJobs(appliedJobs);
    } else {
      const filtered = appliedJobs.filter(job => job.status === filter);
      setFilteredJobs(filtered);
    }
  };

  const renderJobItem = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={{ flexDirection: 'row', width: '100%' }}>
        {/* Logo Section (left) */}
        <View style={styles.logoSection}>
          {item.company_logo ? (
            <Image source={{ uri: item.company_logo }} style={styles.companyLogo} />
          ) : (
            <View style={styles.placeholderLogo}>
              <Text style={styles.logoText}>{item.company?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'QT'}</Text>
            </View>
          )}
        </View>
        {/* Details Section (center) */}
        <View style={[styles.detailsSection, { flex: 1 }]}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.company}>{item.company}</Text>
          <View style={styles.keywordsRow}>
            <View style={styles.keywordPill}><Text style={styles.keywordText}>{item.salary ? `₹${item.salary}/month` : '-'}</Text></View>
            <View style={styles.keywordPill}><Text style={styles.keywordText}>{item.city}</Text></View>
            <View style={styles.keywordPill}><Text style={styles.keywordText}>{item.experience || '-'}</Text></View>
            <View style={styles.keywordPill}><Text style={styles.keywordText}>{item.job_type}</Text></View>

          </View>
        </View>
        {/* Status Pill (top-right) */}
        <View style={styles.statusSection}>
          <View style={[
            styles.statusPill,
            item.status === 'Interested' ? styles.statusInterested :
              (item.status && item.status.toLowerCase() === 'applied') ? styles.statusApplied :
                item.status === 'Expired' ? styles.statusExpired :
                  item.status === 'Rejected' ? styles.statusRejected :
                    styles.statusDefault
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'Interested' ? styles.statusTextInterested :
                (item.status && item.status.toLowerCase() === 'applied') ? styles.statusTextApplied :
                  item.status === 'Expired' ? styles.statusTextExpired :
                    item.status === 'Rejected' ? styles.statusTextRejected :
                      styles.statusTextDefault
            ]}>{item.status || 'Applied'}</Text>
          </View>
        </View>
      </View>
      {/* Bottom Row with Applied Date and View Details Button - full width */}
      <View style={styles.bottomRow}>
        <Text style={styles.appliedDate}>
          Applied on {item.applied_at ? new Date(item.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
        </Text>
        <TouchableOpacity style={styles.viewDetailsButton} onPress={() => navigation.navigate('JobDetails', { job: item })}>
          <View style={styles.buttonContent}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#45A6BE" style={styles.arrowIcon} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        {/* Sticky filters container */}
        <View style={styles.topWhiteBackground}>
          <View style={styles.filters}>
            <View style={styles.filterDropdownWrapper}>
              <DropDownPicker
                open={openFilter}
                value={selectedFilter}
                items={filterOptions}
                setOpen={setOpenFilter}
                setValue={setSelectedFilter}
                placeholder="Select Status"
                style={{ borderColor: '#e0e0e0', borderWidth: 1, minHeight: 44, height: 44 }}
                listMode="SCROLLVIEW"
                dropDownContainerStyle={{ borderColor: '#e0e0e0', borderWidth: 1, zIndex: 2000 }}
                textStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#333' }}
                labelStyle={{ fontFamily: 'Inter-Regular', fontSize: 16, color: '#333' }}
                selectedItemLabelStyle={{ color: '#be4145', fontFamily: 'Montserrat-SemiBold' }}
                zIndex={2000}
              />
            </View>
            <TouchableOpacity style={styles.filterButton} onPress={() => filterJobs(selectedFilter)}>
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContentContainer}
        >
          {loading ? (
            <LoadingIndicator type="skeleton">
              <SkeletonLoader />
            </LoadingIndicator>
          ) : filteredJobs.length > 0 ? (
            <FlatList
              data={filteredJobs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderJobItem}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 8 }}
            />
          ) : (
            <NoJobsIllustration />
          )}
        </ScrollView>
      </View>
      <BottomNav userType={'job_seeker'} />
      <CustomAlert
        visible={alertConfig.visible}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </>
  );
};

// Add a Skeleton Loader component that matches the applied jobs layout
const SkeletonLoader = () => {
  return (
    <View style={styles.skeletonContainer}>
      {/* Applied Job Card 1 */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonContent}>
          <View>
            <View style={styles.skeletonTitle} />
            <View style={[styles.skeletonSubtitle, { marginTop: 8 }]} />
            <View style={styles.skeletonTagRow}>
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
            </View>
            <View style={styles.skeletonStatusRow}>
              <View style={[styles.skeletonDate, { width: '50%' }]} />
              <View style={styles.skeletonStatus} />
            </View>
          </View>
        </View>
        <View style={styles.skeletonLogoSection}>
          <View style={styles.skeletonLogo} />
        </View>
      </View>

      {/* Applied Job Card 2 */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonContent}>
          <View>
            <View style={styles.skeletonTitle} />
            <View style={[styles.skeletonSubtitle, { marginTop: 8 }]} />
            <View style={styles.skeletonTagRow}>
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
            </View>
            <View style={styles.skeletonStatusRow}>
              <View style={[styles.skeletonDate, { width: '50%' }]} />
              <View style={styles.skeletonStatus} />
            </View>
          </View>
        </View>
        <View style={styles.skeletonLogoSection}>
          <View style={styles.skeletonLogo} />
        </View>
      </View>

      {/* Applied Job Card 3 */}
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonContent}>
          <View>
            <View style={styles.skeletonTitle} />
            <View style={[styles.skeletonSubtitle, { marginTop: 8 }]} />
            <View style={styles.skeletonTagRow}>
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
              <View style={styles.skeletonTag} />
            </View>
            <View style={styles.skeletonStatusRow}>
              <View style={[styles.skeletonDate, { width: '50%' }]} />
              <View style={styles.skeletonStatus} />
            </View>
          </View>
        </View>
        <View style={styles.skeletonLogoSection}>
          <View style={styles.skeletonLogo} />
        </View>
      </View>
    </View>
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
    paddingHorizontal: 8,
  },
  scrollContentContainer: {
    paddingBottom: 78,
  },
  topWhiteBackground: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 8,
    zIndex: 1000,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  filterButton: {
    backgroundColor: '#be4145',
    borderRadius: 8,
    minHeight: 44,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#b4b4b4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#b4b4b4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2000,
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'transparent',
  },
  selectedDropdownItem: {
    backgroundColor: '#fff5f3',
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  selectedDropdownItemText: {
    color: '#be4145',
    fontFamily: 'Montserrat-SemiBold',
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
  logoSection: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  companyLogo: {
    width: 44,
    height: 44,
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
  detailsSection: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // gap: 8, // Remove this, not supported in React Native
    marginBottom: 8,
    // No width restriction, let it fill available space
  },
  keywordPill: {
    backgroundColor: '#f9f9f9', // match JobListScreen
    borderRadius: 100,
    paddingVertical: 6, // match JobListScreen
    paddingHorizontal: 12, // match JobListScreen
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  keywordText: {
    fontSize: 12,
    color: '#666', // match JobListScreen
    fontFamily: 'Inter-Regular',
  },
  dateStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
    marginBottom: 2,
  },
  appliedDate: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Inter-Regular',
    marginBottom: 0,
    marginRight: 8,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    padding: 0,
  },
  viewDetailsText: {
    color: '#45A6BE',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    marginRight: 4,
    textDecorationLine: 'underline',
  },
  statusSection: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginLeft: 8,
    marginTop: 2,
    minWidth: 80,
  },
  statusPill: {
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginTop: 0,
    alignSelf: 'flex-end',
    minWidth: 70,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  statusInterested: {
    backgroundColor: '#e8f5e9',
  },
  statusApplied: {
    backgroundColor: '#fff8e1',
  },
  statusExpired: {
    backgroundColor: '#b4b4b4',
  },
  statusRejected: {
    backgroundColor: '#fff5f3',
  },
  statusDefault: {
    backgroundColor: '#b4b4b4',
  },
  statusTextInterested: {
    color: '#2e7d32',
  },
  statusTextApplied: {
    color: '#f57c00',
  },
  statusTextRejected: {
    color: '#be4145',
  },
  statusTextExpired: {
    color: '#666666',
  },
  statusTextDefault: {
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center'
  },
  skeletonContainer: {
    width: '100%',
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    alignItems: 'flex-start',
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 20,
  },
  skeletonLogoSection: {
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonLogo: {
    width: 62,
    height: 62,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  skeletonTitle: {
    height: 22,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    width: '80%',
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    width: '50%',
    marginBottom: 14,
  },
  skeletonTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  skeletonTag: {
    height: 24,
    width: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 100,
    marginRight: 8,
    marginBottom: 6,
  },
  skeletonStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  skeletonDate: {
    height: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    width: '50%',
  },
  skeletonStatus: {
    height: 32,
    width: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 100,
  },
  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    marginLeft: 2,
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
});

export default AppliedJobsScreen;
