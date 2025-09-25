// WebLayout.js

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const WebLayout = ({ children }) => {
  // We only want to apply this special layout on the web.
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // On web, we wrap the app in a centered, phone-sized container.
  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // This is the gray background that fills the whole browser window
  outerContainer: {
    flex: 1,
    backgroundColor: '#f4f2ee', // A light gray background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  // This is the white, phone-like frame for your app content
  innerContainer: {
    width: '100%',
    maxWidth: 650, // Sets a fixed max-width like a phone
    height: '100%',
    maxHeight: 900, // Sets a fixed max-height
    backgroundColor: '#ffffff',
    // Adds a subtle shadow to lift the app off the background
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden', // Ensures content doesn't spill out
    borderRadius: 8, // Optional: for rounded corners
  },
});

export default WebLayout;