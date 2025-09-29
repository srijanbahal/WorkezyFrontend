import React from 'react';
// Make sure to import the Image component
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../utils/AuthContext';

// Import the logo image
import WorkezyLogo from '../assets/workezyLogo.png';

const LeftNav = ({ activeuser }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const { getUserType, isEmployerActive } = useAuth();
    const [activeTab, setActiveTab] = React.useState('');
    const [userType, setUserType] = React.useState(activeuser || 'job_seeker');

    React.useEffect(() => {
        const currentUserType = getUserType();
        if (currentUserType) {
            setUserType(currentUserType);
        }
    }, [getUserType]);

    React.useEffect(() => {
        setActiveTab(route.name);
    }, [route.name]);

    const jobSeekerTabs = [
        { name: 'Home', screen: 'JobList', icon: 'home-outline' },
        { name: 'Applied', screen: 'AppliedJobs', icon: 'briefcase-outline' },
        { name: 'Profile', screen: 'JobSeekerProfile', icon: 'person-outline' }
    ];

    const employerTabs = [
        { name: 'My Jobs', screen: 'MyJobs', icon: 'briefcase-outline' },
        { name: 'Post Job', screen: 'PostJobForm', icon: 'add-circle-outline' },
        { name: 'Profile', screen: 'EmployerProfile', icon: 'person-outline' }
    ];

    const tabs = userType === 'employer' ? employerTabs : jobSeekerTabs;

    const handleTabPress = (screenName) => {
        try {
            if (userType === 'employer' && !isEmployerActive() && (screenName === 'MyJobs' || screenName === 'PostJobForm')) {
                navigation.navigate('EmployerReview');
                return;
            }

            if (route.name !== screenName) {
                navigation.navigate(screenName);
            }
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const renderTab = (tab, index) => {
        const isActive = activeTab === tab.screen;
        const isPostJob = userType === 'employer' && tab.screen === 'PostJobForm';

        return (
            <TouchableOpacity
                key={index}
                onPress={() => handleTabPress(tab.screen)}
                style={[styles.navButton, isPostJob && styles.postJobButton]}
            >
                <Ionicons
                    name={tab.icon}
                    size={isPostJob ? 32 : 24}
                    color={isActive ? '#BE4145' : (isPostJob ? '#FFFFFF' : '#444444')}
                />
                <Text style={[styles.navText, isActive && styles.activeText, isPostJob && styles.postJobText]}>
                    {tab.name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftNav}>
                {/* Logo added here, above the tabs */}
                <Image source={WorkezyLogo} style={styles.logo} />
                <View style={styles.tabsContainer}>
                    {tabs.map((tab, index) => renderTab(tab, index))}
                </View>
                <View></View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 150,
        zIndex: 10,
        // backgroundColor: "#fff",
    },
    leftNav: {
        flex: 1,
        backgroundColor: '#ffffff',
        elevation: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        alignItems: 'center',
        // Use space-around to push logo to top and buttons to center/bottom
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    // New style for the logo
    logo: {
        width: '80%',
        height: 50, // Adjust height as needed
        resizeMode: 'contain',
        // marginBottom: 20, // Space between logo and tabs
        // marginTop: 8,
    },
    // New container for the tabs to group them
    tabsContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: -16,
        paddingBottom: 56,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
        width: '100%',
        justifyContent: 'flex-start', // Align icon and text to the left
    },
    postJobButton: {
        backgroundColor: '#BE4145',
        borderRadius: 12,
        marginVertical: 10,
        paddingVertical: 15,
        width: '85%',
        justifyContent: 'center', // Center content for this button
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    navText: {
        fontSize: 14,
        color: '#444444',
        marginLeft: 12,
        fontFamily: 'Inter-Regular',
        marginTop: 4,
    },
    postJobText: {
        color: '#FFFFFF',
        fontFamily: 'Montserrat-SemiBold',
    },
    activeText: {
        color: '#BE4145',
        fontFamily: 'Montserrat-SemiBold'
    }
});

export default LeftNav;