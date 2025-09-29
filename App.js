// import React from 'react';
// import { useFonts } from 'expo-font';
// import { NavigationContainer } from '@react-navigation/native';
// import { Roboto_500Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
// import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
// import AppRouter from './AppRoutes';
// import { AuthProvider } from './utils/AuthContext';
// import { Text, TextInput, LogBox, PixelRatio } from 'react-native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import WebLayout from './WebLayout';

// export default function App() {
//   let [fontsLoaded] = useFonts({
//     RobotoRegular: Roboto_500Regular,
//     RobotoBold: Roboto_700Bold,
//     PoppinsRegular: Poppins_400Regular,
//     PoppinsBold: Poppins_700Bold,
//   });

//   if (Text.defaultProps == null) Text.defaultProps = {};
//   Text.defaultProps.allowFontScaling = false;

//   if (TextInput.defaultProps == null) TextInput.defaultProps = {};
//   TextInput.defaultProps.allowFontScaling = false;

//   LogBox.ignoreLogs(['Warning:']);

//   if (__DEV__) {
//     console.log('Pixel Ratio:', PixelRatio.get());
//     console.log('Font Scale:', PixelRatio.getFontScale());
//   }

//   if (!__DEV__) {
//     Math.random = () => 0.5;
//   }

//   return (
//     <SafeAreaProvider>
//       <AuthProvider>
//         <NavigationContainer>
//           <WebLayout>
//             <AppRouter />
//           </WebLayout>
//         </NavigationContainer>
//       </AuthProvider>
//     </SafeAreaProvider>
//   );
// }



import React from 'react';
import { Platform } from 'react-native';
import { AuthProvider } from './utils/AuthContext';
import AppRouter from './AppRoutes';
import { useDeviceType } from './utils/detectDeviceHook';
import UnsupportedDeviceScreen from './pages/unsupportedDevice';
import WebLayout from './WebLayout'; // Import your modified WebLayout
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Import NavigationContainer here
import { NavigationContainer } from '@react-navigation/native';

const AppContent = () => {
  const { isDesktop, isMobileOrTablet } = useDeviceType();

  if (Platform.OS === 'web') {
    if (isDesktop) {
      // On desktop, show the router inside the layout
      return (
        // <WebLayout>
          <AppRouter />
        // </WebLayout>
      );
    }
    if (isMobileOrTablet) {
      // On mobile/tablet web, show the unsupported screen
      return <UnsupportedDeviceScreen />;
    }
  }

  // For native platforms, just show the router
  return <AppRouter />;
};

export default function App() {
  return (
    // SafeAreaProvider should be at the very top
    <SafeAreaProvider>
      <AuthProvider>
        {/* NavigationContainer wraps everything */}
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

