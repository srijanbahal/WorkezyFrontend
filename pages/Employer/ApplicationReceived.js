import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getApplicants } from '../../utils/api';

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
    { label: 'Latest Applications', value: 'latest' },
  ]);

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
        <Text style={styles.candidateRole}>{item.role || item.industry || '—'}</Text>
        {/* Attribute Tags */}
        <View style={styles.attributesContainerRedesigned}>
          {attributeTags.map((tag, idx) => (
            <View style={styles.attributeTagRedesigned} key={idx}>
              <Text style={styles.attributeTextRedesigned}>{tag}</Text>
            </View>
          ))}
        </View>
        {/* View Details Button */}
        <TouchableOpacity
          style={styles.viewDetailsButtonRedesigned}
          onPress={() => navigation.navigate('CandidateDetails', { candidateId: item.id, jobId: job.id })}
        >
          <View style={styles.buttonContentRedesigned}>
            <Text style={styles.viewDetailsTextRedesigned}>View Details</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#45a6be" style={styles.arrowIcon} />
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
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    },

  attributeTextRedesigned: {
    fontSize: 12,
    color: '#444',
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
});

export default ApplicationReceived;