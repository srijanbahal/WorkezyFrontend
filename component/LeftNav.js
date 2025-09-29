import React from 'react';
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

    // Reordered to match the visual layout in the design: My Jobs, then Profile, then Post Job
    const employerTabs = [
        { name: 'My Jobs', screen: 'MyJobs', icon: 'briefcase-outline' },
        { name: 'Profile', screen: 'EmployerProfile', icon: 'person-outline' },
        { name: 'Post Job', screen: 'PostJobForm', icon: 'add-circle-outline' }
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

        // Conditional styling for the "Post Job" button's icon and text
        let iconColor = isActive ? '#BE4145' : '#444444';
        let textColor = isActive ? '#BE4145' : '#444444';
        let buttonStyle = styles.navButton;

        if (isPostJob) {
            iconColor = '#BE4145'; // White icon for Post Job button
            textColor = '#BE4145'; // White text for Post Job button
            buttonStyle = [styles.navButton, styles.postJobButton];
        }

        return (
            <TouchableOpacity
                key={index}
                onPress={() => handleTabPress(tab.screen)}
                style={buttonStyle}
            >
                <Ionicons
                    name={tab.icon}
                    size={isPostJob ? 24 : 24} // Adjusted icon size
                    color={iconColor}
                />
                <Text style={[styles.navText, { color: textColor }, isActive && !isPostJob && styles.activeText]}>
                    {tab.name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftNav}>
                <Image source={WorkezyLogo} style={styles.logo} />
                {/* Separator View re-added */}
                <View style={styles.separator} />
                <View style={styles.tabsContainer}>
                    {tabs.map((tab, index) => renderTab(tab, index))}
                </View>
                {/* This empty view ensures content is pushed to top/bottom with space-between */}
                <View />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 180,
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
        justifyContent: 'flex-start', // Distributes space between logo, tabs, and bottom empty view
        paddingTop: 20, // Padding at the top
        paddingBottom: 20, // Padding at the bottom
    },
    logo: {
        width: '80%',
        height: 30,
        resizeMode: 'contain',
        marginBottom: 16, // Space between logo and separator
    },
    separator: {
        height: 1,
        width: '100%',
        backgroundColor: '#e0e0e0', // Light gray color for the separator
        marginBottom: 20, // Space between separator and first tab
    },
    tabsContainer: {
        width: '100%',
        alignItems: 'center',
        // No vertical margins here, let individual buttons control their spacing
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8, // Adjusted vertical padding
        paddingHorizontal: 12,
        width: '100%',
        justifyContent: 'flex-start',
    },
    postJobButton: {
        backgroundColor: '#fff', // Solid red background
        borderRadius: 12,
        marginVertical: 15, // Vertical space around the button
        paddingVertical: 15,
        width: '85%',
        justifyContent: 'flex-start', // Center content horizontally
        alignItems: 'center', // Center content vertically
        elevation: 0, // No shadow for this button
        flexDirection: 'row', // Ensure icon and text are in a row
        borderColor : "#BE4145",
        borderWidth: 1.5,
    },
    navText: {
        fontSize: 14,
        // color is set dynamically in renderTab
        marginLeft: 12,
        fontFamily: 'Inter-Regular',
    },
    activeText: {
        color: '#BE4145', // Active tab text color
        fontFamily: 'Montserrat-SemiBold'
    }
});

export default LeftNav;