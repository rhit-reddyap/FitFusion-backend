import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DataStorage } from '../utils/dataStorage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';

interface PersonalInformationProps {
  visible: boolean;
  onClose: () => void;
  onSave: (userInfo: any) => void;
}

interface UserInfo {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  height: string;
  weight: string;
  heightUnit: string;
  weightUnit: string;
  fitnessGoal: string;
  activityLevel: string;
  dietaryRestrictions: string[];
  allergies: string[];
}

export default function PersonalInformation({ visible, onClose, onSave }: PersonalInformationProps) {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    heightUnit: 'cm',
    weightUnit: 'kg',
    fitnessGoal: '',
    activityLevel: '',
    dietaryRestrictions: [],
    allergies: []
  });

  const [loading, setLoading] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showHeightUnitModal, setShowHeightUnitModal] = useState(false);
  const [showWeightUnitModal, setShowWeightUnitModal] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const goalOptions = ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Maintenance', 'Athletic Performance', 'General Fitness'];
  const activityOptions = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
  const heightUnitOptions = ['cm', 'ft/in', 'in'];
  const weightUnitOptions = ['kg', 'lbs'];

  useEffect(() => {
    if (visible) {
      loadUserInfo();
    }
  }, [visible]);

  const loadUserInfo = async () => {
    try {
      // Load from Supabase first
      if (user?.id) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && !error) {
          setUserInfo(prev => ({
            ...prev,
            email: profile.email || user.email || '',
            displayName: profile.display_name || '',
            firstName: prev.firstName || '',
            lastName: prev.lastName || '',
          }));
        }
      }

      // Also load from local storage as fallback
      const savedInfo = await DataStorage.getPersonalInfo();
      if (savedInfo) {
        setUserInfo(prev => ({
          ...prev,
          ...savedInfo,
          email: prev.email || user?.email || '',
          displayName: prev.displayName || savedInfo.firstName + ' ' + savedInfo.lastName || '',
        }));
      } else {
        // Set default values
        setUserInfo(prev => ({
          ...prev,
          email: user?.email || '',
        }));
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleSave = async () => {
    if (!userInfo.displayName.trim()) {
      Alert.alert('Error', 'Please enter your display name');
      return;
    }

    if (!userInfo.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      setLoading(true);
      
      // Save to Supabase first
      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: userInfo.email,
            display_name: userInfo.displayName,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
      }

      // Also save to local storage as backup
      await DataStorage.savePersonalInfo(userInfo);
      
      onSave(userInfo);
      Alert.alert('Success', 'Personal information saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving user info:', error);
      Alert.alert('Error', 'Failed to save personal information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'dietaryRestrictions' | 'allergies', value: string) => {
    const currentArray = userInfo[field];
    if (currentArray.includes(value)) {
      setUserInfo(prev => ({
        ...prev,
        [field]: currentArray.filter(item => item !== value)
      }));
    } else {
      setUserInfo(prev => ({
        ...prev,
        [field]: [...currentArray, value]
      }));
    }
  };

  const renderInputField = (
    label: string,
    field: keyof UserInfo,
    placeholder: string,
    keyboardType: any = 'default'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        value={userInfo[field] as string}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderSelectField = (
    label: string,
    value: string,
    onPress: () => void,
    placeholder: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectButton} onPress={onPress}>
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  const renderOptionModal = (
    visible: boolean,
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    onClose: () => void
  ) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionItem}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
                {selectedValue === option && (
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
          <Text style={styles.headerTitle}>Personal Information</Text>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Name *</Text>
              <TextInput
                style={styles.textInput}
                value={userInfo.displayName}
                onChangeText={(value) => handleInputChange('displayName', value)}
                placeholder="How you want to appear in teams (e.g., John Doe)"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={userInfo.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="Enter first name"
                  placeholderTextColor="#6B7280"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={userInfo.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Enter last name"
                  placeholderTextColor="#6B7280"
                />
              </View>
            </View>

            {renderInputField('Email *', 'email', 'Enter email address', 'email-address')}
            {renderInputField('Phone', 'phone', 'Enter phone number', 'phone-pad')}
            {renderInputField('Date of Birth', 'dateOfBirth', 'MM/DD/YYYY')}
          </View>

          {/* Physical Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Physical Information</Text>
            
            {renderSelectField(
              'Gender',
              userInfo.gender,
              () => setShowGenderModal(true),
              'Select gender'
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Height</Text>
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                    value={userInfo.height}
                    onChangeText={(value) => handleInputChange('height', value)}
                    placeholder="170"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    style={styles.unitButton}
                    onPress={() => setShowHeightUnitModal(true)}
                  >
                    <Text style={styles.unitText}>{userInfo.heightUnit}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Weight</Text>
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                    value={userInfo.weight}
                    onChangeText={(value) => handleInputChange('weight', value)}
                    placeholder="70"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity 
                    style={styles.unitButton}
                    onPress={() => setShowWeightUnitModal(true)}
                  >
                    <Text style={styles.unitText}>{userInfo.weightUnit}</Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Fitness Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Goals</Text>
            
            {renderSelectField(
              'Primary Goal',
              userInfo.fitnessGoal,
              () => setShowGoalModal(true),
              'Select your fitness goal'
            )}

            {renderSelectField(
              'Activity Level',
              userInfo.activityLevel,
              () => setShowActivityModal(true),
              'Select your activity level'
            )}
          </View>

          {/* Dietary Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dietary Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dietary Restrictions</Text>
              <Text style={styles.arrayDescription}>
                Select all that apply (tap to toggle)
              </Text>
              <View style={styles.arrayContainer}>
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb', 'Mediterranean'].map((restriction) => (
                  <TouchableOpacity
                    key={restriction}
                    style={[
                      styles.arrayItem,
                      userInfo.dietaryRestrictions.includes(restriction) && styles.arrayItemSelected
                    ]}
                    onPress={() => handleArrayChange('dietaryRestrictions', restriction)}
                  >
                    <Text style={[
                      styles.arrayItemText,
                      userInfo.dietaryRestrictions.includes(restriction) && styles.arrayItemTextSelected
                    ]}>
                      {restriction}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Allergies</Text>
              <Text style={styles.arrayDescription}>
                Select all that apply (tap to toggle)
              </Text>
              <View style={styles.arrayContainer}>
                {['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish', 'Sesame'].map((allergy) => (
                  <TouchableOpacity
                    key={allergy}
                    style={[
                      styles.arrayItem,
                      userInfo.allergies.includes(allergy) && styles.arrayItemSelected
                    ]}
                    onPress={() => handleArrayChange('allergies', allergy)}
                  >
                    <Text style={[
                      styles.arrayItemText,
                      userInfo.allergies.includes(allergy) && styles.arrayItemTextSelected
                    ]}>
                      {allergy}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Option Modals */}
        {renderOptionModal(
          showGenderModal,
          'Select Gender',
          genderOptions,
          userInfo.gender,
          (value) => handleInputChange('gender', value),
          () => setShowGenderModal(false)
        )}

        {renderOptionModal(
          showGoalModal,
          'Select Fitness Goal',
          goalOptions,
          userInfo.fitnessGoal,
          (value) => handleInputChange('fitnessGoal', value),
          () => setShowGoalModal(false)
        )}

        {renderOptionModal(
          showActivityModal,
          'Select Activity Level',
          activityOptions,
          userInfo.activityLevel,
          (value) => handleInputChange('activityLevel', value),
          () => setShowActivityModal(false)
        )}

        {renderOptionModal(
          showHeightUnitModal,
          'Select Height Unit',
          heightUnitOptions,
          userInfo.heightUnit,
          (value) => handleInputChange('heightUnit', value),
          () => setShowHeightUnitModal(false)
        )}

        {renderOptionModal(
          showWeightUnitModal,
          'Select Weight Unit',
          weightUnitOptions,
          userInfo.weightUnit,
          (value) => handleInputChange('weightUnit', value),
          () => setShowWeightUnitModal(false)
        )}
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
    paddingTop: 50,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#1E293B',
  },
  row: {
    flexDirection: 'row',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
  },
  selectText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  placeholderText: {
    color: '#6B7280',
  },
  arrayDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  arrayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  arrayItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  arrayItemSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  arrayItemText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  arrayItemTextSelected: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1E293B',
    minWidth: 60,
  },
  unitText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 4,
  },
});
