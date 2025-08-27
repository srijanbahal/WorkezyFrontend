import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../utils/AuthContext';

const BottomNav = ({ activeuser }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const { getUserType, isEmployerActive } = useAuth();
    const [activeTab, setActiveTab] = useState('');
    const [userType, setUserType] = useState(activeuser || 'job_seeker');

    useEffect(() => {
        // Update userType from context if available
        const currentUserType = getUserType();
        if (currentUserType) {
            setUserType(currentUserType);
        }
    }, [getUserType]);

    useEffect(() => {
        setActiveTab(route.name);
        console.log('BottomNav - Current route:', route.name);
        console.log('BottomNav - User type:', userType);
    }, [route.name, userType]);

    const jobSeekerTabs = [
        {
            name: 'Home',
            screen: 'JobList',
            icon: 'home-outline'
        },
        {
            name: 'Applied Jobs',
            screen: 'AppliedJobs',
            icon: 'briefcase-outline'
        },
        {
            name: 'Profile',
            screen: 'JobSeekerProfile',
            icon: 'person-outline'
        }
    ];

    const employerTabs = [
        {
            name: 'My Jobs',
            screen: 'MyJobs',
            icon: 'briefcase-outline'
        },
        {
            name: 'Post a Job',
            screen: 'PostJobForm',
            icon: 'add'
        },
        {
            name: 'Profile',
            screen: 'EmployerProfile',
            icon: 'person-outline'
        }
    ];

    const tabs = userType === 'employer' ? employerTabs : jobSeekerTabs;

    const handleTabPress = (screenName) => {
        try {
            // For employers, check if status is active before navigating
            if (userType === 'employer' && !isEmployerActive() && 
                (screenName === 'MyJobs' || screenName === 'PostJobForm')) {
                // Redirect to EmployerReview if status is not active
                navigation.navigate('EmployerReview');
                return;
            }
            
            // Only navigate if not already on that screen
            if (route.name !== screenName) {
                navigation.navigate(screenName);
            }
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    const renderTab = (tab, index) => {
        const isPostJob = userType === 'employer' && tab.screen === 'PostJobForm';
        const isActive = activeTab === tab.screen;

        if (isPostJob) {
            return (
                <View style={styles.centerButtonContainer} key={index}>
                    <TouchableOpacity
                        onPress={() => handleTabPress(tab.screen)}
                        style={styles.centerButton}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={32}
                            color="#ffffff"
                        />
                    </TouchableOpacity>
                    <Text style={[styles.navText, styles.centerButtonText]}>
                        {tab.name}
                    </Text>
                </View>
            );
        }

        return (
            <TouchableOpacity
                key={index}
                onPress={() => handleTabPress(tab.screen)}
                style={styles.navButton}
            >
                <Ionicons
                    name={tab.icon}
                    size={24}
                    color={isActive ? '#BE4145' : '#444444'}
                    style={{fontWeight:"bold"}}
                    
                />
                <Text style={[styles.navText, isActive && styles.activeText]}>
                    {tab.name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.bottomNav}>
                {tabs.map((tab, index) => renderTab(tab, index))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        backgroundColor: '#ffffff',
        elevation: 5,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        paddingTop: 12,
        paddingBottom: 0,
        height: 75,
    },
    navButton: {
        alignItems: 'center',
        flex: 1,
        paddingBottom: 8,
    },
    centerButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent:'center',
        marginTop: -32,
        paddingBottom: 8,
    },
    centerButton: {
        backgroundColor: '#BE4145',
        width: 72,
        height: 72,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        // elevation: 5,
        // shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        borderWidth: 6,
        borderColor: '#ffffff',
        marginBottom: 2,
    },
    navText: {
        fontSize: 13,
        color: '#444444',
        marginTop: 4,
        fontFamily: 'Inter-Regular',
        lineHeight: 18,
        paddingBottom: 4,
    },
    centerButtonText: {
        color: '#444444',
        fontFamily: 'Montserrat-SemiBold',
    },
    activeText: {
        color: '#BE4145',
        fontFamily: 'Inter-Regular'
    }
});

export default BottomNav;
