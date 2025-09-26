import { useState, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';

// This function determines the device type based on screen width
const getDeviceType = () => {
  // On native platforms, we can consider it mobile.
  if (Platform.OS !== 'web') {
    return { isDesktop: false, isMobileOrTablet: true };
  }

  const windowWidth = Dimensions.get('window').width;
  
  // Any screen width greater than 1024px is considered a desktop.
  if (windowWidth >= 1024) {
    return { isDesktop: true, isMobileOrTablet: false };
  }
  
  // Otherwise, it's a mobile or tablet browser.
  return { isDesktop: false, isMobileOrTablet: true };
};

export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState(getDeviceType());

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    // Listen for changes in screen dimensions
    const subscription = Dimensions.addEventListener('change', handleResize);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  return deviceType;
};

