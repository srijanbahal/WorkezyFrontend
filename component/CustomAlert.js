import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const CustomAlert = ({ visible, title, message, onClose, onConfirm, type = 'info', showButton = true }) => {
  // Determine icon based on alert type
  const renderIcon = () => {
    switch(type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={60} color="#4CAF50" style={styles.icon} />;
      case 'error':
        return <MaterialIcons name="error" size={60} color="#BE4145" style={styles.icon} />;
      case 'warning':
        return <MaterialIcons name="warning" size={60} color="#FFC107" style={styles.icon} />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={60} color="#2196F3" style={styles.icon} />;
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          {renderIcon()}
          {/* <Text style={styles.titleText}>{title}</Text> */}
          <Text style={styles.message}>{message}</Text>
          {showButton && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm || onClose}
              >
                <Text style={styles.confirmButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#444444',
    marginBottom: 24,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#BE4145',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BE4145',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222222',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#BE4145',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomAlert; 