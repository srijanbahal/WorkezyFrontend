import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomAlert = ({ visible, title, message, type = 'info', onClose, onConfirm, showCancel = false }) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: '#4CAF50',
          backgroundColor: '#ffffff'
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: '#BE4145',
          backgroundColor: '#ffffff'
        };
      case 'warning':
        return {
          icon: 'warning',
          color: '#BE4145',
          backgroundColor: '#ffffff'
        };
      default:
        return {
          icon: 'information-circle',
          color: '#BE4145',
          backgroundColor: '#ffffff'
        };
    }
  };

  const alertStyle = getAlertStyle();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.alertContainer, { backgroundColor: alertStyle.backgroundColor }]}>
          <Ionicons 
            name={alertStyle.icon} 
            size={type === 'success' ? 48 : 48} 
            color={alertStyle.color} 
            style={[styles.icon, type === 'success' && styles.successIcon]} 
          />
          
          {/* {title && <Text style={[styles.titleText, { color: '#333', fontSize: 18 }]}>{title}</Text>} */}
          
          <Text style={[styles.message, { color: '#333' }]}>
            {message}
          </Text>
          
          {type == 'warning' && (
            <View style={styles.buttonContainer}>
              {showCancel && (
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton, { backgroundColor: alertStyle.color }]} 
                onPress={onConfirm || onClose}
              >
                <Text style={styles.confirmButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  icon: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 12,
    color: '#222222',
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8, // reduce from 24 to 8
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
    backgroundColor:"#ffffff",
    marginVertical:12
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#BE4145',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
  },
  successIcon: {
    marginBottom: 16,
    alignSelf: 'center',
  },
});

export default CustomAlert; 