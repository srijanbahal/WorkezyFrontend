import React from 'react';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Roboto_500Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import AppRouter from './AppRoutes';
import { AuthProvider } from './utils/AuthContext';
import { Text, TextInput, LogBox, PixelRatio } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  let [fontsLoaded] = useFonts({
    RobotoRegular: Roboto_500Regular,
    RobotoBold: Roboto_700Bold,
    PoppinsRegular: Poppins_400Regular,
    PoppinsBold: Poppins_700Bold,
  });




  // 1️⃣ Disable font scaling across the app
  if (Text.defaultProps == null) Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;

  if (TextInput.defaultProps == null) TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;

  // 2️⃣ Ignore noisy warnings in production
  LogBox.ignoreLogs([
    'Warning:',  // ignore all warnings
  ]);

  // 3️⃣ Log Pixel Ratio & Font Scale (debug only)
  if (__DEV__) {
    console.log('Pixel Ratio:', PixelRatio.get());
    console.log('Font Scale:', PixelRatio.getFontScale());
  }

  // 4️⃣ Freeze random values for consistent behavior (optional)
  if (!__DEV__) {
    Math.random = () => 0.5;
  }


  return (
    <AuthProvider>
      <NavigationContainer>
        <AppRouter />
      </NavigationContainer>
    </AuthProvider>
  );
}
