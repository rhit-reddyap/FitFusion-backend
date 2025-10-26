import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';

interface NotificationsSettingsProps {
  visible: boolean;
  onClose: () => void;
}

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  workoutReminders: boolean;
  mealReminders: boolean;
  waterReminders: boolean;
  achievementNotifications: boolean;
  socialNotifications: boolean;
  marketingNotifications: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  reminderTime: string;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
}

export default function NotificationsSettings({ visible, onClose }: NotificationsSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    workoutReminders: true,
    mealReminders: true,
    waterReminders: true,
    achievementNotifications: true,
    socialNotifications: true,
    marketingNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    reminderTime: '18:00',
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    try {
      const savedSettings = await DataStorage.getData('notification_settings');
      if (savedSettings) {
        setSettings({ ...settings, ...savedSettings });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await DataStorage.saveData('notification_settings', settings);
      Alert.alert('Success', 'Notification settings saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTimeChange = (key: 'reminderTime' | 'quietStart' | 'quietEnd', value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderToggleItem = (
    title: string,
    description: string,
    key: keyof NotificationSettings,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <Ionicons name={icon as any} size={20} color="#10B981" />
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[key] as boolean}
        onValueChange={() => handleToggle(key)}
        trackColor={{ false: '#334155', true: '#10B981' }}
        thumbColor={settings[key] ? '#FFFFFF' : '#94A3B8'}
      />
    </View>
  );

  const renderTimePicker = (
    title: string,
    key: 'reminderTime' | 'quietStart' | 'quietEnd',
    description: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <Ionicons name="time" size={20} color="#10B981" />
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <TouchableOpacity style={styles.timeButton}>
        <Text style={styles.timeText}>{settings[key]}</Text>
        <Ionicons name="chevron-down" size={16} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* General Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Notifications</Text>
            
            {renderToggleItem(
              'Push Notifications',
              'Receive push notifications on your device',
              'pushNotifications',
              'notifications'
            )}
            
            {renderToggleItem(
              'Email Notifications',
              'Receive notifications via email',
              'emailNotifications',
              'mail'
            )}
          </View>

          {/* Activity Reminders */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Reminders</Text>
            
            {renderToggleItem(
              'Workout Reminders',
              'Get reminded to log your workouts',
              'workoutReminders',
              'fitness'
            )}
            
            {renderToggleItem(
              'Meal Reminders',
              'Get reminded to log your meals',
              'mealReminders',
              'restaurant'
            )}
            
            {renderToggleItem(
              'Water Reminders',
              'Get reminded to drink water',
              'waterReminders',
              'water'
            )}
          </View>

          {/* Social & Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social & Achievements</Text>
            
            {renderToggleItem(
              'Achievement Notifications',
              'Get notified when you earn achievements',
              'achievementNotifications',
              'trophy'
            )}
            
            {renderToggleItem(
              'Social Notifications',
              'Get notified about team activities and challenges',
              'socialNotifications',
              'people'
            )}
          </View>

          {/* Reports & Updates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reports & Updates</Text>
            
            {renderToggleItem(
              'Weekly Reports',
              'Receive weekly progress reports',
              'weeklyReports',
              'calendar'
            )}
            
            {renderToggleItem(
              'Monthly Reports',
              'Receive monthly progress reports',
              'monthlyReports',
              'bar-chart'
            )}
            
            {renderToggleItem(
              'Marketing Updates',
              'Receive updates about new features and tips',
              'marketingNotifications',
              'megaphone'
            )}
          </View>

          {/* Timing Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timing Settings</Text>
            
            {renderTimePicker(
              'Reminder Time',
              'reminderTime',
              'Time to send daily reminders'
            )}
            
            {renderToggleItem(
              'Quiet Hours',
              'Disable notifications during specified hours',
              'quietHours',
              'moon'
            )}
            
            {settings.quietHours && (
              <>
                {renderTimePicker(
                  'Quiet Hours Start',
                  'quietStart',
                  'When to start quiet hours'
                )}
                
                {renderTimePicker(
                  'Quiet Hours End',
                  'quietEnd',
                  'When to end quiet hours'
                )}
              </>
            )}
          </View>

          {/* Notification Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Ionicons name="notifications" size={20} color="#10B981" />
                <Text style={styles.previewTitle}>Fit Fusion AI</Text>
                <Text style={styles.previewTime}>now</Text>
              </View>
              <Text style={styles.previewText}>
                Time for your workout! 💪 You're on a 3-day streak.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    backgroundColor: '#0F172A',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginLeft: 32,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 4,
  },
  previewContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  previewTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  previewText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
});
