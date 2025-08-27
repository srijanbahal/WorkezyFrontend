// import React, { useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import WorkezyLogo from '../assets/workezyLogo.png';
// import { useAuth } from '../utils/AuthContext';

// const { width, height } = Dimensions.get('window');

// const UserTypeSelection = ({ navigation }) => {
//   const { isLoggedIn, getUserType, isEmployerActive, user } = useAuth();

//   // Check for existing login on component mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       if (isLoggedIn()) {
//         console.log('User is already logged in, redirecting...');
//         const userType = getUserType();
//         console.log('User type detected:', userType);
        
//         // Add a small delay to ensure context is fully loaded
//         setTimeout(() => {
//           if (userType === 'employer') {
//             // Get detailed info about employer status
//             const status = user?.status || user?.Status || user?.accountStatus || 'unknown';
//             const isActive = isEmployerActive();
            
//             console.log('Employer status check:', status);
//             console.log('Is employer active:', isActive);
            
//             // Check if employer is active
//             if (isActive) {
//               console.log('Employer is active, navigating to MyJobs');
//               // Active employers go to MyJobs
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'MyJobs' }],
//               });
//             } else {
//               console.log('Employer is not active, navigating to EmployerReview');
//               // Non-active employers go to EmployerReview
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'EmployerReview' }],
//               });
//             }
//           } else {
//             console.log('Job seeker, navigating to JobList');
//             // Job seekers always go to JobList
//             navigation.reset({
//               index: 0,
//               routes: [{ name: 'JobList' }],
//             });
//           }
//         }, 100);
//       }
//     };
    
//     checkAuth();
//   }, [isLoggedIn, getUserType, isEmployerActive, navigation, user]);

//   const handleSelection = (type) => {
//     if (type === 'employer') {
//       navigation.replace('Login', { 
//         userType: 'employer',
//         activeProfile: false
//       });
//     } else {
//       navigation.replace('Login', { 
//         userType: 'job_seeker',
//         activeProfile: true
//       });
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#faf7f2" />
      
//       {/* Logo Section */}
//       <View style={styles.logoContainer}>
//         <Image source={WorkezyLogo} style={styles.logo} />
//         {/* <Text style={styles.welcomeText}>Welcome to Workezy</Text>
//         <Text style={styles.subText}>Choose your role to get started</Text> */}
//       </View>

//       {/* Cards Container */}
//       <View style={styles.cardsContainer}>
//         {/* Job Seeker Card */}
//         <TouchableOpacity 
//           style={styles.cardWrapper}
//           onPress={() => handleSelection('job_seeker')}
//           activeOpacity={0.9}
//         >
//           <LinearGradient
//             colors={['#ffffff', '#fff5f3']}
//             style={styles.cardGradient}
//           >
//             <View style={styles.cardContent}>
//               <View style={styles.iconContainerWrapper}>
//                 <View style={styles.iconContainer}>
//                   <Ionicons name="person-outline" size={32} color="#BE4145" />
//                 </View>
//               </View>
//               <View style={styles.textContainer}>
//                 <Text style={styles.cardTitle}>Job Seeker</Text>
//                 <Text style={styles.cardDescription}>
//                   Find your dream job and explore opportunities
//                 </Text>
//               </View>
//               <View style={styles.cardFooter}>
//                 <Text style={styles.getStartedText}>Get Started</Text>
//                 <Ionicons name="arrow-forward" size={20} color="#BE4145" />
//               </View>
//             </View>
//           </LinearGradient>
//         </TouchableOpacity>

//         {/* Employer Card */}
//         <TouchableOpacity 
//           style={styles.cardWrapper}
//           onPress={() => handleSelection('employer')}
//           activeOpacity={0.9}
//         >
//           <LinearGradient
//             colors={['#ffffff', '#fff5f3']}
//             style={styles.cardGradient}
//           >
//             <View style={styles.cardContent}>
//               <View style={styles.iconContainerWrapper}>
//                 <View style={styles.iconContainer}>
//                   <Ionicons name="business-outline" size={32} color="#BE4145" />
//                 </View>
//               </View>
//               <View style={styles.textContainer}>
//                 <Text style={styles.cardTitle}>Employer</Text>
//                 <Text style={styles.cardDescription}>
//                   Post jobs and find the perfect candidates
//                 </Text>
//               </View>
//               <View style={styles.cardFooter}>
//                 <Text style={styles.getStartedText}>Get Started</Text>
//                 <Ionicons name="arrow-forward" size={20} color="#BE4145" />
//               </View>
//             </View>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       {/* Footer */}
//       <View style={styles.footer}>
//         <Text style={styles.footerText}>By continuing, you agree to our </Text>
//         <View style={styles.footerLinks}>
//           <TouchableOpacity>
//             <Text style={styles.footerLink}>Terms of Service</Text>
//           </TouchableOpacity>
//           <Text style={styles.footerText}> & </Text>
//           <TouchableOpacity>
//             <Text style={styles.footerLink}>Privacy Policy</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f4f2ee',
//   },
//   logoContainer: {
//     alignItems: 'center',
//     paddingTop: height * 0.05,
//     paddingHorizontal: width * 0.01,
//   },
//   logo: {
//     width: width * 0.45,
//     height: width * 0.3,
//     resizeMode: 'contain',
//     marginBottom: height * 0.004, // Added space below logo
//   },
//   // welcomeText: {
//   //   fontSize: width * 0.06, // Slightly reduced size
//   //   fontFamily: 'Montserrat-Bold',
//   //   color: '#222222',
//   //   marginTop: height * 0.01, // Reduced margin
//   //   marginBottom: height * 0.015, // Added space between welcome and subtext
//   //   textAlign: 'center',
//   // },
//   subText: {
//     fontSize: width * 0.04,
//     fontFamily: 'Inter-Regular',
//     color: '#666666',
//     textAlign: 'center',
//   },
//   cardsContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: width * 0.06,
//     gap: height * 0.025,
//     marginTop: height * 0.01, // Added space between text and cards
//   },
//   cardWrapper: {
//     borderRadius: 16,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     backgroundColor: '#ffffff',
//     height: height * 0.25, // Fixed height based on screen height
//   },
//   cardGradient: {
//     borderRadius: 16,
//     height: '100%',
//   },
//   cardContent: {
//     flex: 1,
//     padding: width * 0.06,
//     justifyContent: 'space-between',
//   },
//   iconContainerWrapper: {
//     alignItems: 'center', // Center the icon container horizontally
//   },
//   iconContainer: {
//     width: width * 0.14,
//     height: width * 0.14,
//     borderRadius: width * 0.07,
//     backgroundColor: '#ffffff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//     marginBottom:10,
//   },
//   textContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     marginVertical:10,
//     alignItems: 'center', // Center all text horizontally
//   },
//   cardTitle: {
//     fontSize: width * 0.055, // Slightly reduced size
//     fontFamily: 'Montserrat-Bold',
//     color: '#222222',
//     textAlign: 'center', // Ensure text is centered
    
//   },
//   cardDescription: {
//     fontSize: width * 0.035,
//     fontFamily: 'Inter-Regular',
//     color: '#666666',
//     marginBottom:10,
//     textAlign: 'center', // Ensure text is centered
//   },
//   cardFooter: {
//     flexDirection: 'row',
//     justifyContent: 'center', // Center the footer content
//     alignItems: 'center',
//   },
//   getStartedText: {
//     fontSize: width * 0.04,
//     fontFamily: 'Montserrat-SemiBold',
//     color: '#BE4145',
//     marginRight: width * 0.02,
//   },
//   footer: {
//     alignItems: 'center',
//     paddingVertical: height * 0.03,
//     paddingHorizontal: width * 0.06,
//   },
//   footerText: {
//     fontSize: width * 0.035,
//     fontFamily: 'Inter-Regular',
//     color: '#666666',
//   },
//   footerLinks: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: height * 0.005,
//   },
//   footerLink: {
//     fontSize: width * 0.035,
//     fontFamily: 'Inter-Regular',
//     color: '#BE4145',
//     textDecorationLine: 'underline',
//   },
// });

// export default UserTypeSelection;