import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Ensure this library is installed
import CustomAlert from '../components/CustomAlert';

const Setting = () => {
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
      onConfirm
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handlePress = (option) => {
    showAlert(`Navigating to ${option}`, 'info', option);
  };

  const handleDeleteAccount = () => {
    showAlert(
      'Are you sure you want to delete your account? This action cannot be undone.',
      'error',
      'Delete Account',
      true,
      () => {
        // Add actual delete account logic here
        showAlert('Account deleted successfully', 'success', 'Success');
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Settings Options */}
      <View style={styles.optionsContainer}>
        {[
          { name: 'About', icon: 'information-circle-outline' },
          { name: 'Privacy Policy', icon: 'shield-outline' },
          { name: 'Terms and Policy', icon: 'document-text-outline' },
          { name: 'Report a Problem', icon: 'bug-outline' },
        ].map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handlePress(option.name)}
          >
            <Ionicons name={option.icon} size={20} color="#333" style={styles.icon} />
            <Text style={styles.optionText}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Delete Account Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Ionicons name="trash-outline" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.deleteButtonText}>Delete Account</Text>
      </TouchableOpacity>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f2ee',
    padding: 20,
    justifyContent: 'start',
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    padding: 15,
    width:350,
    margin:'auto',
    borderRadius: 8,
    marginTop:15
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10, // Add spacing between icon and text
  },
});

export default Setting;
