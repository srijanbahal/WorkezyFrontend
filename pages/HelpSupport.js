import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deactivateProfile } from '../utils/api';
import { useAuth } from '../utils/AuthContext';
import LeftNav from "../component/LeftNav";


const HelpSupport = ({ navigation }) => {
  const [alertVisible, setAlertVisible] = useState(false);
  const [successAlertVisible, setSuccessAlertVisible] = useState(false);
  const { logout } = useAuth();

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+1555123456');
  };

  const handleDeleteProfile = () => {
    setAlertVisible(true);
  };

  const confirmDeleteProfile = async () => {
    setAlertVisible(false);
    try {
      // Get user details from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userDetails');
      if (!userDataString) throw new Error('User not found');
      const userData = JSON.parse(userDataString);
      console.log(userData);
      const userId = userData.id || userData.userId || userData.job_seeker_id;
      let userType = userData.userType;
      if (!userId || !userType) throw new Error('User ID or type missing');
      userType = userType.toLowerCase().includes('employer') ? 'employer' : 'job_seeker';
      await deactivateProfile({ userId, userType });
      setSuccessAlertVisible(true);
      setTimeout(async () => {
        await logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1000);
    } catch (error) {
      console.error(error.message || 'Failed to delete profile.');
      // Optionally, show a custom error alert here
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.outerBox}>
      <LeftNav activeuser={"employer"} />

      <View style={styles.innerBox}>
        <View style={styles.manualHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              More Info
            </Text>
          </View>
        </View>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* About Us Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About Us</Text>
            <Text style={styles.sectionText}>
              We are a leading platform dedicated to connecting talented professionals with exceptional opportunities. Our mission is to revolutionize the way people find meaningful work by providing innovative tools and personalized experiences that benefit both job seekers and employers. With years of industry expertise and a commitment to excellence, we strive to create lasting partnerships that drive success for everyone involved.
            </Text>
          </View>

          {/* Contact Us Section */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.helpText}>
              Have questions or need assistance? We're here to help!
            </Text>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} style={styles.contactIcon} />
              <Text style={styles.contactText}>support@example.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} style={styles.contactIcon} />
              <Text style={styles.contactText}>+1 (555) 123-4567</Text>
            </View>
          </View>

          {/* Custom Alert for delete confirmation */}
          <CustomAlert
            visible={alertVisible}
            message="Are you sure you want to delete your account?"
            type="warning"
            onClose={() => setAlertVisible(false)}
            onConfirm={confirmDeleteProfile}
            showCancel={true}
          />
          {/* Custom Alert for success after deletion (auto-close, no button) */}
          <CustomAlert
            visible={successAlertVisible}
            title="Profile Deleted"
            message="Your profile has been deleted successfully."
            type="success"
            onClose={() => { }}
            showCancel={false}
            showButton={false}
          />
        </ScrollView>
        {/* Sticky Danger Zone Card at the bottom */}
        <View style={styles.stickyDangerCard}>
          <Text style={styles.dangerTitle}>Danger Account</Text>
          <Text style={styles.dangerText}>
            Once you delete your account, it cannot be restored.
          </Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
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
  innerBox: {
    flex: 1,
    marginHorizontal: 25,
    // marginTop: 8,
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // This centers the title container
    backgroundColor: '#ffffff', // White background
    height: 56, // A standard header height
    paddingHorizontal: 16,
    borderBottomWidth: 1, // Creates the subtle separator line
    borderBottomColor: '#e0e0e0', // Light gray color for the line
  },
  backButton: {
    position: 'absolute', // Position it independently of the title
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center', // Center the icon vertically
    zIndex: 10,
    flex: 1,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center', // Center title horizontally
    justifyContent: 'center',
    zIndex: 1,
    // backgroundColor: "#333",
  },
  headerTitle: {
    color: '#333333', // Dark text color
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    padding: 16,

  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 0,
    // shadowColor: 'transparent',
    borderRadius: 16, // 12 -> 8
    borderWidth: 1,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowColor: '#000',
    borderColor: '#e0e0e0',
    elevation: 1,
    position: 'relative',
  },
  sectionTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
  },
  sectionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 0,
  },
  helpText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
  },
  contactIcon: {
    color: '#666666',
  },
  dangerSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowColor: '#000',
    borderColor: '#e0e0e0',
    elevation: 1,
    position: 'relative',
  },
  dangerTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#BE4145',
    marginBottom: 16,
  },
  dangerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: '#BE4145',
    borderRadius: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  deleteButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#ffffff',
  },
  stickyDangerCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    // alignItems: 'center',
    zIndex: 10,
  },
});

export default HelpSupport;
