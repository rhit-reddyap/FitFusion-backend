import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthProvider';
import { testSupabaseConnection, testProfileUpdate } from '../utils/supabaseTest';
import PersonalInformation from './PersonalInformation';
import ChangePassword from './ChangePassword';
import NotificationsSettings from './NotificationsSettings';
import SubscriptionManagement from './SubscriptionManagement';
import { DataStorage } from '../utils/dataStorage';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export default function ProfileScreen({ onBack, onNavigate }: ProfileScreenProps) {
  const { user, signOut, applyPromoCode, isPremium, isAdmin } = useAuth();
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPremiumBenefits, setShowPremiumBenefits] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSubscriptionManagement, setShowSubscriptionManagement] = useState(false);
  const [userPersonalInfo, setUserPersonalInfo] = useState(null);

  useEffect(() => {
    loadPersonalInfo();
  }, []);

  const loadPersonalInfo = async () => {
    try {
      const personalInfo = await DataStorage.getPersonalInfo();
      setUserPersonalInfo(personalInfo);
    } catch (error) {
      console.error('Error loading personal info:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut }
      ]
    );
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      const result = await applyPromoCode(promoCode.trim());
      if (result.success) {
        Alert.alert('Success!', result.message);
        setShowPromoModal(false);
        setPromoCode('');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply promo code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const testSupabase = async () => {
    console.log('🧪 Testing Supabase connection...');
    const success = await testSupabaseConnection();
    Alert.alert(
      'Supabase Test', 
      success ? 'Connection successful! Check console for details.' : 'Connection failed! Check console for errors.'
    );
  };

  const testProfileUpdate = async () => {
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }
    
    console.log('🧪 Testing profile update...');
    const result = await testProfileUpdate(user.id);
    Alert.alert(
      'Profile Update Test', 
      result.success ? 'Update successful! Check console for details.' : `Update failed: ${result.error?.message || 'Unknown error'}`
    );
  };


  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleNotifications = () => {
    setShowNotifications(true);
  };

  const handleSubscriptionManagement = () => {
    setShowSubscriptionManagement(true);
  };


  const handlePremiumBenefits = () => {
    setShowPremiumBenefits(true);
    Alert.alert(
      'Premium Benefits',
      '✨ AI-Powered Workout Generation\n📊 Advanced Analytics & Insights\n🍽️ Unlimited Food Database Access\n💪 Custom Workout Builder\n📱 Priority Support\n🎯 Goal Tracking & Progress Reports\n💧 Water Intake Tracking\n📈 Detailed Nutrition Analysis',
      [{ text: 'OK', onPress: () => setShowPremiumBenefits(false) }]
    );
  };

  const handleHelp = () => {
    setShowHelp(true);
    Alert.alert(
      'Help & Support',
      'Need help? We\'re here for you!\n\n📧 Email: support@fitfusion.ai\n💬 Live Chat: Available 24/7\n📚 Help Center: Coming soon\n🐛 Report Bug: Use the debug section below',
      [
        { text: 'Contact Support', onPress: () => Alert.alert('Contact', 'Opening support email...') },
        { text: 'OK', onPress: () => setShowHelp(false) }
      ]
    );
  };

  const handleAbout = () => {
    setShowAbout(true);
    Alert.alert(
      'About Fit Fusion AI',
      'Version: 1.0.0\nBuild: 2024.01.15\n\nAdvanced fitness tracking with AI-powered features.\n\nBuilt with React Native & Supabase\nPowered by OpenAI GPT-4\n\n© 2024 Fit Fusion AI. All rights reserved.',
      [{ text: 'OK', onPress: () => setShowAbout(false) }]
    );
  };

  const handlePersonalInfo = () => {
    setShowPersonalInfo(true);
  };

  const handlePersonalInfoSave = (userInfo: any) => {
    setUserPersonalInfo(userInfo);
    // Refresh the dashboard if it's open
    if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  const renderProfileItem = (icon: string, title: string, value: string, onPress?: () => void) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <Ionicons name={icon as any} size={24} color="#10B981" />
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          <Text style={styles.profileItemValue}>{value}</Text>
        </View>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color="#6B7280" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.pageTitle}>Profile</Text>
          <Text style={styles.pageSubtitle}>Manage your account and settings</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handlePersonalInfo}>
          <Ionicons name="create" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>
              {userPersonalInfo?.firstName?.charAt(0)?.toUpperCase() || user?.display_name?.split(' ')[0]?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userPersonalInfo?.firstName || user?.display_name?.split(' ')[0] || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <View style={styles.badges}>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.badgeText}>Premium</Text>
                </View>
              )}
              {isAdmin && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield" size={16} color="#10B981" />
                  <Text style={styles.badgeText}>Admin</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderProfileItem('person', 'Personal Information', 'View your profile details', handlePersonalInfo)}
          {renderProfileItem('mail', 'Email', user?.email || 'user@example.com')}
          {renderProfileItem('lock-closed', 'Password', 'Change your password', handleChangePassword)}
          {renderProfileItem('notifications', 'Notifications', 'Manage notification preferences', handleNotifications)}
        </View>

        {/* Premium Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          {isPremium ? (
            <>
              {renderProfileItem('checkmark-circle', 'Premium Status', 'Active')}
              {renderProfileItem('star', 'Premium Benefits', 'View all premium features', handlePremiumBenefits)}
              {renderProfileItem('settings', 'Subscription', 'Cancel or manage subscription', handleSubscriptionManagement)}
            </>
          ) : (
            <>
              {renderProfileItem('star-outline', 'Upgrade to Premium', 'Unlock all features', () => onNavigate?.('subscription'))}
              {renderProfileItem('gift', 'Promo Code', 'Enter a promo code', () => setShowPromoModal(true))}
            </>
          )}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          {renderProfileItem('moon', 'Dark Mode', 'Always on')}
          {renderProfileItem('language', 'Language', 'English')}
          {renderProfileItem('help-circle', 'Help & Support', 'Get help', handleHelp)}
          {renderProfileItem('information-circle', 'About', 'App version 1.0.0', handleAbout)}
          
          {/* Debug/Test Section - Admin Only */}
          {isAdmin && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Debug & Testing</Text>
              </View>
              {renderProfileItem('bug', 'Test Supabase Connection', 'Check database connection', testSupabase)}
              {renderProfileItem('refresh', 'Test Profile Update', 'Test database update', testProfileUpdate)}
            </>
          )}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={24} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Promo Code Modal */}
      <Modal
        visible={showPromoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPromoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Promo Code</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPromoModal(false)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor="#6B7280"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.promoHint}>
              Try: <Text style={styles.promoCodeHint}>freshmanfriday</Text>
            </Text>

            <TouchableOpacity
              style={[styles.applyButton, loading && styles.disabledButton]}
              onPress={handlePromoCode}
              disabled={loading}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <Text style={styles.buttonText}>Applying...</Text>
                ) : (
                  <Text style={styles.buttonText}>Apply Code</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Personal Information Modal */}
      <PersonalInformation
        visible={showPersonalInfo}
        onClose={() => setShowPersonalInfo(false)}
        onSave={handlePersonalInfoSave}
      />

      {/* Change Password Modal */}
      <ChangePassword
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* Notifications Settings Modal */}
      <NotificationsSettings
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Subscription Management Modal */}
      <SubscriptionManagement
        visible={showSubscriptionManagement}
        onClose={() => setShowSubscriptionManagement(false)}
        user={user}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10B981',
    backgroundColor: '#10B98120',
    width: 80,
    height: 80,
    borderRadius: 40,
    textAlign: 'center',
    lineHeight: 80,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemText: {
    marginLeft: 12,
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  promoInputContainer: {
    marginBottom: 12,
  },
  promoInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
  },
  promoHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  promoCodeHint: {
    color: '#10B981',
    fontWeight: '600',
  },
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
