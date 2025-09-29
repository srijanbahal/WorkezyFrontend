import React from 'react';
import { Platform, Text, TextInput, LogBox } from 'react-native';
import { AuthProvider } from './utils/AuthContext';
import AppRouter from './AppRoutes';
import { useDeviceType } from './utils/detectDeviceHook';
import UnsupportedDeviceScreen from './pages/unsupportedDevice';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// --- FONT IMPORTS ---
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';


const AppContent = () => {
  const { isDesktop, isMobileOrTablet } = useDeviceType();

  if (Platform.OS === 'web') {
    if (isDesktop) {
      return <AppRouter />;
    }
    if (isMobileOrTablet) {
      return <UnsupportedDeviceScreen />;
    }
  }

  return <AppRouter />;
};

export default function App() {
  // --- LOAD FONTS ---
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
  });

  // Return null or a loading screen until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  // --- IGNORE LOGS & SET DEFAULTS (Optional but good practice) ---
  if (Text.defaultProps == null) Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
  if (TextInput.defaultProps == null) TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
  LogBox.ignoreLogs(['Warning:']);

  // --- ADD THIS BLOCK ---
  // This injects a global CSS style on the web to remove the focus outline.
  if (Platform.OS === 'web') {
    const style = document.createElement('style');
    style.textContent = `
    *:focus {
      outline: none !important;
    }
  `;
    document.head.append(style);
  }
  // --- END OF BLOCK ---

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}