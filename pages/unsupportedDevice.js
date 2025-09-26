import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import WorkezyLogo from '../assets/workezyLogo.png'; // Adjust path if needed

const UnsupportedDeviceScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={WorkezyLogo} style={styles.logo} />
      <Text style={styles.title}>Experience Optimized for Desktop</Text>
      <Text style={styles.message}>
        To access all features, please visit our website on a desktop computer.
      </Text>
      <Text style={styles.message}>
        For the best mobile experience, please download our official app.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f2ee',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
    marginBottom: 8,
  },
});

export default UnsupportedDeviceScreen;

