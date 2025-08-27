import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoadingDots from './LoadingDots';

const LoadingIndicator = ({ 
  type = 'dots', 
  text = 'Loading...', 
  showText = true,
  children,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      {type === 'dots' ? (
        <>
          <LoadingDots size={12} color="#BE4145" spacing={8} />
          {showText && <Text style={styles.loadingText}>{text}</Text>}
        </>
      ) : (
        // For 'skeleton' type, we'll render the children (skeleton UI)
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  }
});

export default LoadingIndicator; 